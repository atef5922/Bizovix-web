import { Laptop } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { AccountDeviceReplace } from "@/components/commercial/AccountDeviceReplace";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import { selfDeactivateDeviceAction } from "@/src/server/actions/account.actions";
import { requireCustomerPage } from "@/src/server/auth/guard";
import { listAccountDevices, countRecentSelfServiceReplacements } from "@/src/server/services/account";
import { formatDate, relativeTime } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const SELF_SERVICE_LIMIT = 2;

export default async function AccountDevicesPage() {
  const session = await requireCustomerPage();
  const [devices, used] = await Promise.all([
    listAccountDevices(session.company.id),
    countRecentSelfServiceReplacements(session.company.id),
  ]);

  const remaining = Math.max(0, SELF_SERVICE_LIMIT - used);
  const canManage = session.user.role === "OWNER" || session.user.role === "ADMIN";

  return (
    <>
      <SectionHeading
        eyebrow="MY BIZOVIX"
        title="Devices"
        description="Manage activated computers and replacements."
      />

      <div className="connection-banner">
        <Laptop />
        <div>
          <strong>
            {remaining} self-service change{remaining === 1 ? "" : "s"} remaining this month
          </strong>
          <span>
            {canManage
              ? `You can deactivate or replace up to ${SELF_SERVICE_LIMIT} devices per 30 days. Contact support for more.`
              : "Only a company owner or admin can deactivate or replace a device."}
          </span>
        </div>
      </div>

      <DataPanel>
        {devices.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title="No devices activated yet"
            description="Install Bizovix on a Windows computer and activate it with your license key."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Computer</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Activated</th>
                  <th>Last seen</th>
                  {canManage ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{device.deviceName}</strong>
                        <small>{device.platform}</small>
                      </div>
                    </td>
                    <td>{device.appVersion ?? "—"}</td>
                    <td><StatusBadge value={device.status} /></td>
                    <td>{formatDate(device.activatedAt)}</td>
                    <td>{relativeTime(device.lastSeenAt)}</td>
                    {canManage ? (
                      <td className="actions-col">
                        <div className="row-actions">
                          {device.status === "ACTIVE" ? (
                            <>
                              <RowAction
                                action={selfDeactivateDeviceAction}
                                fields={{ id: device.id }}
                                label="Deactivate"
                                disabled={remaining === 0}
                                disabledReason="Self-service limit reached — contact support."
                                confirm={`Deactivate ${device.deviceName}? This frees a licence seat.`}
                              />
                              <AccountDeviceReplace
                                deviceId={device.id}
                                deviceName={device.deviceName}
                                disabled={remaining === 0}
                              />
                            </>
                          ) : (
                            <span className="row-note">{device.status.toLowerCase()}</span>
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
      </DataPanel>
    </>
  );
}
