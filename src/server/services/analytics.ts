import "server-only";

import { sql } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";

export type DashboardMetrics = {
  totalCompanies: number;
  activeCompanies: number;
  trialCompanies: number;
  activeLicenses: number;
  activeDevices: number;
  downloadsThisMonth: number;
  expiringIn7Days: number;
  revenueThisMonth: number;
  currencyCode: string;
};

/**
 * One round-trip for all eight dashboard tiles. Eight separate queries would
 * also work, but the dashboard is the most-hit page in the panel and each of
 * these is a trivial index scan.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const db = getDb();
  const [row] = await db.execute<{
    total_companies: number;
    active_companies: number;
    trial_companies: number;
    active_licenses: number;
    active_devices: number;
    downloads_this_month: number;
    expiring_in_7_days: number;
    revenue_this_month: string;
  }>(sql`
    select
      (select count(*)::int from companies) as total_companies,
      (select count(*)::int from companies where status = 'ACTIVE') as active_companies,
      (select count(*)::int from companies where status = 'TRIAL') as trial_companies,
      (select count(*)::int from licenses where status = 'ACTIVE') as active_licenses,
      (select count(*)::int from device_activations where status = 'ACTIVE') as active_devices,
      (select count(*)::int from download_events
         where created_at >= date_trunc('month', now())) as downloads_this_month,
      (select count(*)::int from licenses
         where status = 'ACTIVE' and expires_at is not null
           and expires_at between now() and now() + interval '7 days') as expiring_in_7_days,
      (select coalesce(sum(amount), 0)::text from payments
         where status = 'PAID' and paid_at >= date_trunc('month', now())) as revenue_this_month
  `);

  return {
    totalCompanies: Number(row.total_companies),
    activeCompanies: Number(row.active_companies),
    trialCompanies: Number(row.trial_companies),
    activeLicenses: Number(row.active_licenses),
    activeDevices: Number(row.active_devices),
    downloadsThisMonth: Number(row.downloads_this_month),
    expiringIn7Days: Number(row.expiring_in_7_days),
    revenueThisMonth: Number(row.revenue_this_month),
    currencyCode: "BDT",
  };
}

export type RevenuePoint = {
  month: string;
  label: string;
  subscription: number;
  oneTime: number;
  total: number;
};

/**
 * Twelve-month revenue split. `generate_series` supplies the month spine so
 * months with no payments render as a zero point rather than vanishing and
 * making the chart lie about the shape of the trend.
 */
export async function getRevenueSeries(monthCount = 12): Promise<RevenuePoint[]> {
  const db = getDb();
  const span = Math.max(1, Math.min(monthCount, 36)) - 1;
  const rows = await db.execute<{
    month: Date;
    subscription: string;
    one_time: string;
  }>(sql`
    with months as (
      select generate_series(
        date_trunc('month', now()) - (${span} || ' months')::interval,
        date_trunc('month', now()),
        interval '1 month'
      ) as month
    )
    select
      m.month,
      coalesce(sum(p.amount) filter (where pl.billing_type in ('MONTHLY', 'YEARLY')), 0)::text as subscription,
      coalesce(sum(p.amount) filter (where pl.billing_type = 'ONE_TIME'), 0)::text as one_time
    from months m
    left join payments p
      on p.status = 'PAID'
     and date_trunc('month', p.paid_at) = m.month
    left join subscriptions s on s.id = p.subscription_id
    left join plans pl on pl.id = s.plan_id
    group by m.month
    order by m.month
  `);

  return rows.map((row) => {
    const month = new Date(row.month);
    const subscription = Number(row.subscription);
    const oneTime = Number(row.one_time);
    return {
      month: month.toISOString().slice(0, 7),
      label: month.toLocaleDateString("en-GB", { month: "short" }),
      subscription,
      oneTime,
      total: subscription + oneTime,
    };
  });
}

export type SubscriptionMix = {
  monthly: number;
  yearly: number;
  perpetual: number;
  trial: number;
  total: number;
};

export async function getSubscriptionMix(): Promise<SubscriptionMix> {
  const db = getDb();
  const [row] = await db.execute<{
    monthly: number;
    yearly: number;
    perpetual: number;
    trial: number;
  }>(sql`
    select
      count(*) filter (where s.status = 'ACTIVE' and p.billing_type = 'MONTHLY')::int as monthly,
      count(*) filter (where s.status = 'ACTIVE' and p.billing_type = 'YEARLY')::int as yearly,
      count(*) filter (where s.status = 'ACTIVE' and p.billing_type = 'ONE_TIME')::int as perpetual,
      count(*) filter (where s.status = 'TRIALING')::int as trial
    from subscriptions s
    join plans p on p.id = s.plan_id
  `);

  const monthly = Number(row.monthly);
  const yearly = Number(row.yearly);
  const perpetual = Number(row.perpetual);
  const trial = Number(row.trial);
  return { monthly, yearly, perpetual, trial, total: monthly + yearly + perpetual + trial };
}

