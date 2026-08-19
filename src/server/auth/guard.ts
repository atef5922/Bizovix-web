import "server-only";

import { redirect } from "next/navigation";

import { getCustomerSession, getStaffSession, type CustomerSession, type StaffSession } from "./session";
import { staffCan, type StaffCapability } from "./roles";
import { AuthorizationError } from "./errors";

/** Thrown by capability checks inside server actions; surfaced as a form error. */
export { AuthorizationError };

/** For pages: bounces to the login screen instead of erroring. */
export async function requireStaffPage(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** For server actions and route handlers: throws rather than redirects. */
export async function requireStaff(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) throw new AuthorizationError("Your session has expired. Sign in again.");
  return session;
}

export async function requireStaffCapability(capability: StaffCapability): Promise<StaffSession> {
  const session = await requireStaff();
  if (!staffCan(session.user.role, capability)) {
    throw new AuthorizationError(
      `Your role (${session.user.role.replace(/_/g, " ").toLowerCase()}) cannot perform this action.`,
    );
  }
  return session;
}

export async function requireCustomerPage(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login");
  return session;
}

export async function requireCustomer(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) throw new AuthorizationError("Your session has expired. Sign in again.");
  return session;
}
