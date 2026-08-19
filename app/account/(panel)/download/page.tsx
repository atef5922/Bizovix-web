import { Download, ShieldCheck } from "lucide-react";

import { AccountDownloadButton } from "@/components/commercial/AccountDownloadButton";
import { EmptyState, SectionHeading } from "@/components/commercial/SectionShell";
import { requireCustomerPage } from "@/src/server/auth/guard";
import { getAccountLicense } from "@/src/server/services/account";
import { getLatestRelease } from "@/src/server/services/downloads";
import { formatDate } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

export default async function AccountDownloadPage() {
  const session = await requireCustomerPage();
  const [release, license] = await Promise.all([
    getLatestRelease(),
    getAccountLicense(session.company.id),
  ]);

  return (
    <>
      <SectionHeading
        eyebrow="MY BIZOVIX"
        title="Download Bizovix"
        description="Get the latest official Windows installer."
      />

      {!release ? (
        <section className="workspace-panel">
          <EmptyState
            icon={Download}
            title="No installer published yet"
            description="Your Bizovix account manager will publish the Windows installer shortly."
          />
        </section>
      ) : (
        <>
          <section className="workspace-panel download-panel">
            <div className="download-hero">
              <span><Download /></span>
              <div>
                <h2>Bizovix ERP for Windows</h2>
                <p>
                  Version {release.version} · Published {formatDate(release.publishedAt)}
                </p>
                <code className="key-mask">{release.fileName}</code>
              </div>
              <AccountDownloadButton
                version={release.version}
                href={release.downloadPath ?? `/software/${release.fileName}`}
                fileName={release.fileName}
              />
            </div>
            {release.releaseNotes ? (
              <p className="panel-footnote">{release.releaseNotes}</p>
            ) : null}
          </section>

          <section className="workspace-panel">
            <div className="panel-head">
              <div>
                <h2>Before you install</h2>
                <p>What you need to activate on a new computer</p>
              </div>
            </div>
            <div className="checklist">
              <div>
                <i className={license ? "done" : ""}>1</i>
                <span>
                  <strong>Your license key</strong>
                  <small>
                    {license
                      ? `${license.maskedKey} — the full key was sent when it was issued.`
                      : "No license issued yet. Contact your account manager."}
                  </small>
                </span>
              </div>
              <div>
                <i className={license && license.activeDevices < license.maxDevices ? "done" : ""}>2</i>
                <span>
                  <strong>A free device seat</strong>
                  <small>
                    {license
                      ? `${license.activeDevices} of ${license.maxDevices} seats in use.`
                      : "Seats are allocated with your license."}
                  </small>
                </span>
              </div>
              <div>
                <i><ShieldCheck size={12} /></i>
                <span>
                  <strong>Windows 10 or later</strong>
                  <small>64-bit. Administrator rights are required to install.</small>
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
