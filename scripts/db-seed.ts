/**
 * Seeds the reference data the admin panel needs to be usable on a fresh
 * database: the first staff account, the plan/feature catalogue mirrored from
 * the public pricing page, and the current installer release.
 *
 *   node --env-file=.env.local scripts/db-seed.ts
 *
 * Safe to re-run: every insert is keyed on a natural unique column and skips
 * rows that already exist. It never overwrites an edited plan or resets a
 * password that has been changed since the first run.
 */
import { randomBytes } from "node:crypto";

import postgres from "postgres";

import { hashPassword } from "../src/server/auth/password.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL ?? "admin@bizovix.com").toLowerCase();
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Bizovix Super Admin";

/** Feature catalogue — keys mirror the public pricing table's feature rows. */
const FEATURES: { key: string; name: string; moduleKey: string; sortOrder: number }[] = [
  { key: "crm.customers", name: "Customer management", moduleKey: "CRM", sortOrder: 1 },
  { key: "purchase.vendors", name: "Vendor and supplier management", moduleKey: "PURCHASE", sortOrder: 2 },
  { key: "inventory.basic", name: "Basic inventory management", moduleKey: "INVENTORY", sortOrder: 3 },
  { key: "inventory.advanced", name: "Advanced inventory management", moduleKey: "INVENTORY", sortOrder: 4 },
  { key: "accounting.finance", name: "Accounting and finance", moduleKey: "ACCOUNTING", sortOrder: 5 },
  { key: "purchase.orders", name: "Purchase management", moduleKey: "PURCHASE", sortOrder: 6 },
  { key: "sales.orders", name: "Sales management", moduleKey: "SALES", sortOrder: 7 },
  { key: "sales.pos", name: "Point of Sale (POS)", moduleKey: "SALES", sortOrder: 8 },
  { key: "hrm.payroll", name: "HR and payroll", moduleKey: "HRM", sortOrder: 9 },
  { key: "integrations.ecommerce", name: "E-commerce integrations", moduleKey: "INTEGRATIONS", sortOrder: 10 },
  { key: "integrations.messaging", name: "SMS and email integrations", moduleKey: "INTEGRATIONS", sortOrder: 11 },
  { key: "integrations.payment_gateway", name: "Payment gateway integration", moduleKey: "INTEGRATIONS", sortOrder: 12 },
  { key: "manufacturing.core", name: "Manufacturing", moduleKey: "MANUFACTURING", sortOrder: 13 },
];

const BASIC_FEATURES = [
  "crm.customers",
  "purchase.vendors",
  "inventory.basic",
  "accounting.finance",
  "purchase.orders",
  "sales.orders",
  "integrations.messaging",
];

const STANDARD_FEATURES = [
  ...BASIC_FEATURES.filter((k) => k !== "inventory.basic"),
  "inventory.advanced",
  "sales.pos",
  "hrm.payroll",
  "integrations.payment_gateway",
];

const PREMIUM_FEATURES = [...STANDARD_FEATURES, "integrations.ecommerce", "manufacturing.core"];

/** Prices mirror src/data/pricing.ts, stored in minor units (poisha). */
const PLANS = [
  { code: "basic-monthly", name: "Basic Monthly", billingType: "MONTHLY", priceMinor: 100_000, durationMonths: 1, maxUsers: 1, maxDevices: 1, sortOrder: 1, features: BASIC_FEATURES },
  { code: "basic-yearly", name: "Basic Yearly", billingType: "YEARLY", priceMinor: 1_020_000, durationMonths: 12, maxUsers: 1, maxDevices: 1, sortOrder: 2, features: BASIC_FEATURES },
  { code: "standard-monthly", name: "Standard Monthly", billingType: "MONTHLY", priceMinor: 150_000, durationMonths: 1, maxUsers: 3, maxDevices: 2, sortOrder: 3, features: STANDARD_FEATURES },
  { code: "standard-yearly", name: "Standard Yearly", billingType: "YEARLY", priceMinor: 1_530_000, durationMonths: 12, maxUsers: 3, maxDevices: 2, sortOrder: 4, features: STANDARD_FEATURES },
  { code: "premium-monthly", name: "Premium Monthly", billingType: "MONTHLY", priceMinor: 200_000, durationMonths: 1, maxUsers: 5, maxDevices: 3, sortOrder: 5, features: PREMIUM_FEATURES },
  { code: "premium-yearly", name: "Premium Yearly", billingType: "YEARLY", priceMinor: 2_040_000, durationMonths: 12, maxUsers: 5, maxDevices: 3, sortOrder: 6, features: PREMIUM_FEATURES },
] as const;

