import "server-only";

import { and, eq, gt, isNotNull, sql } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import { activationAttempts } from "@/src/server/db/schema";

const WINDOW_MINUTES = 15;
const FAILURE_THRESHOLD = 10;
const BLOCK_MINUTES = 30;
const RETENTION_DAYS = 2;
const PRUNE_SAMPLE_RATE = 0.02;

export type AttemptOutcome = "success" | "business_rejection" | "security_failure";

export type RateLimitCheck = { allowed: boolean; retryAfterSeconds?: number };

function currentWindowStart(): Date {
  const windowMs = WINDOW_MINUTES * 60_000;
  return new Date(Math.floor(Date.now() / windowMs) * windowMs);
}

/**
 * Read-only check, called before any expensive work (DB lookup, signing).
 * Deliberately separate from `recordAttempt`: we need to know whether a
 * scope is already blocked before we know the eventual outcome of this call.
 */
export async function checkRateLimit(scope: string): Promise<RateLimitCheck> {
  const db = getDb();
  const [row] = await db
    .select({ blockedUntil: sql<Date | null>`max(${activationAttempts.blockedUntil})` })
    .from(activationAttempts)
    .where(
      and(
        eq(activationAttempts.scope, scope),
        isNotNull(activationAttempts.blockedUntil),
        gt(activationAttempts.blockedUntil, new Date()),
      ),
    );

  // The postgres.js driver doesn't reliably type-parse a raw max() aggregate
  // the way it parses a plain column reference, so coerce explicitly rather
  // than trust it's already a Date.
  const blockedUntil = row?.blockedUntil ? new Date(row.blockedUntil) : null;
  if (!blockedUntil) return { allowed: true };

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((blockedUntil.getTime() - Date.now()) / 1000)),
  };
}

/**
 * Records the outcome of a completed attempt against a scope ("ip:1.2.3.4"
 * or "key:<hash>"). Only `security_failure` (bad/unknown key, blocked-device
 * probing) can trip `blockedUntil` — `business_rejection` (expired/revoked
 * license, seat limit) still counts toward `attempts` so a runaway client is
 * throttled, but never blocks a legitimate customer out of retrying the
 * moment their subscription is reinstated.
 */
export async function recordAttempt(scope: string, outcome: AttemptOutcome): Promise<void> {
  const db = getDb();
  const windowStart = currentWindowStart();
  const failureIncrement = outcome === "security_failure" ? 1 : 0;

  const [row] = await db
    .insert(activationAttempts)
    .values({ scope, windowStart, attempts: 1, failures: failureIncrement })
    .onConflictDoUpdate({
      target: [activationAttempts.scope, activationAttempts.windowStart],
      set: {
        attempts: sql`${activationAttempts.attempts} + 1`,
        failures: sql`${activationAttempts.failures} + ${failureIncrement}`,
        updatedAt: new Date(),
      },
    })
    .returning({ failures: activationAttempts.failures });

  if (row.failures >= FAILURE_THRESHOLD) {
    await db
      .update(activationAttempts)
      .set({ blockedUntil: sql`now() + (${BLOCK_MINUTES} * interval '1 minute')`, updatedAt: new Date() })
      .where(and(eq(activationAttempts.scope, scope), eq(activationAttempts.windowStart, windowStart)));
  }

  // Opportunistic pruning on a small random fraction of calls, matching the
  // lazy-reconciliation style used elsewhere (expireLapsedLicenses,
  // reconcileSubscriptionStates) rather than a dedicated cron job.
  if (Math.random() < PRUNE_SAMPLE_RATE) {
    await db
      .delete(activationAttempts)
      .where(sql`${activationAttempts.updatedAt} < now() - (${RETENTION_DAYS} * interval '1 day')`)
      .catch(() => undefined);
  }
}
