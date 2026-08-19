import { CircleDollarSign } from "lucide-react";

import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import { requireCustomerPage } from "@/src/server/auth/guard";
import { listPayments } from "@/src/server/services/billing";
import { formatDate, formatMoney } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

export default async function AccountBillingPage() {
  const session = await requireCustomerPage();
  const payments = await listPayments({ companyId: session.company.id, pageSize: 50 });

  const settled = payments.rows.filter((row) => row.status === "PAID");
  const lifetime = settled.reduce((sum, row) => sum + Number(row.amount), 0);

  return (
    <>
      <SectionHeading
        eyebrow="MY BIZOVIX"
        title="Billing"
        description="Review payments and billing details."
      />

      <section className="detail-grid">
        <article className="detail-card">
          <span>Billing contact</span>
          <strong>{session.company.contactPerson ?? session.user.name}</strong>
          <small>{session.company.email ?? session.user.email}</small>
        </article>
        <article className="detail-card">
          <span>Billing address</span>
          <strong>{session.company.address ? "On file" : "Not set"}</strong>
          <small>{session.company.address ?? "Contact support to add one."}</small>
        </article>
        <article className="detail-card">
          <span>Payments settled</span>
          <strong>{settled.length}</strong>
          <small>Across the life of your account</small>
        </article>
        <article className="detail-card">
          <span>Lifetime total</span>
          <strong>{formatMoney(lifetime, session.company.currencyCode)}</strong>
          <small>Settled payments only</small>
        </article>
      </section>

      <DataPanel>
        {payments.rows.length === 0 ? (
          <EmptyState
            icon={CircleDollarSign}
            title="No payments recorded yet"
            description="Payments confirmed by Bizovix appear here with their reference."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.paidAt ?? row.createdAt)}</td>
                    <td className="amount">{formatMoney(row.amount, row.currencyCode)}</td>
                    <td>{row.paymentMethod.replace(/_/g, " ")}</td>
                    <td>{row.reference ?? "—"}</td>
                    <td>{row.purpose ?? row.planName ?? "—"}</td>
                    <td><StatusBadge value={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </DataPanel>
    </>
  );
}
