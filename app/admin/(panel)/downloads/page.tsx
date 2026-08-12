import { Download } from "lucide-react";

import { RowAction } from "@/components/commercial/ActionControls";
import { DataToolbar, Pagination } from "@/components/commercial/DataViews";
import { CreateRecordPanel } from "@/components/commercial/RecordForm";
import { DataPanel, EmptyState, SectionHeading, TableScroll } from "@/components/commercial/SectionShell";
import { BoolBadge } from "@/components/commercial/StatusBadge";
import { createReleaseAction, setLatestReleaseAction } from "@/src/server/actions/catalog.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { listDownloadEvents, listReleases } from "@/src/server/services/downloads";
import { formatDate, formatDateTime, listParamsFromSearchParams } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "ALL", label: "All downloads" },
  { value: "LAST_7", label: "Last 7 days" },
  { value: "LAST_30", label: "Last 30 days" },
  { value: "AUTHENTICATED", label: "From signed-in customers" },
  { value: "ANONYMOUS", label: "Anonymous" },
];

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireStaffPage();
  const params = listParamsFromSearchParams(await searchParams);
  const [result, releases] = await Promise.all([listDownloadEvents(params), listReleases()]);
  const canWrite = staffCan(session.user.role, "releases.write");

  return (
    <>
      <SectionHeading
        title="Software downloads"
        description="Installer download events and activation conversion."
        actions={
          canWrite ? (
            <CreateRecordPanel
              title="Publish a release"
              description="Registers an installer version for the public download route."
              triggerLabel="Add release"
              submitLabel="Publish release"
              action={createReleaseAction}
              fields={[
                { kind: "text", name: "version", label: "Version", required: true, placeholder: "1.5.0" },
                { kind: "text", name: "fileName", label: "Installer file name", required: true, placeholder: "Bizovix-ERP-Setup-1.5.0.exe" },
                { kind: "text", name: "downloadPath", label: "Download path", placeholder: "/software/Bizovix-ERP-Setup-1.5.0.exe", hint: "Defaults to /software/<file name>." },
                { kind: "checkbox", name: "isLatest", label: "Make this the current download" },
                { kind: "textarea", name: "releaseNotes", label: "Release notes", full: true },
              ]}
            />
          ) : null
        }
      />

      <section className="workspace-panel release-panel">
        <div className="panel-head">
          <div>
            <h2>Releases</h2>
            <p>Versions available to customers</p>
          </div>
        </div>
        {releases.length === 0 ? (
          <p className="dropdown-empty">No releases registered yet.</p>
        ) : (
          <TableScroll>
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Installer</th>
                  <th>Platform</th>
                  <th>Published</th>
                  <th>Current</th>
                  {canWrite ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {releases.map((release) => (
                  <tr key={release.id}>
                    <td><strong>{release.version}</strong></td>
                    <td><code className="key-mask">{release.fileName}</code></td>
                    <td>{release.platform}</td>
                    <td>{formatDate(release.publishedAt)}</td>
                    <td><BoolBadge value={release.isLatest} onLabel="Current" offLabel="Archived" /></td>
                    {canWrite ? (
                      <td className="actions-col">
                        {release.isLatest ? (
                          <span className="row-note">Current</span>
                        ) : (
                          <RowAction
                            action={setLatestReleaseAction}
                            fields={{ id: release.id }}
                            label="Make current"
                            tone="primary"
                          />
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </section>

      <DataPanel>
        <DataToolbar placeholder="Search download events..." filters={FILTERS} filterLabel="Download window" />

        {result.rows.length === 0 ? (
          <EmptyState
            icon={Download}
            title="No download events in this view"
            description="Every installer download from the website or the customer portal is recorded here."
          />
        ) : (
          <TableScroll>
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Platform</th>
                  <th>Version</th>
                  <th>Source</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td>{row.platform}</td>
                    <td>{row.appVersion ?? "—"}</td>
                    <td>{row.source.replace(/_/g, " ")}</td>
                    <td>{row.companyName ?? <span className="row-note">Anonymous</span>}</td>
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
