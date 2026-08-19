import { FileText } from "lucide-react";

import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import { requireCustomerPage } from "@/src/server/auth/guard";
import { listInvoices, reconcileInvoiceStates } from "@/src/server/services/billing";
import { formatDate, formatMoney } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

export default async function AccountInvoicesPage() {
  const session = await requireCustomerPage();

  await reconcileInvoiceStates();
  const invoices = await listInvoices({ companyId: session.company.id, pageSize: 50 });

  return (
    <>
      <SectionHeading
        eyebrow="MY BIZOVIX"
        title="Invoices & receipts"
        description="Download commercial billing documents."
      />

      <DataPanel>
        {invoices.rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Invoices are issued when a payment is confirmed or a term is billed."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th className="actions-col">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.rows.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.invoiceNumber}</strong></td>
                    <td>{row.description ?? "—"}</td>
                    <td className="amount">{formatMoney(row.amount, row.currencyCode)}</td>
                    <td><StatusBadge value={row.status} /></td>
                    <td>{formatDate(row.issuedAt)}</td>
                    <td>{formatDate(row.dueAt)}</td>
                    <td className="actions-col">
                      <a
                        className="row-action tone-default"
                        href={`/api/account/invoices/${row.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>View</span>
                      </a>
                    </td>
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
