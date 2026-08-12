import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { getDb } from "@/src/server/db/client";
import { auditLogs, companies } from "@/src/server/db/schema";
import { clientIp } from "./shared";

type Actor =
  | { type: "STAFF"; id: string; name: string; email: string }
  | { type: "CUSTOMER"; id: string; name: string; email: string }
  | { type: "SYSTEM" };

export type AuditInput = {
  actor: Actor;
  action: string;
  entityType: string;
  entityId?: string | null;
  companyId?: string | null;
  summary?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
};

/**
 * Single write path for every security-sensitive mutation. Audit failures never
 * propagate: losing a log line must not roll back the business action that
 * already succeeded, but it must still be visible in the server logs.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    const headerList = await headers();

    await getDb()
      .insert(auditLogs)
      .values({
        actorType: input.actor.type,
        actorId: input.actor.type === "SYSTEM" ? null : input.actor.id,
        actorName: input.actor.type === "SYSTEM" ? "System" : input.actor.name,
        actorEmail: input.actor.type === "SYSTEM" ? null : input.actor.email,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        companyId: input.companyId ?? null,
        summary: input.summary ?? null,
        ipAddress: clientIp(headerList),
        userAgent: headerList.get("user-agent") ?? null,
        oldValues: input.oldValues === undefined ? null : (input.oldValues as object),
        newValues: input.newValues === undefined ? null : (input.newValues as object),
      });
  } catch (error) {
    console.error("[audit] failed to record entry", input.action, error);
  }
}

export type AuditRow = {
  id: string;
  actorType: "STAFF" | "CUSTOMER" | "SYSTEM";
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string | null;
  ipAddress: string | null;
  companyName: string | null;
  createdAt: Date;
};

export async function listAuditLogs(options: {
  limit?: number;
  offset?: number;
  search?: string;
  entityType?: string;
} = {}): Promise<{ rows: AuditRow[]; total: number }> {
  const db = getDb();
  const limit = options.limit ?? 25;
  const offset = options.offset ?? 0;

  const filters = [];
  if (options.search) {
    const term = `%${options.search.toLowerCase()}%`;
    filters.push(
      sql`(lower(${auditLogs.action}) like ${term} or lower(coalesce(${auditLogs.actorName}, '')) like ${term} or lower(coalesce(${auditLogs.summary}, '')) like ${term})`,
    );
  }
  if (options.entityType) {
    filters.push(eq(auditLogs.entityType, options.entityType));
  }
  const where = filters.length ? sql.join(filters, sql` and `) : undefined;

  const rows = await db
    .select({
      id: auditLogs.id,
      actorType: auditLogs.actorType,
      actorName: auditLogs.actorName,
      actorEmail: auditLogs.actorEmail,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      summary: auditLogs.summary,
      ipAddress: auditLogs.ipAddress,
      companyName: companies.name,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(companies, eq(companies.id, auditLogs.companyId))
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLogs)
    .where(where);

  return { rows, total: count };
}
