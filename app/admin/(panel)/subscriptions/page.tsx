import { CreditCard } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { CreateRecordPanel } from "@/components/commercial/RecordForm";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { BoolBadge, StatusBadge } from "@/components/commercial/StatusBadge";
import {
  cancelSubscriptionAction,
  createSubscriptionAction,
  reactivateSubscriptionAction,
  renewSubscriptionAction,
  suspendSubscriptionAction,
  toggleAutoRenewAction,
} from "@/src/server/actions/billing.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { listCompanyOptions } from "@/src/server/services/companies";
import { listPlanOptions } from "@/src/server/services/plans";
import { formatDate, formatMinor, listParamsFromSearchParams } from "@/src/server/services/shared";
import { listSubscriptions, reconcileSubscriptionStates } from "@/src/server/services/subscriptions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All subscriptions" },
  { value: "ACTIVE", label: "Active" },
  { value: "TRIALING", label: "Trialing" },
  { value: "PAYMENT_DUE", label: "Payment due" },
  { value: "GRACE_PERIOD", label: "In grace" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);

  await reconcileSubscriptionStates();
  const [result, companies, plans] = await Promise.all([
    listSubscriptions(params),
    listCompanyOptions(),
    listPlanOptions(),
  ]);
  const canWrite = staffCan(session.user.role, "subscriptions.write");

  return (
    <>
      <SectionHeading
        title="Subscriptions"
        description="Monthly, yearly and trial subscription lifecycle."
        actions={
          canWrite ? (
            <CreateRecordPanel
              title="Start a subscription"
              description="Opens a term without recording a payment."
              submitLabel="Start subscription"
              action={createSubscriptionAction}
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
                  label: "Plan",
                  required: true,
                  options: plans.map((p) => ({
                    value: p.id,
                    label: `${p.label} — ${formatMinor(p.priceMinor, p.currencyCode)}`,
                  })),
                },
                { kind: "date", name: "startsAt", label: "Start date", hint: "Defaults to today." },
                { kind: "checkbox", name: "isTrial", label: "Start as a 14-day trial" },
                { kind: "checkbox", name: "autoRenews", label: "Auto-renew at term end" },
              ]}
            />
          ) : null
        }
      />

      <DataPanel>
        <DataToolbar placeholder="Search subscriptions..." filters={FILTERS} />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No subscriptions match this view"
            description="Start a subscription, or confirm a payment to open one automatically."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Ends</th>
                  <th>Auto-renew</th>
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
                    <td>
                      <div className="cell-stack">
                        <span>{row.planName}</span>
                        <small>{row.billingType.replace(/_/g, " ").toLowerCase()}</small>
                      </div>
                    </td>
                    <td>{formatMinor(row.priceMinor, row.currencyCode)}</td>
                    <td><StatusBadge value={row.status} /></td>
                    <td>{formatDate(row.startsAt)}</td>
                    <td>
                      <div className="cell-stack">
                        <span>{row.endsAt ? formatDate(row.endsAt) : "Never"}</span>
                        {row.graceEndsAt ? <small>Grace to {formatDate(row.graceEndsAt)}</small> : null}
                      </div>
                    </td>
                    <td>
                      <BoolBadge value={row.autoRenews} onLabel="On" offLabel="Off" />
                    </td>
                    {canWrite ? (
                      <td className="actions-col">
                        <div className="row-actions">
                          <RowAction
                            action={renewSubscriptionAction}
                            fields={{ id: row.id }}
                            label="Renew"
                            tone="primary"
                            confirm="Extend this term without recording a payment?"
                          />
                          <RowAction
                            action={toggleAutoRenewAction}
                            fields={{ id: row.id, autoRenews: row.autoRenews ? "false" : "true" }}
                            label={row.autoRenews ? "Auto-renew off" : "Auto-renew on"}
                          />
                          {row.status === "SUSPENDED" || row.status === "CANCELLED" ? (
                            <RowAction
                              action={reactivateSubscriptionAction}
                              fields={{ id: row.id }}
                              label="Reactivate"
                            />
                          ) : (
                            <RowAction
                              action={suspendSubscriptionAction}
                              fields={{ id: row.id }}
                              label="Suspend"
                              confirm={`Suspend ${row.companyName}'s subscription?`}
                            />
                          )}
                          {row.status !== "CANCELLED" ? (
                            <RowAction
                              action={cancelSubscriptionAction}
                              fields={{ id: row.id }}
                              label="Cancel"
                              tone="danger"
                              confirm={`Cancel ${row.companyName}'s subscription? Auto-renew will be turned off.`}
                            />
                          ) : null}
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
