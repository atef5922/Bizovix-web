/**
 * Wipes all OPERATIONAL data, keeping the catalogue and your staff accounts.
 *
 *   node --env-file=.env.local scripts/db-reset-operational.ts --yes
 *
 * Deleted : companies (and, by cascade, their users, subscriptions, licences,
 *           devices, invoices, payments), audit logs, download events,
 *           activation rate-limit counters, customer sessions.
 * Kept    : plans, features, plan_features, software_releases, staff_users.
 *
 * Use this to clear test data before going live. It refuses to run without
 * --yes, because there is no undo.
 */
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

if (!process.argv.includes("--yes")) {
  console.error(
    "Refusing to run without --yes.\n" +
      "This permanently deletes every company, licence, device, payment and invoice.\n\n" +
      "  node --env-file=.env.local scripts/db-reset-operational.ts --yes",
  );
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });

async function main() {
  const before = await sql`
    select
      (select count(*)::int from companies) as companies,
      (select count(*)::int from licenses) as licenses,
      (select count(*)::int from device_activations) as devices,
      (select count(*)::int from payments) as payments,
      (select count(*)::int from invoices) as invoices,
      (select count(*)::int from download_events) as downloads,
      (select count(*)::int from audit_logs) as audit
  `;
  console.log("before:", JSON.stringify(before[0]));

  await sql.begin(async (tx) => {
    // companies cascades to customer_users, subscriptions, licenses,
    // device_activations, invoices and payments.
    await tx`delete from companies`;
    await tx`delete from audit_logs`;
    await tx`delete from download_events`;
    await tx`delete from customer_sessions`;
    await tx`delete from activation_attempts`.catch(() => undefined);
  });

  const after = await sql`
    select
      (select count(*)::int from companies) as companies,
      (select count(*)::int from licenses) as licenses,
      (select count(*)::int from device_activations) as devices,
      (select count(*)::int from payments) as payments,
      (select count(*)::int from invoices) as invoices,
      (select count(*)::int from download_events) as downloads,
      (select count(*)::int from audit_logs) as audit,
      (select count(*)::int from plans) as plans_kept,
      (select count(*)::int from features) as features_kept,
      (select count(*)::int from staff_users) as staff_kept,
      (select count(*)::int from software_releases) as releases_kept
  `;
  console.log("after :", JSON.stringify(after[0]));
  console.log("\nOperational data cleared. Catalogue and staff accounts kept.");
}

main()
  .then(() => sql.end())
  .catch(async (error) => {
    console.error(error);
    await sql.end();
    process.exit(1);
  });
