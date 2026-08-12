import "server-only";

import { and, desc, eq, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import {
  companies,
  deviceActivations,
  licenses,
  plans,
  type LicenseStatus,
  type LicenseType,
} from "@/src/server/db/schema";
import { maskedLicenseKey } from "./license-key";
import {
  normalizeListParams,
  toListResult,
  type ListParams,
  type ListResult,
} from "./shared";

export type LicenseRow = {
  id: string;
  maskedKey: string;
  licenseType: LicenseType;
  status: LicenseStatus;
  companyId: string;
  companyName: string;
  companyCode: string;
  planName: string;
  startsAt: Date;
  expiresAt: Date | null;
  updatesUntil: Date | null;
  maxDevices: number;
  activeDevices: number;
  createdAt: Date;
};

/** Table-qualified on purpose — see the note in companies.ts. */
const activeDeviceCountSql = sql<number>`(
  select count(*)::int from device_activations d
  where d.license_id = licenses.id and d.status = 'ACTIVE'
)`;

function licenseFilters(search?: string, status?: string): SQL | undefined {
  const filters: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    filters.push(
      sql`(lower(${companies.name}) like ${term}
        or lower(${companies.companyCode}) like ${term}
        or lower(${licenses.licenseKeyLast4}) like ${term}
        or lower(${licenses.licenseKeyPrefix}) like ${term})`,
    );
  }
  if (status && status !== "ALL") {
    if (["MONTHLY", "YEARLY", "PERPETUAL"].includes(status)) {
      filters.push(sql`${licenses.licenseType} = ${status}::license_type`);
    } else {
      filters.push(sql`${licenses.status} = ${status}::license_status`);
    }
  }
  return filters.length ? and(...filters) : undefined;
}

export async function listLicenses(params: ListParams = {}): Promise<ListResult<LicenseRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);
  const where = licenseFilters(search, status);

  const raw = await db
    .select({
      id: licenses.id,
      licenseKeyPrefix: licenses.licenseKeyPrefix,
      licenseKeyLast4: licenses.licenseKeyLast4,
      licenseType: licenses.licenseType,
      status: licenses.status,
      companyId: licenses.companyId,
      companyName: companies.name,
      companyCode: companies.companyCode,
      planName: plans.name,
      startsAt: licenses.startsAt,
      expiresAt: licenses.expiresAt,
      updatesUntil: licenses.updatesUntil,
      maxDevices: licenses.maxDevices,
      activeDevices: activeDeviceCountSql,
      createdAt: licenses.createdAt,
    })
    .from(licenses)
    .innerJoin(companies, eq(companies.id, licenses.companyId))
    .innerJoin(plans, eq(plans.id, licenses.planId))
    .where(where)
    .orderBy(desc(licenses.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(licenses)
    .innerJoin(companies, eq(companies.id, licenses.companyId))
    .where(where);

  const rows: LicenseRow[] = raw.map(({ licenseKeyPrefix, licenseKeyLast4, ...rest }) => ({
    ...rest,
    maskedKey: maskedLicenseKey(licenseKeyPrefix, licenseKeyLast4),
  }));

  return toListResult(rows, count, page, pageSize);
}

export async function getLicenseDetail(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      license: licenses,
      companyName: companies.name,
      companyCode: companies.companyCode,
      planName: plans.name,
    })
    .from(licenses)
    .innerJoin(companies, eq(companies.id, licenses.companyId))
    .innerJoin(plans, eq(plans.id, licenses.planId))
    .where(eq(licenses.id, id))
    .limit(1);
  return row ?? null;
}

/**
 * Licenses whose expiry has passed but whose status still says ACTIVE.
 * Expiry is data, not a background job — the read path settles it so a missed
 * cron run can never leave a lapsed license reporting as active.
 */
export async function expireLapsedLicenses(): Promise<number> {
  const db = getDb();
  const result = await db
    .update(licenses)
    .set({ status: "EXPIRED", updatedAt: new Date() })
    .where(
      and(
        eq(licenses.status, "ACTIVE"),
        sql`${licenses.expiresAt} is not null`,
        sql`${licenses.expiresAt} < now()`,
      ),
    )
    .returning({ id: licenses.id });
  return result.length;
}
