import "server-only";

import { and, desc, eq, sql, type SQL } from "drizzle-orm";

import { getDb, type DbOrTx } from "@/src/server/db/client";
import {
  companies,
  deviceActivations,
  licenses,
  type DeviceStatus,
} from "@/src/server/db/schema";
import { maskedLicenseKey } from "./license-key";
import {
  normalizeListParams,
  toListResult,
  type ListParams,
  type ListResult,
} from "./shared";

export type DeviceRow = {
  id: string;
  deviceName: string;
  platform: string;
  appVersion: string | null;
  status: DeviceStatus;
  companyId: string;
  companyName: string;
  companyCode: string;
  licenseId: string;
  maskedKey: string;
  activatedAt: Date;
  lastSeenAt: Date | null;
  deactivatedAt: Date | null;
};

function deviceFilters(search?: string, status?: string, companyId?: string): SQL | undefined {
  const filters: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    filters.push(
      sql`(lower(${deviceActivations.deviceName}) like ${term}
        or lower(${companies.name}) like ${term}
        or lower(${companies.companyCode}) like ${term}
        or lower(coalesce(${deviceActivations.appVersion}, '')) like ${term})`,
    );
  }
  if (status && status !== "ALL") {
    filters.push(sql`${deviceActivations.status} = ${status}::device_status`);
  }
  if (companyId) filters.push(eq(deviceActivations.companyId, companyId));
  return filters.length ? and(...filters) : undefined;
}

export async function listDevices(
  params: ListParams & { companyId?: string } = {},
): Promise<ListResult<DeviceRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);
  const where = deviceFilters(search, status, params.companyId);

  const raw = await db
    .select({
      id: deviceActivations.id,
      deviceName: deviceActivations.deviceName,
      platform: deviceActivations.platform,
      appVersion: deviceActivations.appVersion,
      status: deviceActivations.status,
      companyId: deviceActivations.companyId,
      companyName: companies.name,
      companyCode: companies.companyCode,
      licenseId: deviceActivations.licenseId,
      licenseKeyPrefix: licenses.licenseKeyPrefix,
      licenseKeyLast4: licenses.licenseKeyLast4,
      activatedAt: deviceActivations.activatedAt,
      lastSeenAt: deviceActivations.lastSeenAt,
      deactivatedAt: deviceActivations.deactivatedAt,
    })
    .from(deviceActivations)
    .innerJoin(companies, eq(companies.id, deviceActivations.companyId))
    .innerJoin(licenses, eq(licenses.id, deviceActivations.licenseId))
    .where(where)
    .orderBy(desc(deviceActivations.activatedAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(deviceActivations)
    .innerJoin(companies, eq(companies.id, deviceActivations.companyId))
    .where(where);

  const rows: DeviceRow[] = raw.map(({ licenseKeyPrefix, licenseKeyLast4, ...rest }) => ({
    ...rest,
    maskedKey: maskedLicenseKey(licenseKeyPrefix, licenseKeyLast4),
  }));

  return toListResult(rows, count, page, pageSize);
}

/**
 * Activation history — the same rows as devices, ordered as an event stream and
 * including deactivated/replaced entries so the audit trail stays visible.
 */
export async function listActivations(params: ListParams = {}) {
  return listDevices({ ...params });
}

export async function getDevice(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(deviceActivations)
    .where(eq(deviceActivations.id, id))
    .limit(1);
  return row ?? null;
}

export async function countActiveDevicesForLicense(
  licenseId: string,
  db: DbOrTx = getDb(),
): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(deviceActivations)
    .where(
      and(eq(deviceActivations.licenseId, licenseId), eq(deviceActivations.status, "ACTIVE")),
    );
  return row.count;
}
