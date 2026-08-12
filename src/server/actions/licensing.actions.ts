"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireStaffCapability } from "@/src/server/auth/guard";
import { getDb } from "@/src/server/db/client";
import { companies, deviceActivations, licenses, plans } from "@/src/server/db/schema";
import { recordAudit } from "@/src/server/services/audit";
import {
  generateLicenseKey,
  hashLicenseKey,
  licenseKeyLast4,
  licenseKeyPrefix,
  type LicenseTypeCode,
} from "@/src/server/services/license-key";
import { addMonths } from "@/src/server/services/subscriptions";
import {
  actionError,
  actionOk,
  date,
  num,
  optionalStr,
  str,
  toActionError,
  type ActionState,
} from "./action-state";

const LICENSE_TYPES = ["MONTHLY", "YEARLY", "PERPETUAL"] as const;

function staffActor(session: Awaited<ReturnType<typeof requireStaffCapability>>) {
  return {
    type: "STAFF" as const,
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}

/**
 * Generates a license. The plaintext key is returned in `revealOnce` and is
 * never persisted — only a peppered hash, the prefix, and the last four
 * characters are stored, so nobody (including staff) can read it back later.
 */
export async function generateLicenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("licenses.create");

    const companyId = str(formData, "companyId");
    const planId = str(formData, "planId");
    const licenseType = str(formData, "licenseType") as LicenseTypeCode;

    if (!companyId) return actionError("Select a company.");
    if (!planId) return actionError("Select a plan.");
    if (!LICENSE_TYPES.includes(licenseType)) return actionError("Select a license type.");

    const db = getDb();
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan) return actionError("Plan not found.");

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);
    if (!company) return actionError("Company not found.");

    const startsAt = date(formData, "startsAt") ?? new Date();
    const maxDevices = Math.max(1, num(formData, "maxDevices", plan.maxDevices));

    // A perpetual license never expires; the explicit date wins if given,
    // otherwise it derives from the plan's term.
    let expiresAt: Date | null = null;
    if (licenseType !== "PERPETUAL") {
      expiresAt =
        date(formData, "expiresAt") ??
        addMonths(startsAt, licenseType === "YEARLY" ? 12 : (plan.durationMonths ?? 1));
      if (expiresAt <= startsAt) {
        return actionError("Expiry date must be after the start date.");
      }
    }

    const updatesUntil =
      licenseType === "PERPETUAL"
        ? addMonths(startsAt, plan.updateMonths ?? 12)
        : expiresAt;

    const licenseKey = generateLicenseKey(licenseType);

    const [created] = await db
      .insert(licenses)
      .values({
        companyId,
        planId,
        licenseType,
        licenseKeyHash: hashLicenseKey(licenseKey),
        licenseKeyPrefix: licenseKeyPrefix(licenseKey),
        licenseKeyLast4: licenseKeyLast4(licenseKey),
        status: "ACTIVE",
        startsAt,
        expiresAt,
        updatesUntil,
        supportUntil: updatesUntil,
        maxDevices,
        notes: optionalStr(formData, "notes"),
        createdByStaffId: session.user.id,
      })
      .returning({ id: licenses.id });

    await recordAudit({
      actor: staffActor(session),
      action: "license.generated",
      entityType: "license",
      entityId: created.id,
      companyId,
      summary: `Generated ${licenseType.toLowerCase()} license for ${company.name} (${maxDevices} device limit).`,
      newValues: {
        licenseType,
        plan: plan.name,
        maxDevices,
        expiresAt: expiresAt?.toISOString() ?? null,
        last4: licenseKeyLast4(licenseKey),
      },
    });

    revalidatePath("/admin/licenses");
    revalidatePath("/admin");

    return actionOk(
      `License generated for ${company.name}. Copy the key now — it cannot be shown again.`,
      licenseKey,
    );
  } catch (error) {
    return toActionError(error);
  }
}

