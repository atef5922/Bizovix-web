"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireStaffCapability } from "@/src/server/auth/guard";
import { hashPassword } from "@/src/server/auth/password";
import { getDb } from "@/src/server/db/client";
import { companies, customerUsers } from "@/src/server/db/schema";
import { recordAudit } from "@/src/server/services/audit";
import { nextCompanyCode } from "@/src/server/services/companies";
import {
  actionError,
  actionOk,
  bool,
  optionalStr,
  str,
  toActionError,
  type ActionState,
} from "./action-state";

const COMPANY_STATUSES = ["TRIAL", "ACTIVE", "SUSPENDED", "EXPIRED", "CANCELLED"] as const;
const CUSTOMER_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

function staffActor(session: Awaited<ReturnType<typeof requireStaffCapability>>) {
  return {
    type: "STAFF" as const,
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}

export async function createCompanyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("companies.write");
    const name = str(formData, "name");
    if (!name) return actionError("Company name is required.");

    const status = str(formData, "status") as (typeof COMPANY_STATUSES)[number];
    const db = getDb();
    const code = optionalStr(formData, "companyCode") ?? (await nextCompanyCode());

    const [created] = await db
      .insert(companies)
      .values({
        companyCode: code,
        name,
        contactPerson: optionalStr(formData, "contactPerson"),
        email: optionalStr(formData, "email")?.toLowerCase() ?? null,
        phone: optionalStr(formData, "phone"),
        address: optionalStr(formData, "address"),
        countryCode: optionalStr(formData, "countryCode") ?? "BD",
        currencyCode: optionalStr(formData, "currencyCode") ?? "BDT",
        status: COMPANY_STATUSES.includes(status) ? status : "TRIAL",
        notes: optionalStr(formData, "notes"),
      })
      .returning({ id: companies.id, companyCode: companies.companyCode });

    await recordAudit({
      actor: staffActor(session),
      action: "company.created",
      entityType: "company",
      entityId: created.id,
      companyId: created.id,
      summary: `Created company ${name} (${created.companyCode}).`,
      newValues: { name, companyCode: created.companyCode, status },
    });

    revalidatePath("/admin/companies");
    revalidatePath("/admin");
    return actionOk(`Company ${name} created as ${created.companyCode}.`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateCompanyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("companies.write");
    const id = str(formData, "id");
    if (!id) return actionError("Company id is required.");

    const db = getDb();
    const [before] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    if (!before) return actionError("Company not found.");

    const status = str(formData, "status") as (typeof COMPANY_STATUSES)[number];
    const name = str(formData, "name") || before.name;

    await db
      .update(companies)
      .set({
        name,
        contactPerson: optionalStr(formData, "contactPerson"),
        email: optionalStr(formData, "email")?.toLowerCase() ?? null,
        phone: optionalStr(formData, "phone"),
        address: optionalStr(formData, "address"),
        status: COMPANY_STATUSES.includes(status) ? status : before.status,
        notes: optionalStr(formData, "notes"),
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: "company.updated",
      entityType: "company",
      entityId: id,
      companyId: id,
      summary: `Updated company ${name}.`,
      oldValues: { name: before.name, status: before.status, email: before.email },
      newValues: { name, status },
    });

    revalidatePath("/admin/companies");
    return actionOk(`Company ${name} updated.`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function setCompanyStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("companies.write");
    const id = str(formData, "id");
    const status = str(formData, "status") as (typeof COMPANY_STATUSES)[number];
    if (!id || !COMPANY_STATUSES.includes(status)) return actionError("Invalid request.");

    const db = getDb();
    const [before] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    if (!before) return actionError("Company not found.");

    await db
      .update(companies)
      .set({ status, updatedAt: new Date() })
      .where(eq(companies.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: `company.status.${status.toLowerCase()}`,
      entityType: "company",
      entityId: id,
      companyId: id,
      summary: `${before.name}: status ${before.status} → ${status}.`,
      oldValues: { status: before.status },
      newValues: { status },
    });

    revalidatePath("/admin/companies");
    revalidatePath("/admin");
    return actionOk(`${before.name} is now ${status.toLowerCase()}.`);
  } catch (error) {
    return toActionError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Customer users                                                              */
/* -------------------------------------------------------------------------- */

export async function createCustomerUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("customers.write");
    const companyId = str(formData, "companyId");
    const name = str(formData, "name");
    const email = str(formData, "email").toLowerCase();
    const password = str(formData, "password");

    if (!companyId) return actionError("Select a company.");
    if (!name) return actionError("Name is required.");
    if (!email) return actionError("Email is required.");
    if (password && password.length < 8) {
      return actionError("Password must be at least 8 characters.");
    }

    const role = str(formData, "role") as (typeof CUSTOMER_ROLES)[number];
    const db = getDb();

    const [created] = await db
      .insert(customerUsers)
      .values({
        companyId,
        name,
        email,
        passwordHash: password ? await hashPassword(password) : null,
        role: CUSTOMER_ROLES.includes(role) ? role : "MEMBER",
        isActive: true,
      })
      .returning({ id: customerUsers.id });

    await recordAudit({
      actor: staffActor(session),
      action: "customer_user.created",
      entityType: "customer_user",
      entityId: created.id,
      companyId,
      summary: `Created portal user ${name} (${email}).`,
      newValues: { name, email, role },
    });

    revalidatePath("/admin/users");
    return actionOk(
      password
        ? `${name} created and can sign in to the customer portal.`
        : `${name} created. Set a password before they can sign in.`,
    );
  } catch (error) {
    return toActionError(error);
  }
}

export async function setCustomerUserActiveAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("customers.write");
    const id = str(formData, "id");
    const isActive = bool(formData, "isActive");
    if (!id) return actionError("User id is required.");

    const db = getDb();
    const [before] = await db
      .select()
      .from(customerUsers)
      .where(eq(customerUsers.id, id))
      .limit(1);
    if (!before) return actionError("User not found.");

    await db
      .update(customerUsers)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(customerUsers.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: isActive ? "customer_user.enabled" : "customer_user.disabled",
      entityType: "customer_user",
      entityId: id,
      companyId: before.companyId,
      summary: `${before.name} portal access ${isActive ? "enabled" : "disabled"}.`,
    });

    revalidatePath("/admin/users");
    return actionOk(`${before.name} ${isActive ? "enabled" : "disabled"}.`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function setCustomerPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("customers.write");
    const id = str(formData, "id");
    const password = str(formData, "password");
    if (!id) return actionError("User id is required.");
    if (password.length < 8) return actionError("Password must be at least 8 characters.");

    const db = getDb();
    const [before] = await db
      .select()
      .from(customerUsers)
      .where(eq(customerUsers.id, id))
      .limit(1);
    if (!before) return actionError("User not found.");

    await db
      .update(customerUsers)
      .set({ passwordHash: await hashPassword(password), updatedAt: new Date() })
      .where(eq(customerUsers.id, id));

    // The password itself is never written to the audit trail.
    await recordAudit({
      actor: staffActor(session),
      action: "customer_user.password_set",
      entityType: "customer_user",
      entityId: id,
      companyId: before.companyId,
      summary: `Portal password set for ${before.name} by staff.`,
    });

    revalidatePath("/admin/users");
    return actionOk(`Password updated for ${before.name}.`);
  } catch (error) {
    return toActionError(error);
  }
}

export async function setCustomerRoleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffCapability("customers.write");
    const id = str(formData, "id");
    const role = str(formData, "role") as (typeof CUSTOMER_ROLES)[number];
    if (!id || !CUSTOMER_ROLES.includes(role)) return actionError("Invalid request.");

    const db = getDb();
    const [before] = await db
      .select()
      .from(customerUsers)
      .where(eq(customerUsers.id, id))
      .limit(1);
    if (!before) return actionError("User not found.");

    await db
      .update(customerUsers)
      .set({ role, updatedAt: new Date() })
      .where(eq(customerUsers.id, id));

    await recordAudit({
      actor: staffActor(session),
      action: "customer_user.role_changed",
      entityType: "customer_user",
      entityId: id,
      companyId: before.companyId,
      summary: `${before.name}: role ${before.role} → ${role}.`,
      oldValues: { role: before.role },
      newValues: { role },
    });

    revalidatePath("/admin/users");
    return actionOk(`${before.name} is now ${role.toLowerCase()}.`);
  } catch (error) {
    return toActionError(error);
  }
}
