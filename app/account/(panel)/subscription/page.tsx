import Link from "next/link";
import { CreditCard } from "lucide-react";

import { EmptyState, SectionHeading } from "@/components/commercial/SectionShell";
import { BoolBadge, StatusBadge } from "@/components/commercial/StatusBadge";
import { requireCustomerPage } from "@/src/server/auth/guard";
import { daysUntil, formatDate, formatMinor } from "@/src/server/services/shared";
import { getCurrentSubscriptionForCompany } from "@/src/server/services/subscriptions";

export const dynamic = "force-dynamic";

export default async function AccountSubscriptionPage() {
  const session = await requireCustomerPage();
  const current = await getCurrentSubscriptionForCompany(session.company.id);

  return (
    <>
      <SectionHeading
        eyebrow="MY BIZOVIX"
        title="Subscription"
        description="Review billing cycle, validity and renewal."
      />

      {!current ? (
        <section className="workspace-panel">
          <EmptyState
            icon={CreditCard}
            title="No subscription on record"
            description="Contact your Bizovix account manager to start a plan for your company."
          />
        </section>
      ) : (
        <>
          <section className="detail-grid">
            <DetailCard label="Plan" value={current.plan.name} note={current.plan.description ?? current.plan.code} />
            <DetailCard
              label="Status"
              value={<StatusBadge value={current.subscription.status} />}
              note={`Started ${formatDate(current.subscription.startsAt)}`}
            />
            <DetailCard
              label="Billing"
              value={formatMinor(current.plan.priceMinor, current.plan.currencyCode)}
              note={current.plan.billingType.replace(/_/g, " ").toLowerCase()}
            />
            <DetailCard
              label="Renews"
              value={current.subscription.endsAt ? formatDate(current.subscription.endsAt) : "Never"}
              note={(() => {
                const left = daysUntil(current.subscription.endsAt);
                if (left === null) return "Perpetual entitlement";
                return left < 0 ? `${Math.abs(left)} days overdue` : `${left} days remaining`;
              })()}
            />
          </section>

          <section className="workspace-panel">
            <div className="panel-head">
              <div>
                <h2>Plan limits</h2>
                <p>What your current plan includes</p>
              </div>
              <Link href="/pricing" className="panel-link">Compare plans</Link>
            </div>
            <ul className="stat-list">
              <li>
                <span>Users included</span>
                <div><strong>{current.plan.maxUsers}</strong></div>
              </li>
              <li>
                <span>Devices included</span>
                <div><strong>{current.plan.maxDevices}</strong></div>
              </li>
              <li>
                <span>Offline grace period</span>
                <div><strong>{current.plan.offlineGraceDays} days</strong></div>
              </li>
              <li>
                <span>Auto-renew</span>
                <div>
                  <BoolBadge value={current.subscription.autoRenews} onLabel="On" offLabel="Off" />
                </div>
              </li>
              {current.subscription.graceEndsAt ? (
                <li>
                  <span>Grace period ends</span>
                  <div><strong>{formatDate(current.subscription.graceEndsAt)}</strong></div>
                </li>
              ) : null}
            </ul>
          </section>
        </>
      )}
    </>
  );
}

function DetailCard({
  label,
  value,
  note,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
}) {
  return (
    <article className="detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </article>
  );
}
