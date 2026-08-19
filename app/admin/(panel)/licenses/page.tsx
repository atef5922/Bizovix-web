import Link from "next/link";
import { KeyRound, Sparkles } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import {
  reactivateLicenseAction,
  reissueLicenseAction,
  revokeLicenseAction,
  suspendLicenseAction,
} from "@/src/server/actions/licensing.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { expireLapsedLicenses, listLicenses } from "@/src/server/services/licenses";
import { daysUntil, formatDate, listParamsFromSearchParams } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All licenses" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "REVOKED", label: "Revoked" },
  { value: "MONTHLY", label: "Type: monthly" },
  { value: "YEARLY", label: "Type: yearly" },
  { value: "PERPETUAL", label: "Type: perpetual" },
];

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);

  await expireLapsedLicenses();
  const result = await listLicenses(params);
  const canCreate = staffCan(session.user.role, "licenses.create");
  const canRevoke = staffCan(session.user.role, "licenses.revoke");
  const showActions = canCreate || canRevoke;

  return (
    <>
      <SectionHeading
        title="Licenses"
        description="Issue and manage secure company licenses."
        actions={
          canCreate ? (
            <Link href="/admin/licenses/new" className="heading-link-button">
              <Sparkles /> Generate license
            </Link>
          ) : null
        }
      />

      <DataPanel>
        <DataToolbar placeholder="Search licenses..." filters={FILTERS} />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No licenses match this view"
            description="Generate a license to give a customer an activation key for their desktop installs."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>License key</th>
                  <th>Company</th>
                  <th>Plan</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="num">Devices</th>
                  <th>Expires</th>
                  {showActions ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => {
                  const left = daysUntil(row.expiresAt);
                  const atLimit = row.activeDevices >= row.maxDevices;
                  return (
                    <tr key={row.id}>
                      <td><code className="key-mask">{row.maskedKey}</code></td>
                      <td>
                        <div className="cell-stack">
                          <strong>{row.companyName}</strong>
                          <small>{row.companyCode}</small>
                        </div>
                      </td>
                      <td>{row.planName}</td>
                      <td><StatusBadge value={row.licenseType} /></td>
                      <td><StatusBadge value={row.status} /></td>
                      <td className="num">
                        <span className={atLimit ? "seat-count at-limit" : "seat-count"}>
                          {row.activeDevices}/{row.maxDevices}
                        </span>
                      </td>
                      <td>
                        <div className="cell-stack">
                          <span>{row.expiresAt ? formatDate(row.expiresAt) : "Never"}</span>
                          {left !== null && row.status === "ACTIVE" ? (
                            <small className={left <= 7 ? "urgent" : ""}>
                              {left < 0 ? `${Math.abs(left)}d overdue` : `${left}d left`}
                            </small>
                          ) : null}
                        </div>
                      </td>
                      {showActions ? (
                        <td className="actions-col">
                          <div className="row-actions">
                            {row.status === "REVOKED" ? (
                              <span className="row-note">Revoked</span>
                            ) : (
                              <>
                                {canRevoke ? (
                                  <>
                                    {row.status === "SUSPENDED" ? (
                                      <RowAction
                                        action={reactivateLicenseAction}
                                        fields={{ id: row.id }}
                                        label="Reactivate"
                                        tone="primary"
                                      />
                                    ) : (
                                      <RowAction
                                        action={suspendLicenseAction}
                                        fields={{ id: row.id }}
                                        label="Suspend"
                                        confirm={`Suspend this license for ${row.companyName}?`}
                                      />
                                    )}
                                    <RowAction
                                      action={reissueLicenseAction}
                                      fields={{ id: row.id }}
                                      label="Reissue"
                                      confirm="Reissue this license? The current key stops working immediately."
                                    />
                                    <RowAction
                                      action={revokeLicenseAction}
                                      fields={{ id: row.id }}
                                      label="Revoke"
                                      tone="danger"
                                      confirm={`Revoke this license permanently? All ${row.activeDevices} active device(s) will be deactivated.`}
                                    />
                                  </>
                                ) : (
                                  <span className="row-note">Super admin only</span>
                                )}
                              </>
                            )}
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
