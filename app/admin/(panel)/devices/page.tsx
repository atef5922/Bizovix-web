import { Laptop } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import { DeviceReplaceButton } from "@/components/commercial/DeviceReplaceButton";
import {
  blockDeviceAction,
  deactivateDeviceAction,
  reactivateDeviceAction,
} from "@/src/server/actions/licensing.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { listDevices } from "@/src/server/services/devices";
import { formatDate, listParamsFromSearchParams, relativeTime } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All devices" },
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVATED", label: "Deactivated" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "REPLACED", label: "Replaced" },
];

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);
  const result = await listDevices(params);
  const canWrite = staffCan(session.user.role, "devices.write");

  return (
    <>
      <SectionHeading
        title="Device activations"
        description="Monitor, deactivate and replace licensed devices."
      />

      <DataPanel>
        <DataToolbar placeholder="Search devices..." filters={FILTERS} />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title="No device activations match this view"
            description="Devices appear here once a desktop install activates against a licence key."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Company</th>
                  <th>License</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Activated</th>
                  <th>Last seen</th>
                  {canWrite ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{row.deviceName}</strong>
                        <small>{row.platform}</small>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <span>{row.companyName}</span>
                        <small>{row.companyCode}</small>
                      </div>
                    </td>
                    <td><code className="key-mask">{row.maskedKey}</code></td>
                    <td>{row.appVersion ?? "—"}</td>
                    <td><StatusBadge value={row.status} /></td>
                    <td>{formatDate(row.activatedAt)}</td>
                    <td>{relativeTime(row.lastSeenAt)}</td>
                    {canWrite ? (
                      <td className="actions-col">
                        <div className="row-actions">
                          {row.status === "ACTIVE" ? (
                            <>
                              <RowAction
                                action={deactivateDeviceAction}
                                fields={{ id: row.id }}
                                label="Deactivate"
                                confirm={`Deactivate ${row.deviceName}? It will free a licence seat.`}
                              />
                              <DeviceReplaceButton deviceId={row.id} deviceName={row.deviceName} />
                              <RowAction
                                action={blockDeviceAction}
                                fields={{ id: row.id }}
                                label="Block"
                                tone="danger"
                                confirm={`Block ${row.deviceName}? It will be refused on future activation attempts.`}
                              />
                            </>
                          ) : row.status === "REPLACED" ? (
                            <span className="row-note">Replaced</span>
                          ) : (
                            <RowAction
                              action={reactivateDeviceAction}
                              fields={{ id: row.id }}
                              label="Reactivate"
                              tone="primary"
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
