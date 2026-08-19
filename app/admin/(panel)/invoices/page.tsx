import { FileText } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { CreateRecordPanel } from "@/components/commercial/RecordForm";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import { createInvoiceAction, updateInvoiceStatusAction } from "@/src/server/actions/billing.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { listInvoices, reconcileInvoiceStates } from "@/src/server/services/billing";
import { listCompanyOptions } from "@/src/server/services/companies";
import { formatDate, formatMoney, listParamsFromSearchParams } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All invoices" },
  { value: "ISSUED", label: "Issued" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "VOID", label: "Void" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);

  await reconcileInvoiceStates();
  const [result, companies] = await Promise.all([listInvoices(params), listCompanyOptions()]);
  const canWrite = staffCan(session.user.role, "invoices.write");

  return (
    <>
      <SectionHeading
        title="Invoices"
        description="Commercial invoices and customer receipts."
        actions={
          canWrite ? (
            <CreateRecordPanel
              title="Issue an invoice"
              description="Numbering is sequential per calendar year."
              triggerLabel="Issue invoice"
              submitLabel="Issue invoice"
              action={createInvoiceAction}
              fields={[
                {
                  kind: "select",
                  name: "companyId",
                  label: "Company",
                  required: true,
                  options: companies.map((c) => ({ value: c.id, label: c.label })),
                },
                { kind: "text", name: "amount", label: "Amount", required: true, placeholder: "15300.00" },
                { kind: "date", name: "issuedAt", label: "Issue date", hint: "Defaults to today." },
                { kind: "date", name: "dueAt", label: "Due date" },
                { kind: "text", name: "description", label: "Description", full: true, placeholder: "Standard Yearly — 2026 renewal" },
              ]}
            />
          ) : null
        }
      />

      <DataPanel>
        <DataToolbar placeholder="Search invoices..." filters={FILTERS} />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices match this view"
            description="Invoices are created here, or automatically when a payment is settled."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Company</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Paid</th>
                  {canWrite ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{row.invoiceNumber}</strong>
                        <small>{row.description ?? "—"}</small>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <span>{row.companyName}</span>
                        <small>{row.companyCode}</small>
                      </div>
                    </td>
                    <td className="amount">{formatMoney(row.amount, row.currencyCode)}</td>
                    <td><StatusBadge value={row.status} /></td>
                    <td>{formatDate(row.issuedAt)}</td>
                    <td>{formatDate(row.dueAt)}</td>
                    <td>{formatDate(row.paidAt)}</td>
                    {canWrite ? (
                      <td className="actions-col">
                        <div className="row-actions">
                          {row.status !== "PAID" ? (
                            <RowAction
                              action={updateInvoiceStatusAction}
                              fields={{ id: row.id, status: "PAID" }}
                              label="Mark paid"
                              tone="primary"
                            />
                          ) : null}
                          {row.status !== "VOID" ? (
                            <RowAction
                              action={updateInvoiceStatusAction}
                              fields={{ id: row.id, status: "VOID" }}
                              label="Void"
                              tone="danger"
                              confirm={`Void ${row.invoiceNumber}?`}
                            />
                          ) : (
                            <RowAction
                              action={updateInvoiceStatusAction}
                              fields={{ id: row.id, status: "ISSUED" }}
                              label="Reissue"
                            />
                          )}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}

        <Pagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
      </DataPanel>
    </>
  );
}
