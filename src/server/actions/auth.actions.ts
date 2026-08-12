"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { verifyPassword } from "@/src/server/auth/password";
import {
  createCustomerSession,
  createStaffSession,
  destroyCustomerSession,
  destroyStaffSession,
  pruneExpiredSessions,
} from "@/src/server/auth/session";
import { getDb } from "@/src/server/db/client";
import { customerUsers, staffUsers } from "@/src/server/db/schema";
import { isDatabaseConfigured } from "@/src/server/env";
import { recordAudit } from "@/src/server/services/audit";

export type AuthFormState = { error: string | null };

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Deliberately uniform failure message. Distinguishing "no such user" from
 * "wrong password" turns the login form into an account-enumeration oracle.
 */
const GENERIC_FAILURE = "Email or password is incorrect.";

export async function staffLoginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isDatabaseConfigured()) {
    return { error: "DATABASE_URL is not configured on the server." };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(staffUsers)
    .where(eq(staffUsers.email, parsed.data.email))
    .limit(1);

  if (!user || !user.isActive) {
    return { error: GENERIC_FAILURE };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.max(
      1,
      Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000),
    );
    return { error: `Account locked after repeated failed attempts. Try again in ${minutes} minute(s).` };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    const failedCount = user.failedLoginCount + 1;
    const shouldLock = failedCount >= MAX_FAILED_ATTEMPTS;
    await db
      .update(staffUsers)
      .set({
        failedLoginCount: shouldLock ? 0 : failedCount,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null,
        updatedAt: new Date(),
      })
      .where(eq(staffUsers.id, user.id));

    if (shouldLock) {
      await recordAudit({
        actor: { type: "SYSTEM" },
        action: "staff.login.locked",
        entityType: "staff_user",
        entityId: user.id,
        summary: `Locked ${user.email} for ${LOCKOUT_MINUTES} minutes after ${MAX_FAILED_ATTEMPTS} failed attempts.`,
      });
      return { error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` };
    }
    return { error: GENERIC_FAILURE };
  }

  await db
    .update(staffUsers)
    .set({ failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(staffUsers.id, user.id));

  await createStaffSession(user.id);
  await recordAudit({
    actor: { type: "STAFF", id: user.id, name: user.name, email: user.email },
    action: "staff.login",
    entityType: "staff_user",
    entityId: user.id,
    summary: `${user.name} signed in to the control center.`,
  });

  void pruneExpiredSessions().catch(() => undefined);

  redirect("/admin");
}

export async function staffLogoutAction(): Promise<void> {
  await destroyStaffSession();
  redirect("/admin/login");
}

export async function customerLoginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isDatabaseConfigured()) {
    return { error: "DATABASE_URL is not configured on the server." };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(customerUsers)
    .where(eq(customerUsers.email, parsed.data.email))
    .limit(1);

  if (!user || !user.isActive || !user.passwordHash) {
    return { error: GENERIC_FAILURE };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: GENERIC_FAILURE };
  }

  await db
    .update(customerUsers)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(customerUsers.id, user.id));

  await createCustomerSession(user.id);
  await recordAudit({
    actor: { type: "CUSTOMER", id: user.id, name: user.name, email: user.email },
    action: "customer.login",
    entityType: "customer_user",
    entityId: user.id,
    companyId: user.companyId,
    summary: `${user.name} signed in to the customer portal.`,
  });

  redirect("/account");
}

export async function customerLogoutAction(): Promise<void> {
  await destroyCustomerSession();
  redirect("/account/login");
}
