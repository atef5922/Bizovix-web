import "server-only";

import { and, desc, eq, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import { companies, downloadEvents, softwareReleases } from "@/src/server/db/schema";
import {
  normalizeListParams,
  toListResult,
  type ListParams,
  type ListResult,
} from "./shared";

export type DownloadRow = {
  id: string;
  platform: string;
  appVersion: string | null;
  source: string;
  companyName: string | null;
  countryCode: string | null;
  createdAt: Date;
};

export async function listDownloadEvents(
  params: ListParams = {},
): Promise<ListResult<DownloadRow>> {
  const db = getDb();
  const { page, pageSize, offset, search, status } = normalizeListParams(params);

  const filters: SQL[] = [];
  if (search) {
    const term = `%${search}%`;
    filters.push(
      sql`(lower(${downloadEvents.source}) like ${term}
        or lower(coalesce(${downloadEvents.appVersion}, '')) like ${term}
        or lower(coalesce(${companies.name}, '')) like ${term})`,
    );
  }
  if (status === "AUTHENTICATED") filters.push(sql`${downloadEvents.companyId} is not null`);
  if (status === "ANONYMOUS") filters.push(sql`${downloadEvents.companyId} is null`);
  if (status === "LAST_7") filters.push(sql`${downloadEvents.createdAt} >= now() - interval '7 days'`);
  if (status === "LAST_30") filters.push(sql`${downloadEvents.createdAt} >= now() - interval '30 days'`);
  const where = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select({
      id: downloadEvents.id,
      platform: downloadEvents.platform,
      appVersion: downloadEvents.appVersion,
      source: downloadEvents.source,
      companyName: companies.name,
      countryCode: downloadEvents.countryCode,
      createdAt: downloadEvents.createdAt,
    })
    .from(downloadEvents)
    .leftJoin(companies, eq(companies.id, downloadEvents.companyId))
    .where(where)
    .orderBy(desc(downloadEvents.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(downloadEvents)
    .leftJoin(companies, eq(companies.id, downloadEvents.companyId))
    .where(where);

  return toListResult(rows, count, page, pageSize);
}

export async function getLatestRelease() {
  const db = getDb();
  const [row] = await db
    .select()
    .from(softwareReleases)
    .where(eq(softwareReleases.isLatest, true))
    .orderBy(desc(softwareReleases.publishedAt))
    .limit(1);
  if (row) return row;

  const [fallback] = await db
    .select()
    .from(softwareReleases)
    .orderBy(desc(softwareReleases.publishedAt))
    .limit(1);
  return fallback ?? null;
}

export async function listReleases() {
  const db = getDb();
  return db.select().from(softwareReleases).orderBy(desc(softwareReleases.publishedAt));
}

export async function recordDownloadEvent(input: {
  platform?: string;
  appVersion?: string | null;
  source: string;
  companyId?: string | null;
  countryCode?: string | null;
}): Promise<void> {
  const db = getDb();
  await db.insert(downloadEvents).values({
    platform: input.platform ?? "windows",
    appVersion: input.appVersion ?? null,
    source: input.source,
    companyId: input.companyId ?? null,
    countryCode: input.countryCode ?? null,
  });
}
