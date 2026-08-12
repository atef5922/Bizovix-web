"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireStaffCapability } from "@/src/server/auth/guard";
import { getDb } from "@/src/server/db/client";
import { planFeatures, plans, softwareReleases } from "@/src/server/db/schema";
import { recordAudit } from "@/src/server/services/audit";
import {
  actionError,
  actionOk,
  bool,
  num,
  optionalStr,
  str,
  toActionError,
  type ActionState,
} from "./action-state";

const BILLING_TYPES = ["MONTHLY", "YEARLY", "ONE_TIME"] as const;

function staffActor(session: Awaited<ReturnType<typeof requireStaffCapability>>) {
  return {
    type: "STAFF" as const,
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}

export async function createPlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("plans.write");
    const name = str(formData, "name");
    const code = str(formData, "code").toLowerCase().replace(/\s+/g, "-");
    if (!name) return actionError("Plan name is required.");
    if (!code) return actionError("Plan code is required.");

    const billingType = str(formData, "billingType") as (typeof BILLING_TYPES)[number];
    if (!BILLING_TYPES.includes(billingType)) return actionError("Select a billing type.");

    const priceMajor = Number(str(formData, "price"));
    if (!Number.isFinite(priceMajor) || priceMajor < 0) {
      return actionError("Enter a valid price.");
    }

    const db = getDb();
    const [created] = await db
      .insert(plans)
      .values({
        code,
        name,
        description: optionalStr(formData, "description"),
        billingType,
        priceMinor: Math.round(priceMajor * 100),
        currencyCode: optionalStr(formData, "currencyCode") ?? "BDT",
        durationMonths:
          billingType === "ONE_TIME" ? null : billingType === "YEARLY" ? 12 : 1,
        maxUsers: Math.max(1, num(formData, "maxUsers", 1)),
        maxDevices: Math.max(1, num(formData, "maxDevices", 1)),
        offlineGraceDays: Math.max(0, num(formData, "offlineGraceDays", 7)),
        isActive: true,
        isPublic: bool(formData, "isPublic"),
        sortOrder: num(formData, "sortOrder", 0),
      })
      .returning({ id: plans.id });

    await recordAudit({
      actor: staffActor(session),
      action: "plan.created",
      entityType: "plan",
      entityId: created.id,
      summary: `Created plan ${name} (${code}).`,
      newValues: { name, code, billingType, priceMinor: Math.round(priceMajor * 100) },
    });

    revalidatePath("/admin/plans");
    return actionOk(`Plan ${name} created.`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updatePlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("plans.write");
    const id = str(formData, "id");
    if (!id) return actionError("Plan id is required.");

    const db = getDb();
    const [before] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    if (!before) return actionError("Plan not found.");

    const priceMajor = Number(str(formData, "price"));
    if (!Number.isFinite(priceMajor) || priceMajor < 0) {
      return actionError("Enter a valid price.");
    }

    const billingType = str(formData, "billingType") as (typeof BILLING_TYPES)[number];

    await db
      .update(plans)
      .set({
        name: str(formData, "name") || before.name,
        description: optionalStr(formData, "description"),
        billingType: BILLING_TYPES.includes(billingType) ? billingType : before.billingType,
        priceMinor: Math.round(priceMajor * 100),
        maxUsers: Math.max(1, num(formData, "maxUsers", before.maxUsers)),
        maxDevices: Math.max(1, num(formData, "maxDevices", before.maxDevices)),
        offlineGraceDays: Math.max(0, num(formData, "offlineGraceDays", before.offlineGraceDays)),
        isPublic: bool(formData, "isPublic"),
        sortOrder: num(formData, "sortOrder", before.sortOrder),
        updatedAt: new Date(),
      })
      .where(eq(plans.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: "plan.updated",
      entityType: "plan",
      entityId: id,
      summary: `Updated plan ${before.name}.`,
      oldValues: { priceMinor: before.priceMinor, billingType: before.billingType },
      newValues: { priceMinor: Math.round(priceMajor * 100), billingType },
    });

    revalidatePath("/admin/plans");
    return actionOk(`Plan ${before.name} updated.`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function setPlanActiveAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("plans.write");
    const id = str(formData, "id");
    const isActive = bool(formData, "isActive");
    if (!id) return actionError("Plan id is required.");

    const db = getDb();
    const [before] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    if (!before) return actionError("Plan not found.");

    await db
      .update(plans)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(plans.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: isActive ? "plan.activated" : "plan.deactivated",
      entityType: "plan",
      entityId: id,
      summary: `Plan ${before.name} ${isActive ? "activated" : "deactivated"}.`,
    });

    revalidatePath("/admin/plans");
    return actionOk(`${before.name} ${isActive ? "activated" : "deactivated"}.`);
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Replaces a plan's feature set wholesale from the submitted checkboxes, so
 * unchecking a box actually removes the entitlement rather than leaving a
 * stale enabled row behind.
 */
export async function setPlanFeaturesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("plans.write");
    const planId = str(formData, "planId");
    if (!planId) return actionError("Plan id is required.");

    const selected = formData.getAll("featureIds").filter((v): v is string => typeof v === "string");

    const db = getDb();
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan) return actionError("Plan not found.");

    await db.transaction(async (tx) => {
      await tx.delete(planFeatures).where(eq(planFeatures.planId, planId));
      if (selected.length > 0) {
        await tx
          .insert(planFeatures)
          .values(selected.map((featureId) => ({ planId, featureId, enabled: true })));
      }
    });

    await recordAudit({
      actor: staffActor(session),
      action: "plan.features_updated",
      entityType: "plan",
      entityId: planId,
      summary: `${plan.name}: feature set updated (${selected.length} enabled).`,
      newValues: { featureCount: selected.length },
    });

    revalidatePath("/admin/plans");
    return actionOk(`${plan.name}: ${selected.length} feature(s) enabled.`);
  } catch (error) {
    return toActionError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Software releases                                                           */
/* -------------------------------------------------------------------------- */

export async function createReleaseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("releases.write");
    const version = str(formData, "version");
    const fileName = str(formData, "fileName");
    if (!version) return actionError("Version is required.");
    if (!fileName) return actionError("Installer file name is required.");

    const isLatest = bool(formData, "isLatest");
    const db = getDb();

    const created = await db.transaction(async (tx) => {
      // Exactly one release may be flagged latest, or the download redirect
      // becomes non-deterministic.
      if (isLatest) {
        await tx.update(softwareReleases).set({ isLatest: false });
      }
      const [row] = await tx
        .insert(softwareReleases)
        .values({
          version,
          fileName,
          downloadPath: optionalStr(formData, "downloadPath") ?? `/software/${fileName}`,
          platform: optionalStr(formData, "platform") ?? "windows",
          isLatest,
          releaseNotes: optionalStr(formData, "releaseNotes"),
        })
        .returning({ id: softwareReleases.id });
      return row;
    });

    await recordAudit({
      actor: staffActor(session),
      action: "release.created",
      entityType: "software_release",
      entityId: created.id,
      summary: `Published release ${version}${isLatest ? " (latest)" : ""}.`,
      newValues: { version, fileName, isLatest },
    });

    revalidatePath("/admin/downloads");
    return actionOk(`Release ${version} published.`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function setLatestReleaseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("releases.write");
    const id = str(formData, "id");
    if (!id) return actionError("Release id is required.");

    const db = getDb();
    const [release] = await db
      .select()
      .from(softwareReleases)
      .where(eq(softwareReleases.id, id))
      .limit(1);
    if (!release) return actionError("Release not found.");

    await db.transaction(async (tx) => {
      await tx
        .update(softwareReleases)
        .set({ isLatest: false })
        .where(and(ne(softwareReleases.id, id), eq(softwareReleases.isLatest, true)));
      await tx
        .update(softwareReleases)
        .set({ isLatest: true })
        .where(eq(softwareReleases.id, id));
    });

    await recordAudit({
      actor: staffActor(session),
      action: "release.set_latest",
      entityType: "software_release",
      entityId: id,
      summary: `Release ${release.version} marked as the current download.`,
    });

    revalidatePath("/admin/downloads");
    revalidatePath("/download");
    return actionOk(`${release.version} is now the current download.`);
  } catch (error) {
    return toActionError(error);
  }
}
