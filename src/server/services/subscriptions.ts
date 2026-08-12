import "server-only";

import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import {
  companies,
  plans,
  subscriptions,
  type BillingTypeValue,
  type SubscriptionStatus,
} from "@/src/server/db/schema";
import {
  normalizeListParams,
  toListResult,
  type ListParams,
  type ListResult,
} from "./shared";

export type SubscriptionRow = {
  id: string;
  companyId: string;
  companyName: string;
  companyCode: string;
  planId: string;
  planName: string;
  billingType: BillingTypeValue;
  priceMinor: number;
  currencyCode: string;
  status: SubscriptionStatus;
  startsAt: Date;
  endsAt: Date | null;
  graceEndsAt: Date | null;
  autoRenews: boolean;
};

function subscriptionFilters(search?: string, status?: string): SQL | undefined {
  const filters: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    filters.push(
      sql`(lower(${companies.name}) like ${term}
        or lower(${companies.companyCode}) like ${term}
        or lower(${plans.name}) like ${term})`,
    );
  }
  if (status && status !== "ALL") {
    filters.push(sql`${subscriptions.status} = ${status}::subscription_status`);
  }
  return filters.length ? and(...filters) : undefined;
}

const SELECTION = {
  id: subscriptions.id,
  companyId: subscriptions.companyId,
  companyName: companies.name,
  companyCode: companies.companyCode,
  planId: subscriptions.planId,
  planName: plans.name,
  billingType: plans.billingType,
  priceMinor: plans.priceMinor,
  currencyCode: plans.currencyCode,
  status: subscriptions.status,
  startsAt: subscriptions.startsAt,
  endsAt: subscriptions.endsAt,
  graceEndsAt: subscriptions.graceEndsAt,
  autoRenews: subscriptions.autoRenews,
};

export async function listSubscriptions(
  params: ListParams = {},
): Promise<ListResult<SubscriptionRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);
  const where = subscriptionFilters(search, status);

  const rows = await db
    .select(SELECTION)
    .from(subscriptions)
    .innerJoin(companies, eq(companies.id, subscriptions.companyId))
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(where)
    .orderBy(desc(subscriptions.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptions)
    .innerJoin(companies, eq(companies.id, subscriptions.companyId))
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(where);

  return toListResult(rows, count, page, pageSize);
}

/**
 * Renewals view: subscriptions ordered by how soon they lapse. `status=DUE`
 * narrows to the ones already inside the renewal window.
 */
export async function listRenewals(params: ListParams = {}): Promise<ListResult<SubscriptionRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);

  const filters: SQL[] = [sql`${subscriptions.endsAt} is not null`];
  if (search) {
    const term = `%${search}%`;
    filters.push(
      sql`(lower(${companies.name}) like ${term} or lower(${companies.companyCode}) like ${term})`,
    );
  }
  if (status === "DUE_7") filters.push(sql`${subscriptions.endsAt} between now() and now() + interval '7 days'`);
  else if (status === "DUE_30") filters.push(sql`${subscriptions.endsAt} between now() and now() + interval '30 days'`);
  else if (status === "OVERDUE") filters.push(sql`${subscriptions.endsAt} < now()`);
  else if (status === "AUTO") filters.push(eq(subscriptions.autoRenews, true));

  const where = and(...filters);

  const rows = await db
    .select(SELECTION)
    .from(subscriptions)
    .innerJoin(companies, eq(companies.id, subscriptions.companyId))
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(where)
    .orderBy(asc(subscriptions.endsAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptions)
    .innerJoin(companies, eq(companies.id, subscriptions.companyId))
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(where);

  return toListResult(rows, count, page, pageSize);
}

export async function getSubscription(id: string) {
  const db = getDb();
  const [row] = await db
    .select({ subscription: subscriptions, plan: plans })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(subscriptions.id, id))
    .limit(1);
  return row ?? null;
}

export async function getCurrentSubscriptionForCompany(companyId: string) {
  const db = getDb();
  const [row] = await db
    .select({ subscription: subscriptions, plan: plans })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(subscriptions.companyId, companyId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return row ?? null;
}

/**
 * Settles lapsed subscriptions on read, mirroring `expireLapsedLicenses`.
 * A subscription past its grace window is EXPIRED; past `endsAt` but still in
 * grace is GRACE_PERIOD.
 */
export async function reconcileSubscriptionStates(): Promise<void> {
  const db = getDb();
  await db
    .update(subscriptions)
    .set({ status: "GRACE_PERIOD", updatedAt: new Date() })
    .where(
      and(
        sql`${subscriptions.status} in ('ACTIVE', 'TRIALING', 'PAYMENT_DUE')`,
        sql`${subscriptions.endsAt} is not null`,
        sql`${subscriptions.endsAt} < now()`,
        sql`${subscriptions.graceEndsAt} is not null`,
        sql`${subscriptions.graceEndsAt} >= now()`,
      ),
    );

  await db
    .update(subscriptions)
    .set({ status: "EXPIRED", updatedAt: new Date() })
    .where(
      and(
        sql`${subscriptions.status} in ('ACTIVE', 'TRIALING', 'PAYMENT_DUE', 'GRACE_PERIOD')`,
        sql`${subscriptions.endsAt} is not null`,
        sql`${subscriptions.endsAt} < now()`,
        sql`(${subscriptions.graceEndsAt} is null or ${subscriptions.graceEndsAt} < now())`,
      ),
    );
}

/** Adds `months` to a date, clamping day-of-month overflow (31 Jan + 1 = 28/29 Feb). */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const targetDay = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months, 1);
  const daysInTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(targetDay, daysInTargetMonth));
  return result;
}
