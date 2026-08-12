import "server-only";

import { and, eq, like, sql } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import { companies, deviceActivations, licenses, plans } from "@/src/server/db/schema";
import {
  checkRateLimit,
  recordAttempt,
  type AttemptOutcome,
} from "./activation-rate-limit";
import { recordAudit } from "./audit";
import { countActiveDevicesForLicense } from "./devices";
import {
  hashDeviceId,
  hashLicenseKey,
  isEntitlementSigningConfigured,
  normalizeLicenseKey,
  signEntitlement,
  type EntitlementClaims,
} from "./license-key";
import { planFeatureKeys } from "./plans";

export type ActivationErrorCode =
  | "SIGNING_NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "INVALID_KEY"
  | "LICENSE_REVOKED"
  | "LICENSE_EXPIRED"
  | "LICENSE_SUSPENDED"
  | "COMPANY_SUSPENDED"
  | "DEVICE_BLOCKED"
  | "DEVICE_REPLACED"
  | "SEAT_LIMIT_REACHED";

export type ActivationInput = {
  licenseKey: string;
  deviceHardwareId: string;
  deviceName: string;
  platform?: string;
  appVersion?: string | null;
  ip: string | null;
};

export type ActivationOutcome =
  | {
      ok: true;
      entitlement: string;
      company: { id: string; name: string; code: string };
      license: {
        id: string;
        type: string;
        expiresAt: string | null;
        maxDevices: number;
      };
      device: { id: string; status: "ACTIVE" };
    }
  | {
      ok: false;
      code: ActivationErrorCode;
      message: string;
      retryAfterSeconds?: number;
    };

class SeatLimitError extends Error {}

function fail(
  code: ActivationErrorCode,
  message: string,
  retryAfterSeconds?: number,
): ActivationOutcome {
  return { ok: false, code, message, retryAfterSeconds };
}

/**
 * Activates a license key against a device, or refreshes an already-active
 * one (heartbeat). One idempotent call the desktop app makes at startup and
 * periodically thereafter — kept as a single endpoint rather than splitting
 * activate/heartbeat to minimize the integration surface for the separately
 * maintained desktop client.
 */
