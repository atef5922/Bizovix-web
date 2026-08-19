"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireStaffCapability } from "@/src/server/auth/guard";
import { getDb } from "@/src/server/db/client";
import { companies, invoices, payments, plans, subscriptions } from "@/src/server/db/schema";
import { recordAudit } from "@/src/server/services/audit";
import { nextInvoiceNumber } from "@/src/server/services/billing";
import { applyPaymentToSubscription } from "@/src/server/services/settlement";
import { addMonths } from "@/src/server/services/subscriptions";
import {
  actionError,
  actionOk,
  bool,
  date,
  optionalStr,
  str,
  toActionError,
  type ActionState,
} from "./action-state";

function staffActor(session: Awaited<ReturnType<typeof requireStaffCapability>>) {
  return {
    type: "STAFF" as const,
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}

/** Rejects anything that is not a positive, sanely-scaled decimal amount. */
function parseAmount(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  if (!raw) return { ok: false, error: "Enter an amount." };
  if (!/^\d{1,14}(\.\d{1,4})?$/.test(raw)) {
    return { ok: false, error: "Enter a valid amount (up to 4 decimal places)." };
  }
  if (Number(raw) <= 0) return { ok: false, error: "Amount must be greater than zero." };
  return { ok: true, value: raw };
}

/* -------------------------------------------------------------------------- */
/* Payments                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Manual payment confirmation. Routes through the shared settlement service so
 * a staff-confirmed bank transfer and a future gateway webhook activate access
 * through exactly the same code path.
 */
export async function recordManualPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("payments.write");

    const companyId = str(formData, "companyId");
    const planId = str(formData, "planId");
    if (!companyId) return actionError("Select a company.");
    if (!planId) return actionError("Select a plan.");

    const amount = parseAmount(str(formData, "amount"));
    if (!amount.ok) return actionError(amount.error);

    const paidAt = date(formData, "paidAt") ?? new Date();
    if (paidAt.getTime() > Date.now() + 60_000) {
      return actionError("Payment date cannot be in the future.");
    }

    const result = await applyPaymentToSubscription({
      companyId,
      planId,
      amountMajor: amount.value,
      paymentMethod: str(formData, "paymentMethod") || "bank_transfer",
      reference: optionalStr(formData, "reference"),
      purpose: optionalStr(formData, "purpose"),
      confirmedByStaffId: session.user.id,
      paidAt,
    });

    const db = getDb();
    const [company] = await db
      .select({ name: companies.name })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    await recordAudit({
      actor: staffActor(session),
      action: "payment.confirmed.manual",
      entityType: "payment",
      entityId: result.paymentId,
      companyId,
      summary: `Confirmed manual payment of ${amount.value} for ${company?.name ?? "company"} — ${result.invoiceNumber}.`,
      newValues: {
        amount: amount.value,
        invoiceNumber: result.invoiceNumber,
        subscriptionEndsAt: result.subscriptionEndsAt?.toISOString() ?? null,
        licensesExtended: result.licenseIdsExtended.length,
      },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin/invoices");
    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin/licenses");
    revalidatePath("/admin");

    const extended = result.licenseIdsExtended.length;
    return actionOk(
      `Payment settled. ${result.invoiceNumber} issued` +
        (result.subscriptionEndsAt
          ? `, subscription now runs to ${result.subscriptionEndsAt.toLocaleDateString("en-GB")}`
          : ", perpetual entitlement applied") +
        (extended > 0 ? `, ${extended} license(s) extended.` : "."),
    );
  } catch (error) {
    return toActionError(error);
  }
}

export async function updatePaymentStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("payments.write");
    const id = str(formData, "id");
    const status = str(formData, "status");
    const allowed = ["PENDING", "FAILED", "REFUNDED", "CANCELLED"];
    if (!id || !allowed.includes(status)) return actionError("Invalid request.");

    const db = getDb();
    const [before] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (!before) return actionError("Payment not found.");

    // Settled money is not edited in place: reversing a PAID payment has to
    // unwind the subscription and licence it funded, which is a separate,
    // deliberate operation rather than a status dropdown.
    if (before.status === "PAID" && status !== "REFUNDED") {
      return actionError("A settled payment can only be marked refunded.");
    }

    await db
      .update(payments)
      .set({
        status: status as typeof before.status,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: `payment.${status.toLowerCase()}`,
      entityType: "payment",
      entityId: id,
      companyId: before.companyId,
      summary: `Payment ${before.amount} marked ${status.toLowerCase()}.`,
      oldValues: { status: before.status },
      newValues: { status },
    });

    revalidatePath("/admin/payments");
    return actionOk(`Payment marked ${status.toLowerCase()}.`);
  } catch (error) {
    return toActionError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Subscriptions                                                               */
/* -------------------------------------------------------------------------- */

export async function createSubscriptionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("subscriptions.write");
    const companyId = str(formData, "companyId");
    const planId = str(formData, "planId");
    if (!companyId) return actionError("Select a company.");
    if (!planId) return actionError("Select a plan.");

    const db = getDb();
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan) return actionError("Plan not found.");

    const startsAt = date(formData, "startsAt") ?? new Date();
    const isTrial = bool(formData, "isTrial");
    const months = plan.durationMonths ?? (plan.billingType === "YEARLY" ? 12 : 1);
    const endsAt =
      plan.billingType === "ONE_TIME" && !isTrial
        ? null
        : addMonths(startsAt, isTrial ? 0 : months);
    if (isTrial && endsAt) endsAt.setUTCDate(endsAt.getUTCDate() + 14);

    const [created] = await db
      .insert(subscriptions)
      .values({
        companyId,
        planId,
        status: isTrial ? "TRIALING" : "ACTIVE",
        startsAt,
        endsAt,
        graceEndsAt: endsAt
          ? new Date(endsAt.getTime() + plan.offlineGraceDays * 24 * 60 * 60 * 1000)
          : null,
        autoRenews: bool(formData, "autoRenews"),
      })
      .returning({ id: subscriptions.id });

    await recordAudit({
      actor: staffActor(session),
      action: "subscription.created",
      entityType: "subscription",
      entityId: created.id,
      companyId,
      summary: `Started ${isTrial ? "trial" : "subscription"} on ${plan.name}.`,
      newValues: { plan: plan.name, endsAt: endsAt?.toISOString() ?? null },
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin");
    return actionOk(`${isTrial ? "Trial" : "Subscription"} started on ${plan.name}.`);
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Staff renewal without a payment record — used for comped or externally
 * settled terms. It is audited distinctly from `payment.confirmed.manual` so
 * revenue reporting never mistakes a comp for money received.
 */
export async function renewSubscriptionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("subscriptions.write");
    const id = str(formData, "id");
    if (!id) return actionError("Subscription id is required.");

    const db = getDb();
    const [row] = await db
      .select({ subscription: subscriptions, plan: plans })
      .from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(eq(subscriptions.id, id))
      .limit(1);
    if (!row) return actionError("Subscription not found.");

    const months = row.plan.durationMonths ?? (row.plan.billingType === "YEARLY" ? 12 : 1);
    const now = new Date();
    const from =
      row.subscription.endsAt && row.subscription.endsAt > now ? row.subscription.endsAt : now;
    const endsAt = addMonths(from, months);

    await db
      .update(subscriptions)
      .set({
        status: "ACTIVE",
        endsAt,
        graceEndsAt: new Date(
          endsAt.getTime() + row.plan.offlineGraceDays * 24 * 60 * 60 * 1000,
        ),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: "subscription.renewed.manual",
      entityType: "subscription",
      entityId: id,
      companyId: row.subscription.companyId,
      summary: `Renewed ${row.plan.name} to ${endsAt.toLocaleDateString("en-GB")} without a payment record.`,
      oldValues: { endsAt: row.subscription.endsAt?.toISOString() ?? null },
      newValues: { endsAt: endsAt.toISOString() },
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin/renewals");
    return actionOk(`Renewed to ${endsAt.toLocaleDateString("en-GB")}.`);
  } catch (error) {
    return toActionError(error);
  }
}

async function changeSubscriptionStatus(
  formData: FormData,
  next: "ACTIVE" | "SUSPENDED" | "CANCELLED",
  verb: string,
): Promise<ActionState> {
  const session = await requireStaffCapability("subscriptions.write");
  const id = str(formData, "id");
  if (!id) return actionError("Subscription id is required.");

  const db = getDb();
  const [before] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, id))
    .limit(1);
  if (!before) return actionError("Subscription not found.");

  await db
    .update(subscriptions)
    .set({
      status: next,
      cancelledAt: next === "CANCELLED" ? new Date() : null,
      autoRenews: next === "CANCELLED" ? false : before.autoRenews,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, id));

  await recordAudit({
    actor: staffActor(session),
    action: `subscription.${verb}`,
    entityType: "subscription",
    entityId: id,
    companyId: before.companyId,
    summary: `Subscription ${verb}.`,
    oldValues: { status: before.status },
    newValues: { status: next },
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/renewals");
  return actionOk(`Subscription ${verb}.`);
}

export async function suspendSubscriptionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    return await changeSubscriptionStatus(formData, "SUSPENDED", "suspended");
  } catch (error) {
    return toActionError(error);
  }
}

