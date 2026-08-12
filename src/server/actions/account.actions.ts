"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/src/server/auth/guard";
import { getDb } from "@/src/server/db/client";
import { deviceActivations, licenses } from "@/src/server/db/schema";
import { getAccountDevice, countRecentSelfServiceReplacements } from "@/src/server/services/account";
import { recordAudit } from "@/src/server/services/audit";
import { recordDownloadEvent } from "@/src/server/services/downloads";
import {
  actionError,
  actionOk,
  str,
  toActionError,
  type ActionState,
} from "./action-state";

/** Customers may self-serve a limited number of device changes per 30 days. */
const SELF_SERVICE_LIMIT = 2;

/**
 * Only OWNER/ADMIN may change devices — a MEMBER can view but not free a seat,
 * matching the tenant-scoped permission model.
 */
function canManageDevices(role: "OWNER" | "ADMIN" | "MEMBER"): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export async function selfDeactivateDeviceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireCustomer();
    if (!canManageDevices(session.user.role)) {
      return actionError("Only a company owner or admin can deactivate a device.");
    }

    const id = str(formData, "id");
    if (!id) return actionError("Device id is required.");

    const device = await getAccountDevice(session.company.id, id);
    if (!device) return actionError("Device not found.");
    if (device.status !== "ACTIVE") return actionError("That device is not currently active.");

    const used = await countRecentSelfServiceReplacements(session.company.id);
    if (used >= SELF_SERVICE_LIMIT) {
      return actionError(
        `Self-service device changes are limited to ${SELF_SERVICE_LIMIT} per 30 days. Contact support to make further changes.`,
      );
    }

    await getDb()
      .update(deviceActivations)
      .set({ status: "DEACTIVATED", deactivatedAt: new Date(), updatedAt: new Date() })
      .where(eq(deviceActivations.id, id));

    await recordAudit({
      actor: {
        type: "CUSTOMER",
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      action: "device.self_deactivated",
      entityType: "device_activation",
      entityId: id,
      companyId: session.company.id,
      summary: `${session.user.name} deactivated ${device.deviceName} from the customer portal.`,
    });

    revalidatePath("/account/devices");
    revalidatePath("/account");
    return actionOk(
      `${device.deviceName} deactivated. ${SELF_SERVICE_LIMIT - used - 1} self-service change(s) left this month.`,
    );
  } catch (error) {
    return toActionError(error);
  }
}

export async function selfReplaceDeviceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireCustomer();
    if (!canManageDevices(session.user.role)) {
      return actionError("Only a company owner or admin can replace a device.");
    }

    const id = str(formData, "id");
    const deviceName = str(formData, "deviceName");
    if (!id) return actionError("Device id is required.");
    if (!deviceName) return actionError("Enter the replacement computer's name.");

    const device = await getAccountDevice(session.company.id, id);
    if (!device) return actionError("Device not found.");
    if (device.status === "REPLACED") return actionError("That device has already been replaced.");

    const used = await countRecentSelfServiceReplacements(session.company.id);
    if (used >= SELF_SERVICE_LIMIT) {
      return actionError(
        `Self-service device changes are limited to ${SELF_SERVICE_LIMIT} per 30 days. Contact support to make further changes.`,
      );
    }

    const db = getDb();
    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.id, device.licenseId))
      .limit(1);
    if (!license || license.status !== "ACTIVE") {
      return actionError("Your license is not active. Contact support.");
    }

    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(deviceActivations)
        .values({
          companyId: session.company.id,
          licenseId: device.licenseId,
          deviceIdHash: `pending:${crypto.randomUUID()}`,
          deviceName,
          platform: device.platform,
          appVersion: device.appVersion,
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
    });

    await recordAudit({
      actor: {
        type: "CUSTOMER",
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      action: "device.self_replaced",
      entityType: "device_activation",
      entityId: id,
      companyId: session.company.id,
      summary: `${session.user.name} replaced ${device.deviceName} with ${deviceName} from the customer portal.`,
      oldValues: { deviceName: device.deviceName },
      newValues: { deviceName },
    });

    revalidatePath("/account/devices");
    return actionOk(
      `${device.deviceName} replaced with ${deviceName}. Activate Bizovix on the new computer to finish.`,
    );
  } catch (error) {
    return toActionError(error);
  }
}

/** Records the download event before handing back the installer path. */
export async function trackAccountDownloadAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireCustomer();
    await recordDownloadEvent({
      source: "account_portal",
      companyId: session.company.id,
      appVersion: str(formData, "version") || null,
    });

    await recordAudit({
      actor: {
        type: "CUSTOMER",
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      action: "download.requested",
      entityType: "download_event",
      companyId: session.company.id,
      summary: `${session.user.name} downloaded the Windows installer.`,
    });

    revalidatePath("/account/download");
    return actionOk("Download started.");
  } catch (error) {
    return toActionError(error);
  }
}