export async function activateOrRefreshDevice(
  input: ActivationInput,
): Promise<ActivationOutcome> {
  // Signing must be configured before anything else: issuing an unsigned or
  // fabricated entitlement would violate verifyEntitlement()'s "null means
  // not entitled, never guess" contract, and a misconfigured deploy must not
  // burn a real seat before the signing key is even in place.
  if (!isEntitlementSigningConfigured()) {
    return fail(
      "SIGNING_NOT_CONFIGURED",
      "Licensing is not fully configured on the server. Contact support.",
    );
  }

  const normalizedKey = normalizeLicenseKey(input.licenseKey);
  if (!normalizedKey || !input.deviceHardwareId || !input.deviceName) {
    return fail("INVALID_KEY", "License key, device id and device name are required.");
  }

  const keyHash = hashLicenseKey(normalizedKey);
  const keyScope = `key:${keyHash}`;
  const ipScope = input.ip ? `ip:${input.ip}` : null;
  const scopes = [keyScope, ...(ipScope ? [ipScope] : [])];

  for (const scope of scopes) {
    const check = await checkRateLimit(scope);
    if (!check.allowed) {
      return fail("RATE_LIMITED", "Too many attempts. Try again later.", check.retryAfterSeconds);
    }
  }

  const record = (outcome: AttemptOutcome) =>
    Promise.all(scopes.map((scope) => recordAttempt(scope, outcome)));

  const db = getDb();
  const [row] = await db
    .select({ license: licenses, company: companies, plan: plans })
    .from(licenses)
    .innerJoin(companies, eq(companies.id, licenses.companyId))
    .innerJoin(plans, eq(plans.id, licenses.planId))
    .where(eq(licenses.licenseKeyHash, keyHash))
    .limit(1);

  if (!row) {
    await record("security_failure");
    return fail("INVALID_KEY", "License key not recognized.");
  }
  const { license, company, plan } = row;

  // Validated directly against columns rather than trusting `status` alone:
  // expireLapsedLicenses()/reconcileSubscriptionStates() only run when the
  // admin dashboard renders, so a lapsed license's status can be stale.
  if (license.status === "REVOKED") {
    await record("business_rejection");
    return fail("LICENSE_REVOKED", "This license has been revoked.");
  }
  if (license.expiresAt && license.expiresAt.getTime() <= Date.now()) {
    await record("business_rejection");
    return fail("LICENSE_EXPIRED", "This license has expired.");
  }
  if (license.status === "SUSPENDED") {
    await record("business_rejection");
    return fail("LICENSE_SUSPENDED", "This license is suspended. Contact support.");
  }
  if (company.status === "SUSPENDED" || company.status === "CANCELLED") {
    await record("business_rejection");
    return fail("COMPANY_SUSPENDED", "This account is suspended. Contact support.");
  }

  const deviceIdHash = hashDeviceId(input.deviceHardwareId);
  const [existingDevice] = await db
    .select()
    .from(deviceActivations)
    .where(
      and(eq(deviceActivations.licenseId, license.id), eq(deviceActivations.deviceIdHash, deviceIdHash)),
    )
    .limit(1);

  if (existingDevice?.status === "BLOCKED") {
    await record("security_failure");
    return fail("DEVICE_BLOCKED", "This device has been blocked. Contact support.");
  }
  if (existingDevice?.status === "REPLACED") {
    await record("business_rejection");
    return fail(
      "DEVICE_REPLACED",
      "This installation was migrated to a new device. Contact support if this is unexpected.",
    );
  }

  let deviceId: string;
  let auditAction: "device.activated" | "device.reactivated" | null = null;

  if (existingDevice?.status === "ACTIVE") {
    // Heartbeat fast path: a single-row update with no seat contention, so it
    // skips the advisory lock entirely — this is the highest-volume call.
    await db
      .update(deviceActivations)
      .set({
        lastSeenAt: new Date(),
        appVersion: input.appVersion ?? existingDevice.appVersion,
        deviceName: input.deviceName || existingDevice.deviceName,
        updatedAt: new Date(),
      })
      .where(eq(deviceActivations.id, existingDevice.id));
    deviceId = existingDevice.id;
  } else {
    // New device, or reactivating a DEACTIVATED one: both mutate seat
    // occupancy, so both need the seat-count check serialized against any
    // other concurrent activation for this same license.
    const outcome = await db
      .transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${license.id}::text))`);

        if (existingDevice) {
          // Reactivating a DEACTIVATED row genuinely adds back to the active
          // count, so it needs the seat check.
          const activeCount = await countActiveDevicesForLicense(license.id, tx);
          if (activeCount >= license.maxDevices) throw new SeatLimitError();

          await tx
            .update(deviceActivations)
            .set({
              status: "ACTIVE",
              deviceName: input.deviceName,
              platform: input.platform ?? existingDevice.platform,
              appVersion: input.appVersion ?? existingDevice.appVersion,
              lastSeenAt: new Date(),
              deactivatedAt: null,
              updatedAt: new Date(),
            })
            .where(eq(deviceActivations.id, existingDevice.id));
          return { id: existingDevice.id, action: "device.reactivated" as const };
        }

        // Adopt a pending placeholder left by replaceDeviceAction, if exactly
        // one exists, instead of leaking that seat forever (see docs). This
        // MUST be checked before the seat-count check below: the placeholder
        // already occupies the seat this exact machine is claiming, so
        // counting it against the limit here would wrongly reject the one
        // activation that's supposed to resolve it.
        const pending = await tx
          .select({ id: deviceActivations.id })
          .from(deviceActivations)
          .where(
            and(
              eq(deviceActivations.licenseId, license.id),
              eq(deviceActivations.status, "ACTIVE"),
              like(deviceActivations.deviceIdHash, "pending:%"),
            ),
          );

        if (pending.length === 1) {
          await tx
            .update(deviceActivations)
            .set({
              deviceIdHash,
              deviceName: input.deviceName,
              platform: input.platform ?? "windows",
              appVersion: input.appVersion ?? null,
              lastSeenAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(deviceActivations.id, pending[0].id));
          return { id: pending[0].id, action: "device.activated" as const };
        }
        if (pending.length > 1) {
          console.error(
            "[activation] multiple pending placeholder rows for license",
            license.id,
          );
        }

        // Genuinely new seat: no placeholder to adopt, so this one does
        // count against the limit.
        const activeCount = await countActiveDevicesForLicense(license.id, tx);
        if (activeCount >= license.maxDevices) throw new SeatLimitError();

        const [created] = await tx
          .insert(deviceActivations)
          .values({
            companyId: company.id,
            licenseId: license.id,
            deviceIdHash,
            deviceName: input.deviceName,
            platform: input.platform ?? "windows",
            appVersion: input.appVersion ?? null,
            status: "ACTIVE",
            lastSeenAt: new Date(),
          })
          .returning({ id: deviceActivations.id });
        return { id: created.id, action: "device.activated" as const };
      })
      .catch((error) => {
        if (error instanceof SeatLimitError) return null;
        throw error;
      });

    if (!outcome) {
      await record("business_rejection");
      return fail(
        "SEAT_LIMIT_REACHED",
        `This license has reached its device limit (${license.maxDevices}).`,
      );
    }
    deviceId = outcome.id;
    auditAction = outcome.action;
  }

  const features = await planFeatureKeys(license.planId);
  const claims: EntitlementClaims = {
    companyId: company.id,
    licenseId: license.id,
    planId: license.planId,
    licenseType: license.licenseType,
    deviceId,
    features,
    expiresAt: license.expiresAt?.toISOString() ?? null,
    updatesUntil: license.updatesUntil?.toISOString() ?? null,
    offlineGraceDays: plan.offlineGraceDays,
    issuedAt: new Date().toISOString(),
  };
  const entitlement = signEntitlement(claims);

  // Only audited on an actual state change — heartbeats refreshing an
  // already-ACTIVE device would otherwise flood the audit/activity log with
  // a row every few hours for every seat, forever.
  if (auditAction) {
    await recordAudit({
      actor: { type: "SYSTEM" },
      action: auditAction,
      entityType: "device_activation",
      entityId: deviceId,
      companyId: company.id,
      summary: `${input.deviceName} activated against ${plan.name} via the desktop app.`,
    });
  }

  await record("success");

  return {
    ok: true,
    entitlement,
    company: { id: company.id, name: company.name, code: company.companyCode },
    license: {
      id: license.id,
      type: license.licenseType,
      expiresAt: license.expiresAt?.toISOString() ?? null,
      maxDevices: license.maxDevices,
    },
    device: { id: deviceId, status: "ACTIVE" },
  };
}
