import { ShieldCheck } from "lucide-react";

import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import { requireStaffPage } from "@/src/server/auth/guard";
import { listActivations } from "@/src/server/services/devices";
import { formatDateTime, listParamsFromSearchParams, relativeTime } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All activations" },
  { value: "ACTIVE", label: "Currently active" },
  { value: "DEACTIVATED", label: "Deactivated" },
  { value: "REPLACED", label: "Replaced" },
  { value: "BLOCKED", label: "Blocked" },
];

export default async function ActivationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);
  const result = await listActivations(params);

  return (
    <>
      <SectionHeading
        title="Activations"
        description="License activation history and device usage."
      />

      <DataPanel>
        <DataToolbar placeholder="Search activations..." filters={FILTERS} />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No activation history yet"
            description="Each time a desktop install activates against a license key, it is recorded here."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Activated</th>
                  <th>Device</th>
                  <th>Company</th>
                  <th>License</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Last check-in</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.activatedAt)}</td>
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
                    <td>{relativeTime(row.lastSeenAt)}</td>
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
