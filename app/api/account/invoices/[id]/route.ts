import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { getCustomerSession } from "@/src/server/auth/session";
import { getDb } from "@/src/server/db/client";
import { invoices, payments } from "@/src/server/db/schema";
import { isDatabaseConfigured } from "@/src/server/env";
import { formatDate, formatMoney } from "@/src/server/services/shared";
import { siteConfig } from "@/src/config/site";

export const dynamic = "force-dynamic";

/** Escapes text before interpolation so a customer-supplied field cannot inject markup. */
function esc(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  const db = getDb();

  // Scoped by the session's company: an invoice id alone must not grant access.
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.companyId, session.company.id)))
    .limit(1);

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const paymentRows = await db
    .select()
    .from(payments)
    .where(and(eq(payments.invoiceId, invoice.id), eq(payments.status, "PAID")));

  const company = session.company;
  const total = formatMoney(invoice.amount, invoice.currencyCode);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(invoice.invoiceNumber)} — Bizovix</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin:0; padding:40px 24px; background:#f4f7fb; color:#14213d;
         font:14px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  .sheet { max-width:760px; margin:auto; background:#fff; border:1px solid #e1e7f0;
           border-radius:14px; padding:40px; }
  header { display:flex; justify-content:space-between; align-items:flex-start;
           gap:24px; border-bottom:1px solid #edf1f7; padding-bottom:24px; }
  h1 { margin:0 0 4px; font-size:22px; }
  .muted { color:#7b879c; font-size:12px; }
  .status { display:inline-block; border-radius:99px; padding:4px 12px; font-size:11px;
            font-weight:800; text-transform:uppercase; letter-spacing:.04em; }
  .status.paid { background:#e9f9f1; color:#079455; }
  .status.other { background:#eef2f6; color:#667085; }
  .cols { display:flex; gap:40px; flex-wrap:wrap; margin:28px 0; }
  .cols div { min-width:180px; }
  .cols strong { display:block; font-size:10px; letter-spacing:.1em; color:#98a2b3;
                 text-transform:uppercase; margin-bottom:6px; }
  table { width:100%; border-collapse:collapse; margin-top:12px; }
  th,td { text-align:left; padding:12px 8px; border-bottom:1px solid #edf1f7; font-size:13px; }
  th { font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:#98a2b3; }
  td.amt, th.amt { text-align:right; }
  .total { display:flex; justify-content:flex-end; gap:40px; margin-top:20px;
           font-size:16px; font-weight:800; }
  footer { margin-top:32px; border-top:1px solid #edf1f7; padding-top:20px;
           color:#98a2b3; font-size:11px; }
  .print { margin:0 auto 20px; display:block; max-width:760px; }
  .print button { border:1px solid #dce3ed; background:#fff; border-radius:8px;
                  padding:9px 16px; font-weight:700; cursor:pointer; }
  @media print { body { background:#fff; padding:0; } .sheet { border:0; } .print { display:none; } }
</style>
</head>
<body>
<div class="print"><button type="button" onclick="window.print()">Print / Save as PDF</button></div>
<div class="sheet">
  <header>
    <div>
      <h1>Invoice ${esc(invoice.invoiceNumber)}</h1>
      <p class="muted">Issued ${formatDate(invoice.issuedAt)}${invoice.dueAt ? ` · Due ${formatDate(invoice.dueAt)}` : ""}</p>
    </div>
    <span class="status ${invoice.status === "PAID" ? "paid" : "other"}">${esc(invoice.status)}</span>
  </header>

  <div class="cols">
    <div>
      <strong>From</strong>
      Bizovix<br />
      <span class="muted">${esc(siteConfig.address)}</span><br />
      <span class="muted">${esc(siteConfig.salesEmail)}</span>
    </div>
    <div>
      <strong>Billed to</strong>
      ${esc(company.name)}<br />
      <span class="muted">${esc(company.companyCode)}</span><br />
      ${company.address ? `<span class="muted">${esc(company.address)}</span><br />` : ""}
      ${company.email ? `<span class="muted">${esc(company.email)}</span>` : ""}
    </div>
  </div>

  <table>
    <thead><tr><th>Description</th><th class="amt">Amount</th></tr></thead>
    <tbody>
      <tr>
        <td>${esc(invoice.description) || "Bizovix subscription"}</td>
        <td class="amt">${esc(total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="total"><span>Total</span><span>${esc(total)}</span></div>

  ${
    paymentRows.length > 0
      ? `<table>
          <thead><tr><th>Payment received</th><th>Method</th><th>Reference</th><th class="amt">Amount</th></tr></thead>
          <tbody>${paymentRows
            .map(
              (p) => `<tr>
                <td>${formatDate(p.paidAt)}</td>
                <td>${esc(p.paymentMethod.replace(/_/g, " "))}</td>
                <td>${esc(p.reference) || "—"}</td>
                <td class="amt">${esc(formatMoney(p.amount, p.currencyCode))}</td>
              </tr>`,
            )
            .join("")}</tbody>
        </table>`
      : ""
  }

  <footer>
    This document was generated from the Bizovix customer portal for ${esc(company.name)}.
    Questions about this invoice? Contact ${esc(siteConfig.salesEmail)}.
  </footer>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