async function changeLicenseStatus(
  formData: FormData,
  next: "ACTIVE" | "SUSPENDED" | "REVOKED",
  capability: "licenses.create" | "licenses.revoke",
  verb: string,
): Promise<ActionState> {
  const session = await requireStaffCapability(capability);
  const id = str(formData, "id");
  if (!id) return actionError("License id is required.");

  const db = getDb();
  const [before] = await db.select().from(licenses).where(eq(licenses.id, id)).limit(1);
  if (!before) return actionError("License not found.");

  if (before.status === "REVOKED") {
    return actionError("A revoked license cannot be changed. Generate a replacement instead.");
  }

  await db
    .update(licenses)
    .set({
      status: next,
      revokedAt: next === "REVOKED" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(licenses.id, id));

  // Revoking must also cut off every device already running on that key,
  // otherwise the installs keep working until their entitlement lapses.
  if (next === "REVOKED") {
    await db
      .update(deviceActivations)
      .set({ status: "DEACTIVATED", deactivatedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(deviceActivations.licenseId, id), eq(deviceActivations.status, "ACTIVE")),
      );
  }

  await recordAudit({
    actor: staffActor(session),
    action: `license.${verb}`,
    entityType: "license",
    entityId: id,
    companyId: before.companyId,
    summary: `License ${before.licenseKeyPrefix}…${before.licenseKeyLast4} ${verb}.`,
    oldValues: { status: before.status },
    newValues: { status: next },
  });

  revalidatePath("/admin/licenses");
  revalidatePath("/admin/devices");
  return actionOk(`License ${verb}.`);
}

export async function suspendLicenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    return await changeLicenseStatus(formData, "SUSPENDED", "licenses.revoke", "suspended");
  } catch (error) {
    return toActionError(error);
  }
}

export async function reactivateLicenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    return await changeLicenseStatus(formData, "ACTIVE", "licenses.revoke", "reactivated");
  } catch (error) {
    return toActionError(error);
  }
}

export async function revokeLicenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    return await changeLicenseStatus(formData, "REVOKED", "licenses.revoke", "revoked");
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Reissue: mints a fresh key on the same license row, invalidating the old one.
 * Used when a customer has lost their key or it has leaked. Devices already
 * activated stay active — they hold an entitlement, not the key itself.
 */
export async function reissueLicenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("licenses.revoke");
    const id = str(formData, "id");
    if (!id) return actionError("License id is required.");

    const db = getDb();
    const [before] = await db.select().from(licenses).where(eq(licenses.id, id)).limit(1);
    if (!before) return actionError("License not found.");
    if (before.status === "REVOKED") {
      return actionError("A revoked license cannot be reissued.");
    }

    const licenseKey = generateLicenseKey(before.licenseType);
    await db
      .update(licenses)
      .set({
        licenseKeyHash: hashLicenseKey(licenseKey),
        licenseKeyPrefix: licenseKeyPrefix(licenseKey),
        licenseKeyLast4: licenseKeyLast4(licenseKey),
        status: "ACTIVE",
        updatedAt: new Date(),
      })
      .where(eq(licenses.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: "license.reissued",
      entityType: "license",
      entityId: id,
      companyId: before.companyId,
      summary: `Reissued license — previous key ending ${before.licenseKeyLast4} is now invalid.`,
      oldValues: { last4: before.licenseKeyLast4 },
      newValues: { last4: licenseKeyLast4(licenseKey) },
    });

    revalidatePath("/admin/licenses");
    return actionOk("License reissued. Copy the new key now — it cannot be shown again.", licenseKey);
  } catch (error) {
    return toActionError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Devices                                                                     */
/* -------------------------------------------------------------------------- */

async function changeDeviceStatus(
  formData: FormData,
  next: "ACTIVE" | "DEACTIVATED" | "BLOCKED",
  verb: string,
): Promise<ActionState> {
  const session = await requireStaffCapability("devices.write");
  const id = str(formData, "id");
  if (!id) return actionError("Device id is required.");

  const db = getDb();
  const [before] = await db
    .select()
    .from(deviceActivations)
    .where(eq(deviceActivations.id, id))
    .limit(1);
  if (!before) return actionError("Device not found.");

  // Reactivating has to respect the license seat count, or the limit becomes
  // advisory and a license silently ends up over its cap.
  if (next === "ACTIVE" && before.status !== "ACTIVE") {
    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.id, before.licenseId))
      .limit(1);
    if (!license) return actionError("The license for this device no longer exists.");
    if (license.status !== "ACTIVE") {
      return actionError("Reactivate the license before reactivating its devices.");
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(deviceActivations)
      .where(
        and(
          eq(deviceActivations.licenseId, before.licenseId),
          eq(deviceActivations.status, "ACTIVE"),
        ),
      );
    if (count >= license.maxDevices) {
      return actionError(
        `Device limit reached (${count}/${license.maxDevices}). Deactivate another device first.`,
      );
    }
  }

  await db
    .update(deviceActivations)
    .set({
      status: next,
      deactivatedAt: next === "ACTIVE" ? null : new Date(),
      updatedAt: new Date(),
    })
    .where(eq(deviceActivations.id, id));

  await recordAudit({
    actor: staffActor(session),
    action: `device.${verb}`,
    entityType: "device_activation",
    entityId: id,
    companyId: before.companyId,
    summary: `Device ${before.deviceName} ${verb} by staff.`,
    oldValues: { status: before.status },
    newValues: { status: next },
  });

  revalidatePath("/admin/devices");
  revalidatePath("/admin/activations");
  return actionOk(`${before.deviceName} ${verb}.`);
}

