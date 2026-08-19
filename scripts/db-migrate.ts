/**
 * Applies every SQL file in ./drizzle in order, tracking what has already run in
 * a _bizovix_migrations table so re-running is safe.
 *
 *   node --env-file=.env.local scripts/db-migrate.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "drizzle");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });

async function main() {
  await sql`
    create table if not exists _bizovix_migrations (
      id serial primary key,
      name text not null unique,
      applied_at timestamptz not null default now()
    )
  `;

  const applied = new Set(
    (await sql<{ name: string }[]>`select name from _bizovix_migrations`).map((r) => r.name),
  );

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skip  ${file} (already applied)`);
      continue;
    }

    const contents = readFileSync(join(migrationsDir, file), "utf8");
    // drizzle-kit separates statements with this marker; splitting lets a
    // failure report the exact statement instead of the whole file.
    const statements = contents
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await sql.begin(async (tx) => {
        for (const statement of statements) {
          await tx.unsafe(statement);
        }
        await tx`insert into _bizovix_migrations ${tx({ name: file })}`;
      });
      console.log(`  apply ${file} (${statements.length} statements)`);
      ran += 1;
    } catch (error) {
      console.error(`\nFailed applying ${file}:`);
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  console.log(ran === 0 ? "\nDatabase already up to date." : `\nApplied ${ran} migration(s).`);
}

main()
  .then(() => sql.end())
  .catch(async (error) => {
    console.error(error);
    await sql.end();
    process.exit(1);
  });