async function main() {
  /* ---- Staff account -------------------------------------------------- */
  const existingAdmin = await sql<{ id: string }[]>`
    select id from staff_users where email = ${ADMIN_EMAIL} limit 1
  `;

  let generatedPassword: string | null = null;
  if (existingAdmin.length === 0) {
    // Random by default so a seeded install never ships a guessable password.
    generatedPassword = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");
    const passwordHash = await hashPassword(generatedPassword);
    await sql`
      insert into staff_users (name, email, password_hash, role, is_active)
      values (${ADMIN_NAME}, ${ADMIN_EMAIL}, ${passwordHash}, 'SUPER_ADMIN', true)
    `;
    console.log(`  staff   created ${ADMIN_EMAIL}`);
  } else {
    console.log(`  staff   ${ADMIN_EMAIL} already exists (password untouched)`);
  }

  /* ---- Features ------------------------------------------------------- */
  for (const feature of FEATURES) {
    await sql`
      insert into features (key, name, module_key, sort_order)
      values (${feature.key}, ${feature.name}, ${feature.moduleKey}, ${feature.sortOrder})
      on conflict (key) do nothing
    `;
  }
  console.log(`  feature ${FEATURES.length} catalogue rows ensured`);

  const featureIds = new Map(
    (await sql<{ id: string; key: string }[]>`select id, key from features`).map((r) => [r.key, r.id]),
  );

  /* ---- Plans ---------------------------------------------------------- */
  for (const plan of PLANS) {
    await sql`
      insert into plans (code, name, billing_type, price_minor, currency_code, duration_months,
                         max_users, max_devices, offline_grace_days, is_active, is_public, sort_order)
      values (${plan.code}, ${plan.name}, ${plan.billingType}, ${plan.priceMinor}, 'BDT',
              ${plan.durationMonths}, ${plan.maxUsers}, ${plan.maxDevices}, 7, true, true, ${plan.sortOrder})
      on conflict (code) do nothing
    `;

    const [row] = await sql<{ id: string }[]>`select id from plans where code = ${plan.code} limit 1`;
    for (const key of plan.features) {
      const featureId = featureIds.get(key);
      if (!featureId) continue;
      await sql`
        insert into plan_features (plan_id, feature_id, enabled)
        values (${row.id}, ${featureId}, true)
        on conflict (plan_id, feature_id) do nothing
      `;
    }
  }
  console.log(`  plan    ${PLANS.length} plans ensured with feature mappings`);

  /* ---- Installer release --------------------------------------------- */
  await sql`
    insert into software_releases (version, file_name, download_path, platform, is_latest, release_notes)
    values ('0.1.0', 'Bizovix-ERP-Setup-0.1.0.exe', '/software/Bizovix-ERP-Setup-0.1.0.exe',
            'windows', true, 'Initial commercial release.')
    on conflict (version) do nothing
  `;
  console.log("  release windows installer 0.1.0 ensured");

  if (generatedPassword) {
    console.log("\n────────────────────────────────────────────────");
    console.log("  Admin sign-in — shown once, store it now");
    console.log(`  URL:      /admin/login`);
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${generatedPassword}`);
    console.log("────────────────────────────────────────────────\n");
  }
}

main()
  .then(() => sql.end())
  .catch(async (error) => {
    console.error(error);
    await sql.end();
    process.exit(1);
  });
