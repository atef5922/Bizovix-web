import { PackageOpen } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { CreateRecordPanel } from "@/components/commercial/RecordForm";
import { PlanFeatureEditor } from "@/components/commercial/PlanFeatureEditor";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { BoolBadge, StatusBadge } from "@/components/commercial/StatusBadge";
import { createPlanAction, setPlanActiveAction } from "@/src/server/actions/catalog.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { listFeaturesWithPlanState, listPlans } from "@/src/server/services/plans";
import { formatMinor, listParamsFromSearchParams } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All plans" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "ONE_TIME", label: "One-time" },
];

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);
  const [result, features] = await Promise.all([listPlans(params), listFeaturesWithPlanState()]);
  const canWrite = staffCan(session.user.role, "plans.write");

  return (
    <>
      <SectionHeading
        title="Plans & features"
        description="Database-driven pricing, limits and entitlements."
        actions={
          canWrite ? (
            <CreateRecordPanel
              title="Create a plan"
              description="Plans drive pricing, device limits and entitlements."
              triggerLabel="Add plan"
              submitLabel="Create plan"
              action={createPlanAction}
              fields={[
                { kind: "text", name: "name", label: "Plan name", required: true, placeholder: "Standard Yearly" },
                { kind: "text", name: "code", label: "Plan code", required: true, placeholder: "standard-yearly" },
                {
                  kind: "select",
                  name: "billingType",
                  label: "Billing type",
                  required: true,
                  defaultValue: "MONTHLY",
                  options: [
                    { value: "MONTHLY", label: "Monthly" },
                    { value: "YEARLY", label: "Yearly" },
                    { value: "ONE_TIME", label: "One-time / perpetual" },
                  ],
                },
                { kind: "text", name: "price", label: "Price", required: true, placeholder: "15300", hint: "Major units, e.g. 15300 for BDT 15,300." },
                { kind: "number", name: "maxUsers", label: "Max users", defaultValue: "1", min: "1" },
                { kind: "number", name: "maxDevices", label: "Max devices", defaultValue: "1", min: "1" },
                { kind: "number", name: "offlineGraceDays", label: "Offline grace days", defaultValue: "7", min: "0" },
                { kind: "number", name: "sortOrder", label: "Sort order", defaultValue: "0" },
                { kind: "checkbox", name: "isPublic", label: "Show on the public pricing page" },
                { kind: "textarea", name: "description", label: "Description", full: true },
              ]}
            />
          ) : null
        }
      />

      <DataPanel>
        <DataToolbar placeholder="Search plans..." filters={FILTERS} />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="No plans match this view"
            description="Create a plan to price subscriptions and control which features a license grants."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Billing</th>
                  <th>Price</th>
                  <th className="num">Users</th>
                  <th className="num">Devices</th>
                  <th className="num">Features</th>
                  <th className="num">Subscribers</th>
                  <th>State</th>
                  {canWrite ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{row.name}</strong>
                        <small>{row.code}</small>
                      </div>
                    </td>
                    <td><StatusBadge value={row.billingType} /></td>
                    <td className="amount">{formatMinor(row.priceMinor, row.currencyCode)}</td>
                    <td className="num">{row.maxUsers}</td>
                    <td className="num">{row.maxDevices}</td>
                    <td className="num">{row.featureCount}</td>
                    <td className="num">{row.subscriberCount}</td>
                    <td>
                      <div className="cell-stack">
                        <BoolBadge value={row.isActive} onLabel="Active" offLabel="Inactive" />
                        <small>{row.isPublic ? "Public" : "Private"}</small>
                      </div>
                    </td>
                    {canWrite ? (
                      <td className="actions-col">
                        <div className="row-actions">
                          <PlanFeatureEditor
                            planId={row.id}
                            planName={row.name}
                            features={features.map((f) => ({ id: f.id, name: f.name, moduleKey: f.moduleKey }))}
                          />
                          <RowAction
                            action={setPlanActiveAction}
                            fields={{ id: row.id, isActive: row.isActive ? "false" : "true" }}
                            label={row.isActive ? "Deactivate" : "Activate"}
                            tone={row.isActive ? "danger" : "primary"}
                            confirm={
                              row.isActive
                                ? `Deactivate ${row.name}? It will no longer be selectable for new subscriptions.`
                                : undefined
                            }
                          />
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
