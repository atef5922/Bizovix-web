import "server-only";

import { and, eq, gt, isNull, lt, or } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { cache } from "react";

import { getDb } from "@/src/server/db/client";
import {
  companies,
  customerSessions,
  customerUsers,
  staffSessions,
  staffUsers,
  type Company,
  type CustomerUser,
  type StaffUser,
} from "@/src/server/db/schema";
import { isDatabaseConfigured, isProduction } from "@/src/server/env";
import { createSessionToken, hashSessionToken } from "./tokens";

export const STAFF_COOKIE = "bzx_staff_session";
export const CUSTOMER_COOKIE = "bzx_account_session";

const STAFF_TTL_HOURS = 12;
const CUSTOMER_TTL_DAYS = 30;

export type StaffSession = {
  user: Pick<StaffUser, "id" | "name" | "email" | "role" | "isActive">;
  sessionId: string;
};

export type CustomerSession = {
  user: Pick<CustomerUser, "id" | "name" | "email" | "role" | "companyId">;
  company: Company;
  sessionId: string;
};

async function requestMeta() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return {
    ipAddress: forwarded?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? null,
    userAgent: headerList.get("user-agent") ?? null,
  };
}

function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    expires: expiresAt,
  };
}

/* -------------------------------------------------------------------------- */
/* Staff sessions                                                              */
/* -------------------------------------------------------------------------- */

export async function createStaffSession(staffUserId: string): Promise<void> {
  const db = getDb();
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + STAFF_TTL_HOURS * 60 * 60 * 1000);
  const meta = await requestMeta();

  await db.insert(staffSessions).values({
    staffUserId,
    tokenHash: hashSessionToken(token),
    expiresAt,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  const cookieStore = await cookies();
  cookieStore.set(STAFF_COOKIE, token, cookieOptions(expiresAt));
}

/**
 * Resolved once per request via React `cache`, so a page that renders several
 * guarded components still performs a single session lookup.
 */
export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  if (!isDatabaseConfigured()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const rows = await db
    .select({
      sessionId: staffSessions.id,
      id: staffUsers.id,
      name: staffUsers.name,
      email: staffUsers.email,
      role: staffUsers.role,
      isActive: staffUsers.isActive,
    })
    .from(staffSessions)
    .innerJoin(staffUsers, eq(staffUsers.id, staffSessions.staffUserId))
    .where(
      and(
        eq(staffSessions.tokenHash, hashSessionToken(token)),
        isNull(staffSessions.revokedAt),
        gt(staffSessions.expiresAt, new Date()),
        eq(staffUsers.isActive, true),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    sessionId: row.sessionId,
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      isActive: row.isActive,
    },
  };
});

export async function destroyStaffSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE)?.value;

  if (token && isDatabaseConfigured()) {
    const db = getDb();
    await db
      .update(staffSessions)
      .set({ revokedAt: new Date() })
      .where(eq(staffSessions.tokenHash, hashSessionToken(token)));
  }

  cookieStore.delete(STAFF_COOKIE);
}

/* -------------------------------------------------------------------------- */
/* Customer sessions                                                           */
/* -------------------------------------------------------------------------- */

export async function createCustomerSession(customerUserId: string): Promise<void> {
  const db = getDb();
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + CUSTOMER_TTL_DAYS * 24 * 60 * 60 * 1000);
  const meta = await requestMeta();

  await db.insert(customerSessions).values({
    customerUserId,
    tokenHash: hashSessionToken(token),
    expiresAt,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, cookieOptions(expiresAt));
}

export const getCustomerSession = cache(async (): Promise<CustomerSession | null> => {
  if (!isDatabaseConfigured()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const rows = await db
    .select({
      sessionId: customerSessions.id,
      id: customerUsers.id,
      name: customerUsers.name,
      email: customerUsers.email,
      role: customerUsers.role,
      companyId: customerUsers.companyId,
      company: companies,
    })
    .from(customerSessions)
    .innerJoin(customerUsers, eq(customerUsers.id, customerSessions.customerUserId))
    .innerJoin(companies, eq(companies.id, customerUsers.companyId))
    .where(
      and(
        eq(customerSessions.tokenHash, hashSessionToken(token)),
        isNull(customerSessions.revokedAt),
        gt(customerSessions.expiresAt, new Date()),
        eq(customerUsers.isActive, true),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    sessionId: row.sessionId,
    company: row.company,
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      companyId: row.companyId,
    },
  };
});

export async function destroyCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;

  if (token && isDatabaseConfigured()) {
    const db = getDb();
    await db
      .update(customerSessions)
      .set({ revokedAt: new Date() })
      .where(eq(customerSessions.tokenHash, hashSessionToken(token)));
  }

  cookieStore.delete(CUSTOMER_COOKIE);
}

/** Housekeeping for expired/revoked rows; called opportunistically on login. */
export async function pruneExpiredSessions(): Promise<void> {
  const db = getDb();
  const now = new Date();
  const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  await db
    .delete(staffSessions)
    .where(or(lt(staffSessions.expiresAt, now), lt(staffSessions.revokedAt, cutoff)));
  await db
    .delete(customerSessions)
    .where(or(lt(customerSessions.expiresAt, now), lt(customerSessions.revokedAt, cutoff)));
}
