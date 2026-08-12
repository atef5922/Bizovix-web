import { drizzle } from "drizzle-orm/postgres-js";
import { sql, eq } from "drizzle-orm";
import postgres from "postgres";
import { plans, planFeatures, subscriptions } from "../src/server/db/schema.ts";

const client = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });
const db = drizzle(client);

const featureCountSql = sql`(
  select count(*)::int from ${planFeatures}
  where ${planFeatures.planId} = ${plans.id} and ${planFeatures.enabled} = true
)`;

const q = db.select({ code: plans.code, featureCount: featureCountSql }).from(plans);
console.log("--- GENERATED SQL ---");
console.log(q.toSQL().sql);
console.log("--- PARAMS ---", JSON.stringify(q.toSQL().params));
const rows = await q;
console.log("--- RESULT ---", JSON.stringify(rows.slice(0,2)));
await client.end();
