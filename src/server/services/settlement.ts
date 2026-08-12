import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import {
  companies,
  invoices,
  licenses,
  payments,
  plans,
  subscriptions,
} from "@/src/server/db/schema";
import { addMonths } from "./subscriptions";

export type SettlementInput = {
  companyId: string;
  planId: string;
  amountMajor: string;
  currencyCode?: string;
  paymentMethod: string;
  reference?: string | null;
  purpose?: string | null;
  gateway?: string | null;
  gatewayTransactionId?: string | null;
  webhookEventId?: string | null;
  confirmedByStaffId?: string | null;
  paidAt?: Date;
};

export type SettlementResult = {
  paymentId: string;
  invoiceId: string;
  subscriptionId: string;
  invoiceNumber: string;
  subscriptionEndsAt: Date | null;
  licenseIdsExtended: string[];
};

/**
 * The ONE place a payment turns into access.
 *
 * Manual staff confirmation and (future) gateway webhooks must both call this
 * and nothing else — a second activation path is how a system ends up granting
 * entitlement without a matching settled payment. Everything runs inside a
 * single transaction so a failure part-way cannot leave a paid payment with an
 * unextended subscription.
 */
export async function applyPaymentToSubscription(
  input: SettlementInput,
): Promise<SettlementResult> {
  const db = getDb();
  const paidAt = input.paidAt ?? new Date();

  return db.transaction(async (tx) => {
    const [plan] = await tx.select().from(plans).where(eq(plans.id, input.planId)).limit(1);
    if (!plan) throw new Error("Plan not found.");

    const [company] = await tx
      .select()
      .from(companies)
      .where(eq(companies.id, input.companyId))
      .limit(1);
    if (!company) throw new Error("Company not found.");

    const currencyCode = input.currencyCode ?? plan.currencyCode;

    /* ---- Subscription: extend in place, or open a new term --------------- */
    const [existing] = await tx
      .select()
      .from(subscriptions)
      .where(
        and(eq(subscriptions.companyId, input.companyId), eq(subscriptions.planId, input.planId)),
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    const durationMonths = plan.durationMonths ?? (plan.billingType === "YEARLY" ? 12 : 1);
    const isPerpetual = plan.billingType === "ONE_TIME";

    // Renewing before expiry must add to the remaining term, not truncate it.
    const extendFrom =
      existing?.endsAt && existing.endsAt > paidAt ? existing.endsAt : paidAt;
    const newEndsAt = isPerpetual ? null : addMonths(extendFrom, durationMonths);
    const graceEndsAt = newEndsAt ? addMonths(newEndsAt, 0) : null;
    if (graceEndsAt) graceEndsAt.setUTCDate(graceEndsAt.getUTCDate() + plan.offlineGraceDays);

    let subscriptionId: string;
    if (existing) {
      await tx
        .update(subscriptions)
        .set({
          status: "ACTIVE",
          endsAt: newEndsAt,
          graceEndsAt,
          cancelledAt: null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existing.id));
      subscriptionId = existing.id;
    } else {
      const [created] = await tx
        .insert(subscriptions)
        .values({
          companyId: input.companyId,
          planId: input.planId,
          status: "ACTIVE",
          startsAt: paidAt,
          endsAt: newEndsAt,
          graceEndsAt,
        })
        .returning({ id: subscriptions.id });
      subscriptionId = created.id;
    }

    /* ---- Invoice --------------------------------------------------------- */
    const year = paidAt.getUTCFullYear();
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .where(sql`${invoices.invoiceNumber} like ${`INV-${year}-%`}`);
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`;

    const [invoice] = await tx
      .insert(invoices)
      .values({
        companyId: input.companyId,
        subscriptionId,
        invoiceNumber,
        amount: input.amountMajor,
        currencyCode,
        status: "PAID",
        description: input.purpose ?? `${plan.name} — ${isPerpetual ? "one-time" : `${durationMonths} month(s)`}`,
        issuedAt: paidAt,
        paidAt,
      })
      .returning({ id: invoices.id });

    /* ---- Payment --------------------------------------------------------- */
    const [payment] = await tx
      .insert(payments)
      .values({
        companyId: input.companyId,
        subscriptionId,
        invoiceId: invoice.id,
        amount: input.amountMajor,
        currencyCode,
        paymentMethod: input.paymentMethod,
        gateway: input.gateway ?? null,
        gatewayTransactionId: input.gatewayTransactionId ?? null,
        webhookEventId: input.webhookEventId ?? null,
        reference: input.reference ?? null,
        purpose: input.purpose ?? null,
        status: "PAID",
        confirmedByStaffId: input.confirmedByStaffId ?? null,
        paidAt,
      })
      .returning({ id: payments.id });

    /* ---- Licenses: extend every live license on this plan ---------------- */
    const licenseRows = await tx
      .select()
      .from(licenses)
      .where(
        and(
          eq(licenses.companyId, input.companyId),
          eq(licenses.planId, input.planId),
          sql`${licenses.status} in ('ACTIVE', 'EXPIRED', 'SUSPENDED')`,
        ),
      );

    const licenseIdsExtended: string[] = [];
    for (const license of licenseRows) {
      if (license.licenseType === "PERPETUAL") {
        // A perpetual licence never expires; a renewal buys more updates/support.
        await tx
          .update(licenses)
          .set({
            status: "ACTIVE",
            updatesUntil: addMonths(
              license.updatesUntil && license.updatesUntil > paidAt ? license.updatesUntil : paidAt,
              plan.updateMonths ?? 12,
            ),
            supportUntil: addMonths(
              license.supportUntil && license.supportUntil > paidAt ? license.supportUntil : paidAt,
              plan.supportMonths ?? 12,
            ),
            updatedAt: new Date(),
          })
          .where(eq(licenses.id, license.id));
      } else {
        const from =
          license.expiresAt && license.expiresAt > paidAt ? license.expiresAt : paidAt;
        const expiresAt = addMonths(from, durationMonths);
        await tx
          .update(licenses)
          .set({
            status: "ACTIVE",
            expiresAt,
            updatesUntil: expiresAt,
            supportUntil: expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(licenses.id, license.id));
      }
      licenseIdsExtended.push(license.id);
    }

    /* ---- Company commercial status --------------------------------------- */
    if (company.status !== "ACTIVE") {
      await tx
        .update(companies)
        .set({ status: "ACTIVE", updatedAt: new Date() })
        .where(eq(companies.id, input.companyId));
    }

    return {
      paymentId: payment.id,
      invoiceId: invoice.id,
      invoiceNumber,
      subscriptionId,
      subscriptionEndsAt: newEndsAt,
      licenseIdsExtended,
    };
  });
}
