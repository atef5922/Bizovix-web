import { Building2 } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { CreateRecordPanel } from "@/components/commercial/RecordForm";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { createCompanyAction, setCompanyStatusAction } from "@/src/server/actions/companies.actions";
import { listCompanies, nextCompanyCode } from "@/src/server/services/companies";
import { formatDate, listParamsFromSearchParams } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "TRIAL", label: "Trial" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);
  const [result, suggestedCode] = await Promise.all([listCompanies(params), nextCompanyCode()]);
  const canWrite = staffCan(session.user.role, "companies.write");

  return (
    <>
      <SectionHeading
        title="Companies"
        description="Manage customer companies and their commercial status."
        actions={
          canWrite ? (
            <CreateRecordPanel
              title="Add a company"
              description="Creates the commercial customer record."
              submitLabel="Create company"
              action={createCompanyAction}
              fields={[
                { kind: "text", name: "name", label: "Company name", required: true, placeholder: "Acme Trading Ltd" },
                { kind: "text", name: "companyCode", label: "Company code", defaultValue: suggestedCode, hint: "Leave as-is to use the next sequential code." },
                { kind: "text", name: "contactPerson", label: "Contact person", placeholder: "Full name" },
                { kind: "email", name: "email", label: "Email", placeholder: "billing@company.com" },
                { kind: "tel", name: "phone", label: "Phone", placeholder: "+8801XXXXXXXXX" },
                {
                  kind: "select",
                  name: "status",
                  label: "Commercial status",
                  required: true,
                  defaultValue: "TRIAL",
                  options: FILTERS.filter((f) => f.value !== "ALL").map((f) => ({ value: f.value, label: f.label })),
                },
                { kind: "textarea", name: "address", label: "Address", full: true },
                { kind: "textarea", name: "notes", label: "Internal notes", full: true },
              ]}
            />
          ) : null
        }
      />

      <DataPanel>
        <DataToolbar placeholder="Search companies..." filters={FILTERS} />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No companies match this view"
            description="Adjust the search or filter, or add your first customer company."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th className="num">Users</th>
                  <th className="num">Licenses</th>
                  <th className="num">Devices</th>
                  <th>Created</th>
                  {canWrite ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{row.name}</strong>
                        <small>{row.companyCode}</small>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <span>{row.contactPerson ?? "—"}</span>
                        <small>{row.email ?? row.phone ?? "—"}</small>
                      </div>
                    </td>
                    <td><StatusBadge value={row.status} /></td>
                    <td>
                      <div className="cell-stack">
                        <span>{row.planName ?? "No plan"}</span>
                        <small>{row.subscriptionEndsAt ? `Ends ${formatDate(row.subscriptionEndsAt)}` : "—"}</small>
                      </div>
                    </td>
                    <td className="num">{row.userCount}</td>
                    <td className="num">{row.licenseCount}</td>
                    <td className="num">{row.deviceCount}</td>
                    <td>{formatDate(row.createdAt)}</td>
                    {canWrite ? (
                      <td className="actions-col">
                        <div className="row-actions">
                          {row.status !== "ACTIVE" ? (
                            <RowAction
                              action={setCompanyStatusAction}
                              fields={{ id: row.id, status: "ACTIVE" }}
                              label="Activate"
                              tone="primary"
                            />
                          ) : null}
                          {row.status !== "SUSPENDED" ? (
                            <RowAction
                              action={setCompanyStatusAction}
                              fields={{ id: row.id, status: "SUSPENDED" }}
                              label="Suspend"
                              confirm={`Suspend ${row.name}? Their access will be blocked.`}
                            />
                          ) : null}
                          {row.status !== "CANCELLED" ? (
                            <RowAction
                              action={setCompanyStatusAction}
                              fields={{ id: row.id, status: "CANCELLED" }}
                              label="Cancel"
                              tone="danger"
                              confirm={`Cancel ${row.name}? This ends their commercial relationship.`}
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

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          pageSize={result.pageSize}
        />
      </DataPanel>
    </>
  );
}