export async function reactivateSubscriptionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    return await changeSubscriptionStatus(formData, "ACTIVE", "reactivated");
  } catch (error) {
    return toActionError(error);
  }
}

export async function cancelSubscriptionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    return await changeSubscriptionStatus(formData, "CANCELLED", "cancelled");
  } catch (error) {
    return toActionError(error);
  }
}

export async function toggleAutoRenewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("subscriptions.write");
    const id = str(formData, "id");
    const autoRenews = bool(formData, "autoRenews");
    if (!id) return actionError("Subscription id is required.");

    const db = getDb();
    const [before] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1);
    if (!before) return actionError("Subscription not found.");

    await db
      .update(subscriptions)
      .set({ autoRenews, updatedAt: new Date() })
      .where(eq(subscriptions.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: "subscription.auto_renew_changed",
      entityType: "subscription",
      entityId: id,
      companyId: before.companyId,
      summary: `Auto-renew ${autoRenews ? "enabled" : "disabled"}.`,
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin/renewals");
    return actionOk(`Auto-renew ${autoRenews ? "enabled" : "disabled"}.`);
  } catch (error) {
    return toActionError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Invoices                                                                    */
/* -------------------------------------------------------------------------- */

export async function createInvoiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("invoices.write");
    const companyId = str(formData, "companyId");
    if (!companyId) return actionError("Select a company.");

    const amount = parseAmount(str(formData, "amount"));
    if (!amount.ok) return actionError(amount.error);

    const db = getDb();
    const invoiceNumber = await nextInvoiceNumber();
    const issuedAt = date(formData, "issuedAt") ?? new Date();
    const dueAt = date(formData, "dueAt");

    if (dueAt && dueAt < issuedAt) {
      return actionError("Due date cannot be before the issue date.");
    }

    const [created] = await db
      .insert(invoices)
      .values({
        companyId,
        subscriptionId: optionalStr(formData, "subscriptionId"),
        invoiceNumber,
        amount: amount.value,
        currencyCode: optionalStr(formData, "currencyCode") ?? "BDT",
        status: "ISSUED",
        description: optionalStr(formData, "description"),
        issuedAt,
        dueAt,
      })
      .returning({ id: invoices.id });

    await recordAudit({
      actor: staffActor(session),
      action: "invoice.created",
      entityType: "invoice",
      entityId: created.id,
      companyId,
      summary: `Issued ${invoiceNumber} for ${amount.value}.`,
      newValues: { invoiceNumber, amount: amount.value },
    });

    revalidatePath("/admin/invoices");
    return actionOk(`${invoiceNumber} issued.`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateInvoiceStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("invoices.write");
    const id = str(formData, "id");
    const status = str(formData, "status");
    if (!id || !["ISSUED", "PAID", "OVERDUE", "VOID"].includes(status)) {
      return actionError("Invalid request.");
    }

    const db = getDb();
    const [before] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!before) return actionError("Invoice not found.");

    await db
      .update(invoices)
      .set({
        status: status as typeof before.status,
        paidAt: status === "PAID" ? (before.paidAt ?? new Date()) : null,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: `invoice.${status.toLowerCase()}`,
      entityType: "invoice",
      entityId: id,
      companyId: before.companyId,
      summary: `${before.invoiceNumber} marked ${status.toLowerCase()}.`,
      oldValues: { status: before.status },
      newValues: { status },
    });

    revalidatePath("/admin/invoices");
    return actionOk(`${before.invoiceNumber} marked ${status.toLowerCase()}.`);
  } catch (error) {
    return toActionError(error);
  }
}
