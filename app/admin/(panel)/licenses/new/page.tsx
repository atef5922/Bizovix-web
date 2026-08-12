import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RecordFormPanel } from "@/components/commercial/RecordForm";
import { generateLicenseAction } from "@/src/server/actions/licensing.actions";
import { requireStaffPage } from "@/src/server/auth/guard";
import { staffCan } from "@/src/server/auth/roles";
import { listCompanyOptions } from "@/src/server/services/companies";
import { isEntitlementSigningConfigured } from "@/src/server/services/license-key";
import { listPlanOptions } from "@/src/server/services/plans";
import { formatMinor } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

export default async function GenerateLicensePage() {
  const session = await requireStaffPage();
  const [companies, plans] = await Promise.all([listCompanyOptions(), listPlanOptions()]);
  const canCreate = staffCan(session.user.role, "licenses.create");

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="workspace-heading compact">
        <div>
          <Link className="back-link" href="/admin/licenses">
            <ArrowLeft /> Licenses
          </Link>
          <h1>Generate a license</h1>
          <span>Create a secure company entitlement. The full key is shown once and never stored.</span>
        </div>
      </div>

      {!canCreate ? (
        <section className="workspace-panel">
          <div className="table-empty">
            <strong>Your role cannot generate licenses</strong>
            <span>Support Admin or Super Admin access is required.</span>
          </div>
        </section>
      ) : companies.length === 0 || plans.length === 0 ? (
        <section className="workspace-panel">
          <div className="table-empty">
            <strong>{companies.length === 0 ? "No companies yet" : "No active plans yet"}</strong>
            <span>
              {companies.length === 0
                ? "Add a company before issuing its first license."
                : "Create an active plan before issuing a license against it."}
            </span>
          </div>
        </section>
      ) : (
        <RecordFormPanel
          title="License details"
          description="Generation happens entirely server-side with cryptographic randomness."
          submitLabel="Generate secure license"
          action={generateLicenseAction}
          note={
            isEntitlementSigningConfigured()
              ? "The key is generated with crypto-grade randomness, shown once, then stored only as a peppered hash plus its last four characters."
              : "LICENSE_SIGNING_PRIVATE_KEY is not set — keys will generate, but signed entitlements cannot be issued to desktop installs until it is configured."
          }
          fields={[
            {
              kind: "select",
              name: "companyId",
              label: "Company",
              required: true,
              options: companies.map((c) => ({ value: c.id, label: c.label })),
            },
            {
              kind: "select",
              name: "planId",
              label: "Plan",
              required: true,
              options: plans.map((p) => ({
                value: p.id,
                label: `${p.label} — ${formatMinor(p.priceMinor, p.currencyCode)}`,
              })),
            },
            {
              kind: "select",
              name: "licenseType",
              label: "License type",
              required: true,
              defaultValue: "YEARLY",
              options: [
                { value: "MONTHLY", label: "Monthly" },
                { value: "YEARLY", label: "Yearly" },
                { value: "PERPETUAL", label: "Perpetual (never expires)" },
              ],
            },
            { kind: "date", name: "startsAt", label: "Start date", defaultValue: today, required: true },
            {
              kind: "date",
              name: "expiresAt",
              label: "Expiry date",
              hint: "Leave blank to derive from the plan term. Ignored for perpetual licenses.",
            },
            {
              kind: "number",
              name: "maxDevices",
              label: "Device limit",
              required: true,
              defaultValue: "1",
              min: "1",
              hint: "Number of computers that may run this license at once.",
            },
            { kind: "textarea", name: "notes", label: "Internal notes", full: true },
          ]}
        />
      )}
    </>
  );
}
