import Link from "next/link";
import { Building2, CalendarDays, Download, KeyRound, Laptop, ShieldCheck } from "lucide-react";

import { requireCustomerPage } from "@/src/server/auth/guard";
import { getAccountLicense } from "@/src/server/services/account";
import { getCurrentSubscriptionForCompany } from "@/src/server/services/subscriptions";
import { daysUntil, formatDate, formatMinor } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  const session = await requireCustomerPage();
  const [subscription, license] = await Promise.all([
    getCurrentSubscriptionForCompany(session.company.id),
    getAccountLicense(session.company.id),
  ]);

  const expiryDays = daysUntil(subscription?.subscription.endsAt ?? null);

  const tiles = [
    {
      label: "Subscription expiry",
      icon: CalendarDays,
      value: subscription?.subscription.endsAt ? formatDate(subscription.subscription.endsAt) : "—",
      note: expiryDays === null ? "No end date" : expiryDays < 0 ? "Expired" : `${expiryDays} days left`,
    },
    {
      label: "License status",
      icon: KeyRound,
      value: license ? license.status.toLowerCase() : "—",
      note: license ? license.licenseType.toLowerCase() : "No license issued",
    },
    {
      label: "Active devices",
      icon: Laptop,
      value: license ? `${license.activeDevices}/${license.maxDevices}` : "—",
      note: license ? "Seats in use" : "No license issued",
    },
    {
      label: "Update support",
      icon: ShieldCheck,
      value: license?.updatesUntil ? formatDate(license.updatesUntil) : "—",
      note: "Updates included until",
    },
  ];

  return (
    <>
      <div className="workspace-heading">
        <div>
          <p className="workspace-eyebrow">MY BIZOVIX</p>
          <h1>Company overview</h1>
          <span>Your subscription, license and devices in one place.</span>
        </div>
        <div className="heading-actions">
          <Link href="/account/download" className="heading-link-button primary">
            <Download /> Download Bizovix
          </Link>
        </div>
      </div>

      <section className="account-summary">
        <div className="company-card">
          <span><Building2 /></span>
          <div>
            <small>COMPANY</small>
            <h2>{session.company.name}</h2>
            <p>
              {session.company.companyCode}
              {session.company.contactPerson ? ` · ${session.company.contactPerson}` : ""}
            </p>
          </div>
        </div>
        <div className="account-status">
          <div>
            <span>Status</span>
            <strong>{session.company.status.toLowerCase()}</strong>
          </div>
          <div>
            <span>Plan</span>
            <strong>{subscription?.plan.name ?? "—"}</strong>
          </div>
          <div>
            <span>Billing</span>
            <strong>
              {subscription ? formatMinor(subscription.plan.priceMinor, subscription.plan.currencyCode) : "—"}
            </strong>
          </div>
        </div>
      </section>

      <section className="metric-grid account-metrics">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <article className="metric-card" key={tile.label}>
              <div className="metric-icon tone-0"><Icon /></div>
              <span>{tile.label}</span>
              <strong>{tile.value}</strong>
              <small>{tile.note}</small>
            </article>
          );
        })}
      </section>

      <section className="workspace-panel">
        <div className="panel-head">
          <div>
            <h2>Getting started</h2>
            <p>Your commercial workspace checklist</p>
          </div>
        </div>
        <div className="checklist">
          <div>
            <i className={session.company.status === "ACTIVE" ? "done" : ""}>1</i>
            <span>
              <strong>Company registered</strong>
              <small>
                {session.company.status === "ACTIVE"
                  ? "Your company is active."
                  : `Your company is currently ${session.company.status.toLowerCase()}.`}
              </small>
            </span>
          </div>
          <div>
            <i className={subscription ? "done" : ""}>2</i>
            <span>
              <strong>Choose a Bizovix plan</strong>
              <small>
                {subscription ? `On ${subscription.plan.name}.` : "No active plan — contact sales."}
              </small>
            </span>
          </div>
          <div>
            <i className={license && license.activeDevices > 0 ? "done" : ""}>3</i>
            <span>
              <strong>Activate your desktop</strong>
              <small>
                {license
                  ? license.activeDevices > 0
                    ? `${license.activeDevices} device(s) activated.`
                    : "Use your license key on an approved device."
                  : "No license issued yet."}
              </small>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
