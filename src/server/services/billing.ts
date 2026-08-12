import "server-only";

import { and, desc, eq, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import {
  companies,
  invoices,
  payments,
  plans,
  subscriptions,
  type InvoiceStatus,
  type PaymentStatus,
} from "@/src/server/db/schema";
import {
  normalizeListParams,
  toListResult,
  type ListParams,
  type ListResult,
} from "./shared";

/* -------------------------------------------------------------------------- */
/* Payments                                                                    */
/* -------------------------------------------------------------------------- */

export type PaymentRow = {
  id: string;
  companyId: string;
  companyName: string;
  companyCode: string;
  amount: string;
  currencyCode: string;
  paymentMethod: string;
  gateway: string | null;
  reference: string | null;
  purpose: string | null;
  status: PaymentStatus;
  planName: string | null;
  paidAt: Date | null;
  createdAt: Date;
};

function paymentFilters(search?: string, status?: string, companyId?: string): SQL | undefined {
  const filters: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    filters.push(
      sql`(lower(${companies.name}) like ${term}
        or lower(${companies.companyCode}) like ${term}
        or lower(coalesce(${payments.reference}, '')) like ${term}
        or lower(coalesce(${payments.purpose}, '')) like ${term})`,
    );
  }
  if (status && status !== "ALL") {
    filters.push(sql`${payments.status} = ${status}::payment_status`);
  }
  if (companyId) filters.push(eq(payments.companyId, companyId));
  return filters.length ? and(...filters) : undefined;
}

export async function listPayments(
  params: ListParams & { companyId?: string } = {},
): Promise<ListResult<PaymentRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);
  const where = paymentFilters(search, status, params.companyId);

  const rows = await db
    .select({
      id: payments.id,
      companyId: payments.companyId,
      companyName: companies.name,
      companyCode: companies.companyCode,
      amount: payments.amount,
      currencyCode: payments.currencyCode,
      paymentMethod: payments.paymentMethod,
      gateway: payments.gateway,
      reference: payments.reference,
      purpose: payments.purpose,
      status: payments.status,
      planName: plans.name,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(companies, eq(companies.id, payments.companyId))
    .leftJoin(subscriptions, eq(subscriptions.id, payments.subscriptionId))
    .leftJoin(plans, eq(plans.id, subscriptions.planId))
    .where(where)
    .orderBy(desc(payments.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(payments)
    .innerJoin(companies, eq(companies.id, payments.companyId))
    .where(where);

  return toListResult(rows, count, page, pageSize);
}

/* -------------------------------------------------------------------------- */
/* Invoices                                                                    */
/* -------------------------------------------------------------------------- */

export type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  companyId: string;
  companyName: string;
  companyCode: string;
  amount: string;
  currencyCode: string;
  status: InvoiceStatus;
  description: string | null;
  issuedAt: Date;
  dueAt: Date | null;
  paidAt: Date | null;
};

export async function listInvoices(
  params: ListParams & { companyId?: string } = {},
): Promise<ListResult<InvoiceRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);

  const filters: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    filters.push(
      sql`(lower(${invoices.invoiceNumber}) like ${term}
        or lower(${companies.name}) like ${term}
        or lower(${companies.companyCode}) like ${term})`,
    );
  }
  if (status && status !== "ALL") {
    filters.push(sql`${invoices.status} = ${status}::invoice_status`);
  }
  if (params.companyId) filters.push(eq(invoices.companyId, params.companyId));
  const where = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      companyId: invoices.companyId,
      companyName: companies.name,
      companyCode: companies.companyCode,
      amount: invoices.amount,
      currencyCode: invoices.currencyCode,
      status: invoices.status,
      description: invoices.description,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
      paidAt: invoices.paidAt,
    })
    .from(invoices)
    .innerJoin(companies, eq(companies.id, invoices.companyId))
    .where(where)
    .orderBy(desc(invoices.issuedAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .innerJoin(companies, eq(companies.id, invoices.companyId))
    .where(where);

  return toListResult(rows, count, page, pageSize);
}

/** Sequential invoice number scoped to the current year: INV-2026-0001. */
export async function nextInvoiceNumber(): Promise<string> {
  const db = getDb();
  const year = new Date().getUTCFullYear();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} like ${`INV-${year}-%`}`);
  return `INV-${year}-${String(row.count + 1).padStart(4, "0")}`;
}

/** Flags invoices whose due date has passed so the list reflects reality. */
export async function reconcileInvoiceStates(): Promise<void> {
  const db = getDb();
  await db
    .update(invoices)
    .set({ status: "OVERDUE", updatedAt: new Date() })
    .where(
      and(
        eq(invoices.status, "ISSUED"),
        sql`${invoices.dueAt} is not null`,
        sql`${invoices.dueAt} < now()`,
      ),
    );
}
