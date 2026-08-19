import "server-only";

import { and, desc, eq, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import {
  companies,
  customerUsers,
  deviceActivations,
  licenses,
  plans,
  subscriptions,
  type CompanyStatus,
} from "@/src/server/db/schema";
import {
  normalizeListParams,
  toListResult,
  type ListParams,
  type ListResult,
} from "./shared";

export type CompanyRow = {
  id: string;
  companyCode: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  status: CompanyStatus;
  planName: string | null;
  subscriptionEndsAt: Date | null;
  userCount: number;
  licenseCount: number;
  deviceCount: number;
  createdAt: Date;
};

/**
 * Correlated subqueries rather than joins: a company with 3 licenses and 5
 * devices must not multiply into 15 rows and report inflated counts.
 */
/**
 * Written with explicit table-qualified names: interpolating drizzle column
 * objects into a raw `sql` template emits them UNQUALIFIED, so the correlation
 * silently binds to the inner table and every count comes back zero.
 */
const userCountSql = sql<number>`(
  select count(*)::int from customer_users cu
  where cu.company_id = companies.id
)`;

const licenseCountSql = sql<number>`(
  select count(*)::int from licenses l
  where l.company_id = companies.id and l.status = 'ACTIVE'
)`;

const deviceCountSql = sql<number>`(
  select count(*)::int from device_activations d
  where d.company_id = companies.id and d.status = 'ACTIVE'
)`;

function companyFilters(search?: string, status?: string): SQL | undefined {
  const filters: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    filters.push(
      sql`(lower(${companies.name}) like ${term}
        or lower(${companies.companyCode}) like ${term}
        or lower(coalesce(${companies.email}, '')) like ${term}
        or lower(coalesce(${companies.contactPerson}, '')) like ${term}
        or lower(coalesce(${companies.phone}, '')) like ${term})`,
    );
  }
  if (status && status !== "ALL") {
    filters.push(sql`${companies.status} = ${status}::company_status`);
  }
  return filters.length ? and(...filters) : undefined;
}

export async function listCompanies(params: ListParams = {}): Promise<ListResult<CompanyRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);
  const where = companyFilters(search, status);

  // Latest subscription per company, so the list shows the plan actually in force.
  const latestSubscription = db
    .select({
      companyId: subscriptions.companyId,
      planName: plans.name,
      endsAt: subscriptions.endsAt,
      // Qualified explicitly: `created_at` exists on both joined tables, and an
      // interpolated drizzle column renders unqualified — ambiguous reference.
      rank: sql<number>`row_number() over (
        partition by subscriptions.company_id order by subscriptions.created_at desc
      )`.as("rank"),
    })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .as("latest_subscription");

  const rows = await db
    .select({
      id: companies.id,
      companyCode: companies.companyCode,
      name: companies.name,
      contactPerson: companies.contactPerson,
      email: companies.email,
      phone: companies.phone,
      status: companies.status,
      planName: latestSubscription.planName,
      subscriptionEndsAt: latestSubscription.endsAt,
      userCount: userCountSql,
      licenseCount: licenseCountSql,
      deviceCount: deviceCountSql,
      createdAt: companies.createdAt,
    })
    .from(companies)
    .leftJoin(
      latestSubscription,
      and(eq(latestSubscription.companyId, companies.id), eq(latestSubscription.rank, 1)),
    )
    .where(where)
    .orderBy(desc(companies.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(companies)
    .where(where);

  return toListResult(rows, count, page, pageSize);
}

export async function getCompany(id: string) {
  const db = getDb();
  const [row] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return row ?? null;
}

export async function listCompanyOptions(): Promise<{ id: string; label: string }[]> {
  const db = getDb();
  const rows = await db
    .select({ id: companies.id, name: companies.name, code: companies.companyCode })
    .from(companies)
    .orderBy(companies.name);
  return rows.map((r) => ({ id: r.id, label: `${r.name} (${r.code})` }));
}

/** Sequential, human-readable code: BZX-0001, BZX-0002, … */
export async function nextCompanyCode(): Promise<string> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(companies);
  return `BZX-${String(row.count + 1).padStart(4, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Customer users                                                              */
/* -------------------------------------------------------------------------- */

export type CustomerUserRow = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isActive: boolean;
  hasPassword: boolean;
  companyId: string;
  companyName: string;
  companyCode: string;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export async function listCustomerUsers(
  params: ListParams & { companyId?: string } = {},
): Promise<ListResult<CustomerUserRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);

  const filters: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    filters.push(
      sql`(lower(${customerUsers.name}) like ${term}
        or lower(${customerUsers.email}) like ${term}
        or lower(${companies.name}) like ${term})`,
    );
  }
  if (status === "ACTIVE") filters.push(eq(customerUsers.isActive, true));
  if (status === "INACTIVE") filters.push(eq(customerUsers.isActive, false));
  if (status === "OWNER" || status === "ADMIN" || status === "MEMBER") {
    filters.push(sql`${customerUsers.role} = ${status}::customer_role`);
  }
  if (params.companyId) filters.push(eq(customerUsers.companyId, params.companyId));
  const where = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: customerUsers.id,
      name: customerUsers.name,
      email: customerUsers.email,
      role: customerUsers.role,
      isActive: customerUsers.isActive,
      hasPassword: sql<boolean>`${customerUsers.passwordHash} is not null`,
      companyId: customerUsers.companyId,
      companyName: companies.name,
      companyCode: companies.companyCode,
      lastLoginAt: customerUsers.lastLoginAt,
      createdAt: customerUsers.createdAt,
    })
    .from(customerUsers)
    .innerJoin(companies, eq(companies.id, customerUsers.companyId))
    .where(where)
    .orderBy(desc(customerUsers.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(customerUsers)
    .innerJoin(companies, eq(companies.id, customerUsers.companyId))
    .where(where);

  return toListResult(rows, count, page, pageSize);
}
