import { KeyRound } from "lucide-react";

import { EmptyState, SectionHeading } from "@/components/commercial/SectionShell";
import { StatusBadge } from "@/components/commercial/StatusBadge";
import { requireCustomerPage } from "@/src/server/auth/guard";
import { getAccountLicense } from "@/src/server/services/account";
import { daysUntil, formatDate } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

export default async function AccountLicensePage() {
  const session = await requireCustomerPage();
  const license = await getAccountLicense(session.company.id);

  return (
    <>
      <SectionHeading
        eyebrow="MY BIZOVIX"
        title="License"
        description="View your company license and entitlement."
      />

      {!license ? (
        <section className="workspace-panel">
          <EmptyState
            icon={KeyRound}
            title="No license issued yet"
            description="Your Bizovix account manager will issue a license key once your plan is active."
          />
        </section>
      ) : (
        <>
          <section className="workspace-panel license-summary">
            <div className="panel-head">
              <div>
                <h2>Your license key</h2>
                <p>Only the last four characters are stored in readable form</p>
              </div>
              <StatusBadge value={license.status} />
            </div>
            <code className="license-key-display">{license.maskedKey}</code>
            <p className="panel-footnote">
              The full key was shown once when it was issued. If you no longer have it, ask support
              to reissue — the current key will stop working the moment a new one is generated.
            </p>
          </section>

          <section className="detail-grid">
            <article className="detail-card">
              <span>Plan</span>
              <strong>{license.planName}</strong>
              <small>{license.licenseType.toLowerCase()}</small>
            </article>
            <article className="detail-card">
              <span>Devices</span>
              <strong>
                {license.activeDevices}/{license.maxDevices}
              </strong>
              <small>Seats in use</small>
            </article>
            <article className="detail-card">
              <span>Expires</span>
              <strong>{license.expiresAt ? formatDate(license.expiresAt) : "Never"}</strong>
              <small>
                {(() => {
                  const left = daysUntil(license.expiresAt);
                  if (left === null) return "Perpetual license";
                  return left < 0 ? `${Math.abs(left)} days overdue` : `${left} days remaining`;
                })()}
              </small>
            </article>
            <article className="detail-card">
              <span>Updates until</span>
              <strong>{license.updatesUntil ? formatDate(license.updatesUntil) : "—"}</strong>
              <small>
                Support until {license.supportUntil ? formatDate(license.supportUntil) : "—"}
              </small>
            </article>
          </section>
        </>
      )}
    </>
  );
}
