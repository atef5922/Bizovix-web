import Link from "next/link";
import {
  BarChart3, CalendarClock, CircleDollarSign, Download, Laptop, TrendingUp, Users,
} from "lucide-react";

import { SectionHeading } from "@/components/commercial/SectionShell";
import { requireStaffPage } from "@/src/server/auth/guard";
import {
  getAnalyticsSummary,
  getExpiringLicenses,
  getRevenueByMethod,
  getVersionAdoption,
} from "@/src/server/services/analytics";
import { formatDate, formatMoney } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireStaffPage();

  const [summary, versions, expiring, byMethod] = await Promise.all([
    getAnalyticsSummary(),
    getVersionAdoption(),
    getExpiringLicenses(30),
    getRevenueByMethod(),
  ]);

  const tiles = [
    { label: "MRR", icon: TrendingUp, value: formatMoney(summary.mrr), note: "Monthly + yearly/12" },
    { label: "ARR", icon: CircleDollarSign, value: formatMoney(summary.arr), note: "MRR × 12" },
    { label: "Lifetime revenue", icon: CircleDollarSign, value: formatMoney(summary.lifetimeRevenue), note: "All settled payments" },
    { label: "Paying companies", icon: Users, value: summary.paidCompanies, note: "With at least one settled payment" },
    { label: "Downloads", icon: Download, value: summary.downloads, note: "All recorded download events" },
    { label: "Activations", icon: Laptop, value: summary.activations, note: "All device activations" },
    { label: "Activation rate", icon: BarChart3, value: `${summary.activationRate.toFixed(1)}%`, note: "Directional ratio, not per-visitor" },
    { label: "Expiring in 30 days", icon: CalendarClock, value: summary.expiring30, note: `${summary.expiring7} within 7 days` },
  ];

  return (
    <>
      <SectionHeading
        title="Commercial analytics"
        description="Revenue, funnel, expiry and version intelligence."
      />

      <section className="metric-grid" aria-label="Commercial analytics">
        {tiles.map((tile, index) => {
          const Icon = tile.icon;
          return (
            <article className="metric-card" key={tile.label}>
              <div className={`metric-icon tone-${index % 4}`}>
                <Icon />
              </div>
              <span>{tile.label}</span>
              <strong>{tile.value}</strong>
              <small>{tile.note}</small>
            </article>
          );
        })}
      </section>

      <div className="dashboard-grid lower">
        <section className="workspace-panel">
          <div className="panel-head">
            <div>
              <h2>Download → activation funnel</h2>
              <p>Directional only — downloads are anonymous by design</p>
            </div>
          </div>
          <div className="funnel">
            <FunnelStep label="Downloads" value={summary.downloads} max={summary.downloads} tone="blue" />
            <FunnelStep label="Activations" value={summary.activations} max={summary.downloads} tone="teal" />
            <FunnelStep label="Paying companies" value={summary.paidCompanies} max={summary.downloads} tone="violet" />
          </div>
          <p className="panel-footnote">
            A download and an activation cannot be joined to the same visitor without invasive
            tracking, so treat these as three independent counts rather than one funnel.
          </p>
        </section>

        <section className="workspace-panel">
          <div className="panel-head">
            <div>
              <h2>Revenue by method</h2>
              <p>Settled payments grouped by how they arrived</p>
            </div>
          </div>
          {byMethod.length === 0 ? (
            <p className="dropdown-empty">No settled payments yet.</p>
          ) : (
            <ul className="stat-list">
              {byMethod.map((row) => (
                <li key={row.method}>
                  <span>{row.method.replace(/_/g, " ")}</span>
                  <div>
                    <strong>{formatMoney(row.total)}</strong>
                    <small>{row.count} payment(s)</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="dashboard-grid lower">
        <section className="workspace-panel">
          <div className="panel-head">
            <div>
              <h2>Expiring licenses</h2>
              <p>Active licenses lapsing within 30 days</p>
            </div>
            <Link href="/admin/renewals" className="panel-link">Renewals</Link>
          </div>
          {expiring.length === 0 ? (
            <p className="dropdown-empty">Nothing expiring in the next 30 days.</p>
          ) : (
            <ul className="stat-list">
              {expiring.slice(0, 8).map((row) => (
                <li key={row.licenseId}>
                  <span>
                    {row.companyName}
                    <small>{row.planName}</small>
                  </span>
                  <div>
                    <strong className={row.daysLeft <= 7 ? "urgent" : ""}>{row.daysLeft}d</strong>
                    <small>{formatDate(row.expiresAt)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="workspace-panel">
          <div className="panel-head">
            <div>
              <h2>Version adoption</h2>
              <p>Active devices by installed app version</p>
            </div>
          </div>
          {versions.length === 0 ? (
            <p className="dropdown-empty">No active devices reporting a version yet.</p>
          ) : (
            <ul className="stat-list">
              {versions.map((row) => (
                <li key={row.appVersion}>
                  <span>{row.appVersion}</span>
                  <div>
                    <strong>{row.devices}</strong>
                    <small>{row.share.toFixed(1)}%</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function FunnelStep({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0;
  return (
    <div className="funnel-step">
      <div className="funnel-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="funnel-track">
        <i className={tone} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
