import { Activity } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { BoolBadge, StatusBadge } from "@/components/commercial/StatusBadge";
import { renewSubscriptionAction, toggleAutoRenewAction } from "@/src/server/actions/billing.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { daysUntil, formatDate, formatMinor, listParamsFromSearchParams } from "@/src/server/services/shared";
import { listRenewals, reconcileSubscriptionStates } from "@/src/server/services/subscriptions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All dated terms" },
  { value: "DUE_7", label: "Due in 7 days" },
  { value: "DUE_30", label: "Due in 30 days" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "AUTO", label: "Auto-renewing" },
];

export default async function RenewalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);

  await reconcileSubscriptionStates();
  const result = await listRenewals(params);
  const canWrite = staffCan(session.user.role, "subscriptions.write");

  return (
    <>
      <SectionHeading
        title="Renewals"
        description="Upcoming and completed subscription renewals."
      />

      <DataPanel>
        <DataToolbar placeholder="Search renewals..." filters={FILTERS} filterLabel="Renewal window" />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Nothing due in this window"
            description="Subscriptions with an end date appear here as their renewal approaches."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Plan</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Renews</th>
                  <th>Days left</th>
                  <th>Auto-renew</th>
                  {canWrite ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => {
                  const left = daysUntil(row.endsAt);
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="cell-stack">
                          <strong>{row.companyName}</strong>
                          <small>{row.companyCode}</small>
                        </div>
                      </td>
                      <td>{row.planName}</td>
                      <td>{formatMinor(row.priceMinor, row.currencyCode)}</td>
                      <td><StatusBadge value={row.status} /></td>
                      <td>{formatDate(row.endsAt)}</td>
                      <td>
                        {left === null ? (
                          "—"
                        ) : (
                          <span className={`days-left ${left < 0 ? "overdue" : left <= 7 ? "urgent" : ""}`}>
                            {left < 0 ? `${Math.abs(left)}d overdue` : `${left}d`}
                          </span>
                        )}
                      </td>
                      <td><BoolBadge value={row.autoRenews} onLabel="On" offLabel="Off" /></td>
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
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroll>
        )}

        <Pagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
      </DataPanel>
    </>
  );
}