export type AnalyticsSummary = {
  mrr: number;
  arr: number;
  lifetimeRevenue: number;
  paidCompanies: number;
  downloads: number;
  activations: number;
  activationRate: number;
  expiring7: number;
  expiring30: number;
  avgDevicesPerLicense: number;
};

/**
 * MRR counts MONTHLY plans at full price and YEARLY at 1/12. ONE_TIME plans are
 * excluded on purpose — a perpetual licence has no recurring component, and
 * folding it in would inflate MRR with revenue that never repeats.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const db = getDb();
  const [row] = await db.execute<{
    mrr: string;
    lifetime_revenue: string;
    paid_companies: number;
    downloads: number;
    activations: number;
    expiring_7: number;
    expiring_30: number;
    avg_devices: string;
  }>(sql`
    select
      (select coalesce(sum(
          case p.billing_type
            when 'MONTHLY' then p.price_minor / 100.0
            when 'YEARLY'  then p.price_minor / 100.0 / 12.0
            else 0
          end), 0)::text
        from subscriptions s join plans p on p.id = s.plan_id
        where s.status = 'ACTIVE') as mrr,
      (select coalesce(sum(amount), 0)::text from payments where status = 'PAID') as lifetime_revenue,
      (select count(distinct company_id)::int from payments where status = 'PAID') as paid_companies,
      (select count(*)::int from download_events) as downloads,
      (select count(*)::int from device_activations) as activations,
      (select count(*)::int from licenses
        where status = 'ACTIVE' and expires_at between now() and now() + interval '7 days') as expiring_7,
      (select count(*)::int from licenses
        where status = 'ACTIVE' and expires_at between now() and now() + interval '30 days') as expiring_30,
      (select coalesce(avg(device_count), 0)::text from (
          select count(d.id)::numeric as device_count
          from licenses l
          left join device_activations d on d.license_id = l.id and d.status = 'ACTIVE'
          where l.status = 'ACTIVE'
          group by l.id
        ) per_license) as avg_devices
  `);

  const mrr = Number(row.mrr);
  const downloads = Number(row.downloads);
  const activations = Number(row.activations);

  return {
    mrr,
    arr: mrr * 12,
    lifetimeRevenue: Number(row.lifetime_revenue),
    paidCompanies: Number(row.paid_companies),
    downloads,
    activations,
    // Directional only: downloads are anonymous, so this is a ratio of two
    // counts, not a true per-visitor funnel.
    activationRate: downloads > 0 ? (activations / downloads) * 100 : 0,
    expiring7: Number(row.expiring_7),
    expiring30: Number(row.expiring_30),
    avgDevicesPerLicense: Number(row.avg_devices),
  };
}

export type VersionRow = { appVersion: string; devices: number; share: number };

export async function getVersionAdoption(): Promise<VersionRow[]> {
  const db = getDb();
  const rows = await db.execute<{ app_version: string | null; devices: number }>(sql`
    select coalesce(app_version, 'unknown') as app_version, count(*)::int as devices
    from device_activations
    where status = 'ACTIVE'
    group by 1
    order by devices desc
    limit 10
  `);

  const total = rows.reduce((sum, r) => sum + Number(r.devices), 0);
  return rows.map((r) => ({
    appVersion: r.app_version ?? "unknown",
    devices: Number(r.devices),
    share: total > 0 ? (Number(r.devices) / total) * 100 : 0,
  }));
}

export type ExpiringRow = {
  licenseId: string;
  companyName: string;
  planName: string;
  expiresAt: Date;
  daysLeft: number;
};

export async function getExpiringLicenses(days = 30): Promise<ExpiringRow[]> {
  const db = getDb();
  const rows = await db.execute<{
    license_id: string;
    company_name: string;
    plan_name: string;
    expires_at: Date;
    days_left: number;
  }>(sql`
    select l.id as license_id, c.name as company_name, p.name as plan_name,
           l.expires_at, ceil(extract(epoch from (l.expires_at - now())) / 86400)::int as days_left
    from licenses l
    join companies c on c.id = l.company_id
    join plans p on p.id = l.plan_id
    where l.status = 'ACTIVE'
      and l.expires_at is not null
      and l.expires_at between now() and now() + (${days} || ' days')::interval
    order by l.expires_at asc
    limit 50
  `);

  return rows.map((r) => ({
    licenseId: r.license_id,
    companyName: r.company_name,
    planName: r.plan_name,
    expiresAt: new Date(r.expires_at),
    daysLeft: Number(r.days_left),
  }));
}

export type RevenueByMethod = { method: string; total: number; count: number };

export async function getRevenueByMethod(): Promise<RevenueByMethod[]> {
  const db = getDb();
  const rows = await db.execute<{ payment_method: string; total: string; count: number }>(sql`
    select payment_method, coalesce(sum(amount), 0)::text as total, count(*)::int as count
    from payments
    where status = 'PAID'
    group by payment_method
    order by sum(amount) desc
  `);
  return rows.map((r) => ({
    method: r.payment_method,
    total: Number(r.total),
    count: Number(r.count),
  }));
}
