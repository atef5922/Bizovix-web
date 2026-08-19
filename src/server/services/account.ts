import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import { deviceActivations, licenses, plans } from "@/src/server/db/schema";
import { maskedLicenseKey } from "./license-key";

/**
 * Every query here is scoped by `companyId` from the session — never from a
 * request parameter. A customer must not be able to read another company's data
 * by editing a URL.
 */

export async function getAccountLicense(companyId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: licenses.id,
      licenseType: licenses.licenseType,
      status: licenses.status,
      prefix: licenses.licenseKeyPrefix,
      last4: licenses.licenseKeyLast4,
      startsAt: licenses.startsAt,
      expiresAt: licenses.expiresAt,
      updatesUntil: licenses.updatesUntil,
      supportUntil: licenses.supportUntil,
      maxDevices: licenses.maxDevices,
      planName: plans.name,
      // Table-qualified: interpolated drizzle columns render unqualified inside
      // a raw sql template, which would correlate the subquery to itself.
      activeDevices: sql<number>`(
        select count(*)::int from device_activations d
        where d.license_id = licenses.id and d.status = 'ACTIVE'
      )`,
    })
    .from(licenses)
    .innerJoin(plans, eq(plans.id, licenses.planId))
    .where(eq(licenses.companyId, companyId))
    .orderBy(desc(licenses.createdAt))
    .limit(1);

  if (!row) return null;
  return { ...row, maskedKey: maskedLicenseKey(row.prefix, row.last4) };
}

export async function listAccountDevices(companyId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: deviceActivations.id,
      deviceName: deviceActivations.deviceName,
      platform: deviceActivations.platform,
      appVersion: deviceActivations.appVersion,
      status: deviceActivations.status,
      activatedAt: deviceActivations.activatedAt,
      lastSeenAt: deviceActivations.lastSeenAt,
      licenseId: deviceActivations.licenseId,
    })
    .from(deviceActivations)
    .where(eq(deviceActivations.companyId, companyId))
    .orderBy(desc(deviceActivations.activatedAt));
  return rows;
}

/** Self-service replacements used in the trailing 30 days, for the abuse cap. */
export async function countRecentSelfServiceReplacements(companyId: string): Promise<number> {
  const db = getDb();
  const [row] = await db.execute<{ count: number }>(sql`
    select count(*)::int as count
    from audit_logs
    where company_id = ${companyId}
      and actor_type = 'CUSTOMER'
      and action in ('device.self_deactivated', 'device.self_replaced')
      and created_at >= now() - interval '30 days'
  `);
  return Number(row.count);
}

export async function getAccountDevice(companyId: string, deviceId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(deviceActivations)
    .where(
      and(eq(deviceActivations.id, deviceId), eq(deviceActivations.companyId, companyId)),
    )
    .limit(1);
  return row ?? null;
}
