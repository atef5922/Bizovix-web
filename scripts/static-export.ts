/**
 * Static export build.
 *
 * `output: "export"` can't coexist with the admin/account/API routes (they
 * use `force-dynamic`, sessions, and a database — none of which exist on a
 * static host). Those route segments are moved out of `app/` for the
 * duration of the build and always restored afterward, even on failure.
 *
 *   node scripts/static-export.ts
 */
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = join(import.meta.dirname, "..");
// Next's app-router scans every folder under app/ regardless of name, so
// these have to move fully outside app/ — renaming in place still routes.
const EXCLUDED = ["app/api", "app/admin", "app/account"];
const holding = join(projectRoot, ".static-export-excluded");

const moved: Array<{ from: string; to: string }> = [];

function restore() {
  for (const { from, to } of moved.reverse()) {
    if (existsSync(to) && !existsSync(from)) renameSync(to, from);
  }
  rmSync(holding, { recursive: true, force: true });
}

process.on("SIGINT", () => {
  restore();
  process.exit(1);
});

try {
  rmSync(holding, { recursive: true, force: true });
  mkdirSync(holding, { recursive: true });
  for (const dir of EXCLUDED) {
    const from = join(projectRoot, dir);
    const to = join(holding, dir.replace("/", "_"));
    if (existsSync(from)) {
      renameSync(from, to);
      moved.push({ from, to });
    }
  }

  // Stale route types from a prior `next dev` run (e.g. referencing the
  // excluded segments) fail the build's typecheck, so start clean.
  rmSync(join(projectRoot, ".next"), { recursive: true, force: true });

  const result = spawnSync("npx", ["next", "build"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NEXT_OUTPUT_EXPORT: "true" },
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
} finally {
  restore();
}
