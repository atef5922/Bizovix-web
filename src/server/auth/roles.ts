import type { StaffRole } from "@/src/server/db/schema";

/**
 * Server-enforced capability matrix. The admin UI hides controls a role cannot
 * use, but hiding is cosmetic — every mutation re-checks with `staffCan()`
 * before touching the database.
 */
export const STAFF_CAPABILITIES = [
  "companies.write",
  "customers.write",
  "devices.write",
  "subscriptions.write",
  "payments.write",
  "invoices.write",
  "licenses.create",
  "licenses.revoke",
  "plans.write",
  "releases.write",
  "staff.manage",
] as const;

export type StaffCapability = (typeof STAFF_CAPABILITIES)[number];

const MATRIX: Record<StaffRole, readonly StaffCapability[]> = {
  SUPER_ADMIN: STAFF_CAPABILITIES,
  BILLING_ADMIN: ["subscriptions.write", "payments.write", "invoices.write"],
  SUPPORT_ADMIN: ["companies.write", "customers.write", "devices.write", "licenses.create"],
  READ_ONLY: [],
};

export function staffCan(role: StaffRole, capability: StaffCapability): boolean {
  return MATRIX[role].includes(capability);
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  SUPER_ADMIN: "Super Admin",
  BILLING_ADMIN: "Billing Admin",
  SUPPORT_ADMIN: "Support Admin",
  READ_ONLY: "Read Only",
};

export function staffInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
