import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { isProduction, requireDatabaseUrl } from "@/src/server/env";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;
/** The object passed into a `db.transaction(async (tx) => ...)` callback. */
export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
/** Accepted by service functions that may run standalone or inside a transaction. */
export type DbOrTx = Database | Tx;

function createDatabase() {
  const client = postgres(requireDatabaseUrl(), {
    // Serverless/dev-friendly pool. Next.js can hold several module instances
    // during hot reload, so keep the per-instance ceiling low.
    max: isProduction ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  });
  return drizzle(client, { schema });
}

// Dev hot-reload would otherwise leak a new pool on every file change.
const globalForDb = globalThis as unknown as { __bizovixDb?: Database };

export function getDb(): Database {
  if (!globalForDb.__bizovixDb) {
    globalForDb.__bizovixDb = createDatabase();
  }
  return globalForDb.__bizovixDb;
}

export { schema };
