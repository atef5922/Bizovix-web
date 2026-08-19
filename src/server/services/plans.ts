import "server-only";

import { and, asc, eq, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import {
  features,
  planFeatures,
  plans,
  subscriptions,
  type BillingTypeValue,
} from "@/src/server/db/schema";
import {
  normalizeListParams,
  toListResult,
  type ListParams,
  type ListResult,
} from "./shared";

export type PlanRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  billingType: BillingTypeValue;
  priceMinor: number;
  currencyCode: string;
  durationMonths: number | null;
  maxUsers: number;
  maxDevices: number;
  offlineGraceDays: number;
  isActive: boolean;
  isPublic: boolean;
  featureCount: number;
  subscriberCount: number;
  sortOrder: number;
};

/**
 * Correlated subqueries are written with explicit table-qualified names.
 * Interpolating drizzle column objects (`${planFeatures.planId}`) into a raw
 * `sql` template emits them UNQUALIFIED — `where "plan_id" = "id"` — so both
 * sides bind to the inner table and the result is silently always zero.
 */
const featureCountSql = sql<number>`(
  select count(*)::int from plan_features pf
  where pf.plan_id = plans.id and pf.enabled = true
)`;

const subscriberCountSql = sql<number>`(
  select count(*)::int from subscriptions s
  where s.plan_id = plans.id
    and s.status in ('ACTIVE', 'TRIALING', 'GRACE_PERIOD')
)`;

export async function listPlans(params: ListParams = {}): Promise<ListResult<PlanRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);

  const filters: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    filters.push(sql`(lower(${plans.name}) like ${term} or lower(${plans.code}) like ${term})`);
  }
  if (status === "ACTIVE") filters.push(eq(plans.isActive, true));
  if (status === "INACTIVE") filters.push(eq(plans.isActive, false));
  if (status === "MONTHLY" || status === "YEARLY" || status === "ONE_TIME") {
    filters.push(sql`${plans.billingType} = ${status}::billing_type`);
  }
  const where = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: plans.id,
      code: plans.code,
      name: plans.name,
      description: plans.description,
      billingType: plans.billingType,
      priceMinor: plans.priceMinor,
      currencyCode: plans.currencyCode,
      durationMonths: plans.durationMonths,
      maxUsers: plans.maxUsers,
      maxDevices: plans.maxDevices,
      offlineGraceDays: plans.offlineGraceDays,
      isActive: plans.isActive,
      isPublic: plans.isPublic,
      featureCount: featureCountSql,
      subscriberCount: subscriberCountSql,
      sortOrder: plans.sortOrder,
    })
    .from(plans)
    .where(where)
    .orderBy(asc(plans.sortOrder), asc(plans.name))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(plans)
    .where(where);

  return toListResult(rows, count, page, pageSize);
}

export async function listPlanOptions(): Promise<
  { id: string; label: string; billingType: BillingTypeValue; priceMinor: number; currencyCode: string; maxDevices: number; durationMonths: number | null }[]
> {
  const db = getDb();
  const rows = await db
    .select({
      id: plans.id,
      name: plans.name,
      code: plans.code,
      billingType: plans.billingType,
      priceMinor: plans.priceMinor,
      currencyCode: plans.currencyCode,
      maxDevices: plans.maxDevices,
      durationMonths: plans.durationMonths,
    })
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(asc(plans.sortOrder));

  return rows.map((r) => ({
    id: r.id,
    label: `${r.name} (${r.code})`,
    billingType: r.billingType,
    priceMinor: r.priceMinor,
    currencyCode: r.currencyCode,
    maxDevices: r.maxDevices,
    durationMonths: r.durationMonths,
  }));
}

export async function getPlan(id: string) {
  const db = getDb();
  const [row] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  return row ?? null;
}

export async function listFeaturesWithPlanState(planId?: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: features.id,
      key: features.key,
      name: features.name,
      moduleKey: features.moduleKey,
      sortOrder: features.sortOrder,
      enabled: planId
        ? sql<boolean>`exists (
            select 1 from plan_features pf
            where pf.feature_id = features.id
              and pf.plan_id = ${planId}
              and pf.enabled = true
          )`
        : sql<boolean>`false`,
    })
    .from(features)
    .orderBy(asc(features.sortOrder));
  return rows;
}

/** Feature keys granted by a plan — the `features` array in a signed entitlement. */
export async function planFeatureKeys(planId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ key: features.key })
    .from(planFeatures)
    .innerJoin(features, eq(features.id, planFeatures.featureId))
    .where(and(eq(planFeatures.planId, planId), eq(planFeatures.enabled, true)))
    .orderBy(asc(features.sortOrder));
  return rows.map((r) => r.key);
}
