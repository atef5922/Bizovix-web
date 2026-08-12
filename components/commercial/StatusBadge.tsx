/**
 * Server component — status vocabulary shared by every admin table.
 * Tones map to the existing workspace palette: green for healthy, amber for
 * "needs attention soon", red for blocked/failed, slate for inert.
 */
const TONES: Record<string, "ok" | "warn" | "danger" | "info" | "muted"> = {
  // Company
  ACTIVE: "ok",
  TRIAL: "info",
  SUSPENDED: "warn",
  EXPIRED: "danger",
  CANCELLED: "muted",
  // Subscription
  TRIALING: "info",
  PAYMENT_DUE: "warn",
  GRACE_PERIOD: "warn",
  // License
  REVOKED: "danger",
  // Device
  DEACTIVATED: "muted",
  BLOCKED: "danger",
  REPLACED: "muted",
  // Payment
  PENDING: "warn",
  PAID: "ok",
  FAILED: "danger",
  PARTIAL: "warn",
  REFUNDED: "muted",
  // Invoice
  DRAFT: "muted",
  ISSUED: "info",
  OVERDUE: "danger",
  VOID: "muted",
  // Plan / user
  INACTIVE: "muted",
  PUBLIC: "ok",
  PRIVATE: "muted",
  OWNER: "info",
  ADMIN: "info",
  MEMBER: "muted",
  MONTHLY: "info",
  YEARLY: "info",
  PERPETUAL: "ok",
  ONE_TIME: "ok",
};

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  const tone = TONES[value] ?? "muted";
  return (
    <span className={`status-badge tone-${tone}`}>
      {label ?? value.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export function BoolBadge({
  value,
  onLabel,
  offLabel,
}: {
  value: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <span className={`status-badge tone-${value ? "ok" : "muted"}`}>
      {value ? onLabel : offLabel}
    </span>
  );
}
