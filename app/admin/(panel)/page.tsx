import Link from "next/link";
import {
  ArrowDownRight, ArrowUpRight, Building2, CalendarClock, CircleDollarSign,
  Database, Download, KeyRound, Laptop, ShieldCheck, Users,
} from "lucide-react";

import { DashboardActions, RevenuePeriodSelect } from "@/components/commercial/DashboardControls";
import { requireStaffPage } from "@/src/server/auth/guard";
import {
  getDashboardMetrics,
  getRevenueSeries,
  getSubscriptionMix,
  type RevenuePoint,
} from "@/src/server/services/analytics";
import { listAuditLogs } from "@/src/server/services/audit";
import { expireLapsedLicenses } from "@/src/server/services/licenses";
import { reconcileInvoiceStates } from "@/src/server/services/billing";
import { reconcileSubscriptionStates } from "@/src/server/services/subscriptions";
import { formatMoney, relativeTime } from "@/src/server/services/shared";
import { isEntitlementSigningConfigured } from "@/src/server/services/license-key";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ months?: string }>;
}) {
  const session = await requireStaffPage();
  const { months: monthsParam } = await searchParams;
  const months = [3, 6, 12].includes(Number(monthsParam)) ? Number(monthsParam) : 12;

  // Settle anything that has lapsed since the last view, so every number below
  // reflects reality rather than a status frozen at write time.
  await Promise.all([
    expireLapsedLicenses(),
    reconcileSubscriptionStates(),
    reconcileInvoiceStates(),
  ]);

  const [metrics, revenue, mix, activity] = await Promise.all([
    getDashboardMetrics(),
    getRevenueSeries(months),
    getSubscriptionMix(),
    listAuditLogs({ limit: 6 }),
  ]);

  const tiles = [
    { label: "Total companies", icon: Building2, value: metrics.totalCompanies, source: "Company registry", href: "/admin/companies" },
    { label: "Active companies", icon: ShieldCheck, value: metrics.activeCompanies, source: "Commercial status", href: "/admin/companies?status=ACTIVE" },
    { label: "Trial companies", icon: Users, value: metrics.trialCompanies, source: "Trial lifecycle", href: "/admin/companies?status=TRIAL" },
    { label: "Active licenses", icon: KeyRound, value: metrics.activeLicenses, source: "License registry", href: "/admin/licenses?status=ACTIVE" },
    { label: "Active devices", icon: Laptop, value: metrics.activeDevices, source: "Device activations", href: "/admin/devices?status=ACTIVE" },
    { label: "Downloads this month", icon: Download, value: metrics.downloadsThisMonth, source: "Download events", href: "/admin/downloads" },
    { label: "Expiring in 7 days", icon: CalendarClock, value: metrics.expiringIn7Days, source: "Subscription dates", href: "/admin/renewals?status=DUE_7" },
    {
      label: "Revenue this month",
      icon: CircleDollarSign,
      value: formatMoney(metrics.revenueThisMonth, metrics.currencyCode),
      source: "Settled payments",
      href: "/admin/payments?status=PAID",
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = session.user.name.split(" ")[0];

  return (
    <>
      <div className="workspace-heading">
        <div>
          <p className="workspace-eyebrow">COMMERCIAL OPERATIONS</p>
          <h1>{greeting}, {firstName}</h1>
          <span>Here’s what’s happening across the Bizovix platform.</span>
        </div>
        <div className="heading-actions">
          <DashboardActions />
        </div>
      </div>

      <section className="metric-grid" aria-label="Commercial overview">
        {tiles.map((tile, index) => {
          const Icon = tile.icon;
          return (
            <Link className="metric-card" key={tile.label} href={tile.href}>
              <div className={`metric-icon tone-${index % 4}`}>
                <Icon />
              </div>
              <span>{tile.label}</span>
              <strong>{tile.value}</strong>
              <small>
                <i className="neutral">Live</i>
                {tile.source}
              </small>
            </Link>
          );
        })}
      </section>

      <div className="dashboard-grid">
        <section className="workspace-panel revenue-panel">
          <div className="panel-head">
            <div>
              <h2>Revenue overview</h2>
              <p>Realized revenue from settled payments</p>
            </div>
            <RevenuePeriodSelect value={months} />
          </div>
          <RevenueChart points={revenue} currency={metrics.currencyCode} />
          <div className="revenue-legend">
            <span><i className="blue" />Subscription</span>
            <span><i className="teal" />One-time</span>
          </div>
        </section>

        <section className="workspace-panel">
          <div className="panel-head">
            <div>
              <h2>Subscription mix</h2>
              <p>Active commercial contracts</p>
            </div>
            <Link href="/admin/subscriptions" className="panel-link">View all</Link>
          </div>
          <SubscriptionDonut mix={mix} />
          <div className="mix-list">
            <div><span><i className="blue" />Monthly</span><strong>{mix.monthly}</strong></div>
            <div><span><i className="teal" />Yearly</span><strong>{mix.yearly}</strong></div>
            <div><span><i className="violet" />Perpetual</span><strong>{mix.perpetual}</strong></div>
            <div><span><i className="amber" />Trial</span><strong>{mix.trial}</strong></div>
          </div>
        </section>
      </div>

      <div className="dashboard-grid lower">
        <section className="workspace-panel">
          <div className="panel-head">
            <div>
              <h2>Recent activity</h2>
              <p>Security-sensitive platform events</p>
            </div>
            <Link href="/admin/activity" className="panel-link">View activity</Link>
          </div>
          {activity.rows.length === 0 ? (
            <div className="table-empty">
              <ShieldCheck />
              <strong>No activity recorded yet</strong>
              <span>Every licensing, billing and customer change will appear here.</span>
            </div>
          ) : (
            <ul className="activity-feed">
              {activity.rows.map((row) => (
                <li key={row.id}>
                  <i className="activity-dot" />
                  <div>
                    <strong>{row.summary ?? row.action}</strong>
                    <small>
                      {row.actorName ?? "System"} · {row.action} · {relativeTime(row.createdAt)}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="workspace-panel" id="backend-status">
          <div className="panel-head">
            <div>
              <h2>Platform health</h2>
              <p>Commercial service connections</p>
            </div>
          </div>
          <div className="health-list">
            <div>
              <span><i />Next.js control center</span>
              <strong className="ok">Ready <ArrowUpRight /></strong>
            </div>
            <div>
              <span><i />PostgreSQL database</span>
              <strong className="ok">Connected <ArrowUpRight /></strong>
            </div>
            <div>
              <span><i className={isEntitlementSigningConfigured() ? "" : "off"} />License signing key</span>
              {isEntitlementSigningConfigured() ? (
                <strong className="ok">Configured <ArrowUpRight /></strong>
              ) : (
                <strong>Not configured <ArrowDownRight /></strong>
              )}
            </div>
            <div>
              <span><i className="off" />Payment gateway</span>
              <strong>Manual confirmation <ArrowDownRight /></strong>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Charts — inline SVG, no client bundle                                       */
/* -------------------------------------------------------------------------- */

function RevenueChart({ points, currency }: { points: RevenuePoint[]; currency: string }) {
  const max = Math.max(...points.map((p) => p.total), 0);

  if (max === 0) {
    return (
      <div className="revenue-empty">
        <CircleDollarSign />
        <strong>No settled revenue in this period</strong>
        <p>Confirm a payment to see subscription and one-time revenue plotted here.</p>
      </div>
    );
  }

  return (
    <div className="revenue-chart" role="img" aria-label={`Revenue for the last ${points.length} months`}>
      {points.map((point) => {
        const subHeight = (point.subscription / max) * 100;
        const oneHeight = (point.oneTime / max) * 100;
        return (
          <div className="revenue-bar" key={point.month}>
            <div className="bar-stack" title={`${point.label}: ${formatMoney(point.total, currency)}`}>
              {point.oneTime > 0 ? <i className="teal" style={{ height: `${oneHeight}%` }} /> : null}
              {point.subscription > 0 ? <i className="blue" style={{ height: `${subHeight}%` }} /> : null}
            </div>
            <small>{point.label}</small>
          </div>
        );
      })}
    </div>
  );
}

function SubscriptionDonut({
  mix,
}: {
  mix: { monthly: number; yearly: number; perpetual: number; trial: number; total: number };
}) {
  if (mix.total === 0) {
    return (
      <div className="donut-empty">
        <div><span>0</span><small>Total</small></div>
      </div>
    );
  }

  const segments = [
    { value: mix.monthly, color: "#0764ee" },
    { value: mix.yearly, color: "#10a98f" },
    { value: mix.perpetual, color: "#8155dc" },
    { value: mix.trial, color: "#e4a121" },
  ];

  let cursor = 0;
  const stops = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const start = (cursor / mix.total) * 100;
      cursor += segment.value;
      const end = (cursor / mix.total) * 100;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="donut-empty" style={{ background: `conic-gradient(${stops})` }}>
      <div><span>{mix.total}</span><small>Total</small></div>
    </div>
  );
}
