import "server-only";

import { sql } from "drizzle-orm";

import { getDb } from "@/src/server/db/client";
import type { WorkspaceNotification } from "@/components/commercial/WorkspaceShell";

/**
 * The topbar bell. These are derived counts of things that need a human to act,
 * not a stored notification feed — so the badge can never go stale against the
 * data it describes.
 */
export async function getStaffNotifications(): Promise<WorkspaceNotification[]> {
  const db = getDb();
  const [row] = await db.execute<{
    expiring_licenses: number;
    overdue_invoices: number;
    pending_payments: number;
    lapsed_subscriptions: number;
    blocked_devices: number;
  }>(sql`
    select
      (select count(*)::int from licenses
        where status = 'ACTIVE' and expires_at is not null
          and expires_at between now() and now() + interval '7 days') as expiring_licenses,
      (select count(*)::int from invoices
        where status in ('ISSUED', 'OVERDUE') and due_at is not null and due_at < now()) as overdue_invoices,
      (select count(*)::int from payments where status = 'PENDING') as pending_payments,
      (select count(*)::int from subscriptions
        where status in ('GRACE_PERIOD', 'PAYMENT_DUE', 'EXPIRED')) as lapsed_subscriptions,
      (select count(*)::int from device_activations where status = 'BLOCKED') as blocked_devices
  `);

  const notifications: WorkspaceNotification[] = [];

  if (Number(row.expiring_licenses) > 0) {
    notifications.push({
      id: "expiring-licenses",
      title: `${row.expiring_licenses} license(s) expiring within 7 days`,
      detail: "Renew or contact the customer before access lapses.",
      href: "/admin/licenses?status=ACTIVE",
      tone: "warn",
    });
  }
  if (Number(row.overdue_invoices) > 0) {
    notifications.push({
      id: "overdue-invoices",
      title: `${row.overdue_invoices} overdue invoice(s)`,
      detail: "Past the due date and still unpaid.",
      href: "/admin/invoices?status=OVERDUE",
      tone: "danger",
    });
  }
  if (Number(row.pending_payments) > 0) {
    notifications.push({
      id: "pending-payments",
      title: `${row.pending_payments} payment(s) awaiting confirmation`,
      detail: "Confirm to activate the customer's subscription.",
      href: "/admin/payments?status=PENDING",
      tone: "warn",
    });
  }
  if (Number(row.lapsed_subscriptions) > 0) {
    notifications.push({
      id: "lapsed-subscriptions",
      title: `${row.lapsed_subscriptions} subscription(s) in grace or expired`,
      detail: "Customers who will lose access without a renewal.",
      href: "/admin/renewals?status=OVERDUE",
      tone: "danger",
    });
  }
  if (Number(row.blocked_devices) > 0) {
    notifications.push({
      id: "blocked-devices",
      title: `${row.blocked_devices} blocked device(s)`,
      detail: "Blocked activations awaiting review.",
      href: "/admin/devices?status=BLOCKED",
      tone: "info",
    });
  }

  return notifications;
}

export async function getCustomerNotifications(companyId: string): Promise<WorkspaceNotification[]> {
  const db = getDb();
  const [row] = await db.execute<{
    expiring_licenses: number;
    unpaid_invoices: number;
  }>(sql`
    select
      (select count(*)::int from licenses
        where company_id = ${companyId} and status = 'ACTIVE' and expires_at is not null
          and expires_at between now() and now() + interval '30 days') as expiring_licenses,
      (select count(*)::int from invoices
        where company_id = ${companyId} and status in ('ISSUED', 'OVERDUE')) as unpaid_invoices
  `);

  const notifications: WorkspaceNotification[] = [];

  if (Number(row.expiring_licenses) > 0) {
    notifications.push({
      id: "license-expiring",
      title: "Your license expires soon",
      detail: "Renew to keep your desktop installs activated.",
      href: "/account/license",
      tone: "warn",
    });
  }
  if (Number(row.unpaid_invoices) > 0) {
    notifications.push({
      id: "unpaid-invoices",
      title: `${row.unpaid_invoices} unpaid invoice(s)`,
      detail: "Settle to avoid interruption.",
      href: "/account/invoices",
      tone: "danger",
    });
  }

  return notifications;
}