export async function deactivateDeviceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    return await changeDeviceStatus(formData, "DEACTIVATED", "deactivated");
  } catch (error) {
    return toActionError(error);
  }
}

export async function reactivateDeviceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    return await changeDeviceStatus(formData, "ACTIVE", "reactivated");
  } catch (error) {
    return toActionError(error);
  }
}

export async function blockDeviceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    return await changeDeviceStatus(formData, "BLOCKED", "blocked");
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Replace: frees the old seat and registers the new machine in one transaction,
 * so a customer moving to a new PC never transiently exceeds their device limit
 * and never loses the seat if the second step fails.
 */
export async function replaceDeviceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("devices.write");
    const id = str(formData, "id");
    const newDeviceName = str(formData, "deviceName");
    if (!id) return actionError("Device id is required.");
    if (!newDeviceName) return actionError("Enter the replacement device name.");

    const db = getDb();
    const [before] = await db
      .select()
      .from(deviceActivations)
      .where(eq(deviceActivations.id, id))
      .limit(1);
    if (!before) return actionError("Device not found.");
    if (before.status === "REPLACED") {
      return actionError("This device has already been replaced.");
    }

    const replacement = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(deviceActivations)
        .values({
          companyId: before.companyId,
          licenseId: before.licenseId,
          // Placeholder until the new machine activates and supplies its own
          // hardware hash; unique per row so the license/device constraint holds.
          deviceIdHash: `pending:${crypto.randomUUID()}`,
          deviceName: newDeviceName,
          platform: before.platform,
          appVersion: before.appVersion,
          status: "ACTIVE",
        })
        .returning({ id: deviceActivations.id });

      await tx
        .update(deviceActivations)
        .set({
          status: "REPLACED",
          deactivatedAt: new Date(),
          replacedByDeviceId: created.id,
          updatedAt: new Date(),
        })
        .where(eq(deviceActivations.id, id));

      return created;
    });

    await recordAudit({
      actor: staffActor(session),
      action: "device.replaced",
      entityType: "device_activation",
      entityId: id,
      companyId: before.companyId,
      summary: `Replaced ${before.deviceName} with ${newDeviceName}.`,
      oldValues: { deviceName: before.deviceName },
      newValues: { deviceName: newDeviceName, replacementId: replacement.id },
    });

    revalidatePath("/admin/devices");
    revalidatePath("/admin/activations");
    return actionOk(`${before.deviceName} replaced with ${newDeviceName}.`);
  } catch (error) {
    return toActionError(error);
  }
}
