import { Users } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { CreateRecordPanel } from "@/components/commercial/RecordForm";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { BoolBadge, StatusBadge } from "@/components/commercial/StatusBadge";
import {
  createCustomerUserAction,
  setCustomerRoleAction,
  setCustomerUserActiveAction,
} from "@/src/server/actions/companies.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { listCompanyOptions, listCustomerUsers } from "@/src/server/services/companies";
import { formatDate, listParamsFromSearchParams, relativeTime } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All users" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Disabled" },
  { value: "OWNER", label: "Owners" },
  { value: "ADMIN", label: "Admins" },
  { value: "MEMBER", label: "Members" },
];

export default async function CustomerUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);
  const [result, companies] = await Promise.all([listCustomerUsers(params), listCompanyOptions()]);
  const canWrite = staffCan(session.user.role, "customers.write");

  return (
    <>
      <SectionHeading
        title="Customer users"
        description="View customer identities and company access."
        actions={
          canWrite ? (
            <CreateRecordPanel
              title="Add a customer user"
              description="Creates a portal identity scoped to one company."
              submitLabel="Create user"
              action={createCustomerUserAction}
              note="Passwords are hashed with scrypt before storage and are never readable afterwards."
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
                  name: "role",
                  label: "Role",
                  required: true,
                  defaultValue: "MEMBER",
                  options: [
                    { value: "OWNER", label: "Owner" },
                    { value: "ADMIN", label: "Admin" },
                    { value: "MEMBER", label: "Member" },
                  ],
                },
                { kind: "text", name: "name", label: "Full name", required: true },
                { kind: "email", name: "email", label: "Email", required: true },
                {
                  kind: "password",
                  name: "password",
                  label: "Portal password",
                  hint: "Minimum 8 characters. Leave blank to create the user without portal access.",
                  full: true,
                },
              ]}
            />
          ) : null
        }
      />

      <DataPanel>
        <DataToolbar placeholder="Search customer users..." filters={FILTERS} />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customer users match this view"
            description="Create a portal identity so a customer can sign in and manage their own licence."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Portal access</th>
                  <th>Last sign-in</th>
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
                        <small>{row.email}</small>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <span>{row.companyName}</span>
                        <small>{row.companyCode}</small>
                      </div>
                    </td>
                    <td><StatusBadge value={row.role} /></td>
                    <td>
                      <BoolBadge
                        value={row.isActive && row.hasPassword}
                        onLabel="Can sign in"
                        offLabel={row.hasPassword ? "Disabled" : "No password"}
                      />
                    </td>
                    <td>{relativeTime(row.lastLoginAt)}</td>
                    <td>{formatDate(row.createdAt)}</td>
                    {canWrite ? (
                      <td className="actions-col">
                        <div className="row-actions">
                          <RowAction
                            action={setCustomerUserActiveAction}
                            fields={{ id: row.id, isActive: row.isActive ? "false" : "true" }}
                            label={row.isActive ? "Disable" : "Enable"}
                            tone={row.isActive ? "danger" : "primary"}
                            confirm={row.isActive ? `Disable portal access for ${row.name}?` : undefined}
                          />
                          {row.role !== "OWNER" ? (
                            <RowAction
                              action={setCustomerRoleAction}
                              fields={{ id: row.id, role: "OWNER" }}
                              label="Make owner"
                            />
                          ) : (
                            <RowAction
                              action={setCustomerRoleAction}
                              fields={{ id: row.id, role: "MEMBER" }}
                              label="Make member"
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
