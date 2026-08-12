import { CircleDollarSign } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { CreateRecordPanel } from "@/components/commercial/RecordForm";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import {
  recordManualPaymentAction,
  updatePaymentStatusAction,
} from "@/src/server/actions/billing.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { listPayments } from "@/src/server/services/billing";
import { listCompanyOptions } from "@/src/server/services/companies";
import { listPlanOptions } from "@/src/server/services/plans";
import {
  formatDate,
  formatMinor,
  formatMoney,
  listParamsFromSearchParams,
} from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All payments" },
  { value: "PAID", label: "Settled" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);
  const [result, companies, plans] = await Promise.all([
    listPayments(params),
    listCompanyOptions(),
    listPlanOptions(),
  ]);
  const canWrite = staffCan(session.user.role, "payments.write");

  return (
    <>
      <SectionHeading
        title="Payments"
        description="Settled, pending and failed commercial payments."
        actions={
          canWrite ? (
            <CreateRecordPanel
              title="Record a manual payment"
              description="Confirms money already received outside a gateway."
              triggerLabel="Record payment"
              submitLabel="Confirm payment"
              action={recordManualPaymentAction}
              note="Confirming runs the shared settlement path in one transaction: the invoice is issued, the subscription term extended, and every matching licence reactivated."
              fields={[
                {
                  kind: "select",
                  name: "companyId",
                  label: "Company",
                  required: true,
                  options: companies.map((c) => ({ value: c.id, label: c.label })),
                },
                {
                  kind: "select",
                  name: "planId",
                  label: "Plan being paid for",
                  required: true,
                  options: plans.map((p) => ({
                    value: p.id,
                    label: `${p.label} — ${formatMinor(p.priceMinor, p.currencyCode)}`,
                  })),
                },
                {
                  kind: "text",
                  name: "amount",
                  label: "Amount received",
                  required: true,
                  placeholder: "15300.00",
                  hint: "Major units, e.g. 15300.00 for BDT 15,300.",
                },
                {
                  kind: "select",
                  name: "paymentMethod",
                  label: "Method",
                  required: true,
                  defaultValue: "bank_transfer",
                  options: [
                    { value: "bank_transfer", label: "Bank transfer" },
                    { value: "mobile_banking", label: "Mobile banking" },
                    { value: "cash", label: "Cash" },
                    { value: "cheque", label: "Cheque" },
                    { value: "card", label: "Card" },
                  ],
                },
                { kind: "text", name: "reference", label: "Reference", placeholder: "TXN / slip number" },
                { kind: "date", name: "paidAt", label: "Payment date", hint: "Defaults to today." },
                { kind: "text", name: "purpose", label: "Purpose", full: true, placeholder: "Annual renewal 2026" },
              ]}
            />
          ) : null
        }
      />

      <DataPanel>
        <DataToolbar placeholder="Search payments..." filters={FILTERS} />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={CircleDollarSign}
            title="No payments match this view"
            description="Record a manual payment to settle an invoice and activate the customer's term."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Paid</th>
                  {canWrite ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{row.companyName}</strong>
                        <small>{row.companyCode}</small>
                      </div>
                    </td>
                    <td className="amount">{formatMoney(row.amount, row.currencyCode)}</td>
                    <td>{row.paymentMethod.replace(/_/g, " ")}</td>
                    <td>
                      <div className="cell-stack">
                        <span>{row.reference ?? "—"}</span>
                        <small>{row.purpose ?? (row.gateway ? row.gateway : "manual")}</small>
                      </div>
                    </td>
                    <td>{row.planName ?? "—"}</td>
                    <td><StatusBadge value={row.status} /></td>
                    <td>{formatDate(row.paidAt ?? row.createdAt)}</td>
                    {canWrite ? (
                      <td className="actions-col">
                        <div className="row-actions">
                          {row.status === "PAID" ? (
                            <RowAction
                              action={updatePaymentStatusAction}
                              fields={{ id: row.id, status: "REFUNDED" }}
                              label="Mark refunded"
                              tone="danger"
                              confirm="Mark this settled payment as refunded?"
                            />
                          ) : row.status === "PENDING" ? (
                            <>
                              <RowAction
                                action={updatePaymentStatusAction}
                                fields={{ id: row.id, status: "FAILED" }}
                                label="Mark failed"
                                tone="danger"
                              />
                              <RowAction
                                action={updatePaymentStatusAction}
                                fields={{ id: row.id, status: "CANCELLED" }}
                                label="Cancel"
                              />
                            </>
                          ) : (
                            <span className="row-note">No actions</span>
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
