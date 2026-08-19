import { Gauge } from "lucide-react";

import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { requireStaffPage } from "@/src/server/auth/guard";
import { listAuditLogs } from "@/src/server/services/audit";
import {
  formatDateTime,
  listParamsFromSearchParams,
  normalizeListParams,
} from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All entities" },
  { value: "license", label: "Licenses" },
  { value: "device_activation", label: "Devices" },
  { value: "payment", label: "Payments" },
  { value: "invoice", label: "Invoices" },
  { value: "subscription", label: "Subscriptions" },
  { value: "company", label: "Companies" },
  { value: "customer_user", label: "Customer users" },
  { value: "plan", label: "Plans" },
  { value: "staff_user", label: "Staff sign-ins" },
];

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);
  const { page, pageSize, offset, search, status } = normalizeListParams(params);

  const result = await listAuditLogs({
    limit: pageSize,
    offset,
    search,
    entityType: status && status !== "ALL" ? status : undefined,
  });

  const pageCount = Math.max(1, Math.ceil(result.total / pageSize));

  return (
    <>
      <SectionHeading
        title="Activity logs"
        description="Auditable history of sensitive platform actions."
      />

      <DataPanel>
        <DataToolbar placeholder="Search activity..." filters={FILTERS} filterLabel="Entity type" />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={Gauge}
            title="No activity recorded for this view"
            description="Every licensing, billing, device and customer change is written here automatically."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Summary</th>
                  <th>Company</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td>
                      <div className="cell-stack">
                        <strong>{row.actorName ?? "System"}</strong>
                        <small>{row.actorEmail ?? row.actorType.toLowerCase()}</small>
                      </div>
                    </td>
                    <td><code className="action-code">{row.action}</code></td>
                    <td className="summary-cell">{row.summary ?? "—"}</td>
                    <td>{row.companyName ?? "—"}</td>
                    <td>{row.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}

        <Pagination page={page} pageCount={pageCount} total={result.total} pageSize={pageSize} />
      </DataPanel>
    </>
  );
}
