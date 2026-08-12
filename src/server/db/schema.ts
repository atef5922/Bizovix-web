import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const staffRoleEnum = pgEnum("staff_role", [
  "SUPER_ADMIN",
  "BILLING_ADMIN",
  "SUPPORT_ADMIN",
  "READ_ONLY",
]);

export const companyStatusEnum = pgEnum("company_status", [
  "TRIAL",
  "ACTIVE",
  "SUSPENDED",
  "EXPIRED",
  "CANCELLED",
]);

export const customerRoleEnum = pgEnum("customer_role", ["OWNER", "ADMIN", "MEMBER"]);

export const billingTypeEnum = pgEnum("billing_type", ["MONTHLY", "YEARLY", "ONE_TIME"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "TRIALING",
  "ACTIVE",
  "PAYMENT_DUE",
  "GRACE_PERIOD",
  "SUSPENDED",
  "EXPIRED",
  "CANCELLED",
]);

export const licenseTypeEnum = pgEnum("license_type", ["MONTHLY", "YEARLY", "PERPETUAL"]);

export const licenseStatusEnum = pgEnum("license_status", [
  "ACTIVE",
  "EXPIRED",
  "SUSPENDED",
  "REVOKED",
]);

export const deviceStatusEnum = pgEnum("device_status", [
  "ACTIVE",
  "DEACTIVATED",
  "BLOCKED",
  "REPLACED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "PARTIAL",
  "REFUNDED",
  "CANCELLED",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "DRAFT",
  "ISSUED",
  "PAID",
  "OVERDUE",
  "VOID",
]);

export const actorTypeEnum = pgEnum("actor_type", ["STAFF", "CUSTOMER", "SYSTEM"]);

/* -------------------------------------------------------------------------- */
/* Bizovix staff identity (deliberately outside any customer company)          */
/* -------------------------------------------------------------------------- */

export const staffUsers = pgTable(
  "staff_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: staffRoleEnum("role").notNull().default("READ_ONLY"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    failedLoginCount: integer("failed_login_count").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("staff_users_email_key").on(table.email)],
);

export const staffSessions = pgTable(
  "staff_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    staffUserId: uuid("staff_user_id")
      .notNull()
      .references(() => staffUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("staff_sessions_token_hash_key").on(table.tokenHash),
    index("staff_sessions_user_idx").on(table.staffUserId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Customers                                                                   */
/* -------------------------------------------------------------------------- */

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyCode: text("company_code").notNull(),
    name: text("name").notNull(),
    contactPerson: text("contact_person"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    countryCode: text("country_code").notNull().default("BD"),
    currencyCode: text("currency_code").notNull().default("BDT"),
    status: companyStatusEnum("status").notNull().default("TRIAL"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("companies_company_code_key").on(table.companyCode),
    index("companies_status_idx").on(table.status),
  ],
);

export const customerUsers = pgTable(
  "customer_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    role: customerRoleEnum("role").notNull().default("MEMBER"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("customer_users_email_key").on(table.email),
    index("customer_users_company_idx").on(table.companyId),
  ],
);

export const customerSessions = pgTable(
  "customer_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerUserId: uuid("customer_user_id")
      .notNull()
      .references(() => customerUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("customer_sessions_token_hash_key").on(table.tokenHash),
    index("customer_sessions_user_idx").on(table.customerUserId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Plans & features                                                            */
/* -------------------------------------------------------------------------- */

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    billingType: billingTypeEnum("billing_type").notNull().default("MONTHLY"),
    priceMinor: integer("price_minor").notNull().default(0),
    currencyCode: text("currency_code").notNull().default("BDT"),
    durationMonths: integer("duration_months"),
    maxDevices: integer("max_devices").notNull().default(1),
    maxUsers: integer("max_users").notNull().default(5),
    offlineGraceDays: integer("offline_grace_days").notNull().default(7),
    supportMonths: integer("support_months"),
    updateMonths: integer("update_months"),
    isActive: boolean("is_active").notNull().default(true),
    isPublic: boolean("is_public").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("plans_code_key").on(table.code)],
);

export const features = pgTable(
  "features",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    moduleKey: text("module_key"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("features_key_key").on(table.key)],
);

export const planFeatures = pgTable(
  "plan_features",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    featureId: uuid("feature_id")
      .notNull()
      .references(() => features.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull().default(true),
  },
  (table) => [uniqueIndex("plan_features_plan_feature_key").on(table.planId, table.featureId)],
);

/* -------------------------------------------------------------------------- */
/* Subscriptions                                                               */
/* -------------------------------------------------------------------------- */

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    status: subscriptionStatusEnum("status").notNull().default("TRIALING"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    graceEndsAt: timestamp("grace_ends_at", { withTimezone: true }),
    autoRenews: boolean("auto_renews").notNull().default(false),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("subscriptions_company_idx").on(table.companyId),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_ends_at_idx").on(table.endsAt),
  ],
);

/* -------------------------------------------------------------------------- */
/* Licensing                                                                   */
/* -------------------------------------------------------------------------- */

export const licenses = pgTable(
  "licenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    licenseType: licenseTypeEnum("license_type").notNull(),
    // Only the hash is ever persisted; the plaintext key is shown once at
    // generation time and never recoverable afterwards.
    licenseKeyHash: text("license_key_hash").notNull(),
    licenseKeyPrefix: text("license_key_prefix").notNull(),
    licenseKeyLast4: text("license_key_last4").notNull(),
    status: licenseStatusEnum("status").notNull().default("ACTIVE"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    updatesUntil: timestamp("updates_until", { withTimezone: true }),
    supportUntil: timestamp("support_until", { withTimezone: true }),
    maxDevices: integer("max_devices").notNull().default(1),
    notes: text("notes"),
    createdByStaffId: uuid("created_by_staff_id").references(() => staffUsers.id, {
      onDelete: "set null",
    }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("licenses_key_hash_key").on(table.licenseKeyHash),
    index("licenses_company_status_idx").on(table.companyId, table.status),
    index("licenses_expires_at_idx").on(table.expiresAt),
  ],
);

export const deviceActivations = pgTable(
  "device_activations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    licenseId: uuid("license_id")
      .notNull()
      .references(() => licenses.id, { onDelete: "cascade" }),
    deviceIdHash: text("device_id_hash").notNull(),
    deviceName: text("device_name").notNull(),
    platform: text("platform").notNull().default("windows"),
    appVersion: text("app_version"),
    status: deviceStatusEnum("status").notNull().default("ACTIVE"),
    activatedAt: timestamp("activated_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
    replacedByDeviceId: uuid("replaced_by_device_id").references(
      (): AnyPgColumn => deviceActivations.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("device_activations_license_device_key").on(table.licenseId, table.deviceIdHash),
    index("device_activations_company_status_idx").on(table.companyId, table.status),
  ],
);

/* -------------------------------------------------------------------------- */
/* Billing                                                                     */
/* -------------------------------------------------------------------------- */

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    invoiceNumber: text("invoice_number").notNull(),
    amount: numeric("amount", { precision: 18, scale: 4 }).notNull(),
    currencyCode: text("currency_code").notNull().default("BDT"),
    status: invoiceStatusEnum("status").notNull().default("ISSUED"),
    description: text("description"),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("invoices_number_key").on(table.invoiceNumber),
    index("invoices_company_idx").on(table.companyId),
    index("invoices_status_idx").on(table.status),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    amount: numeric("amount", { precision: 18, scale: 4 }).notNull(),
    currencyCode: text("currency_code").notNull().default("BDT"),
    paymentMethod: text("payment_method").notNull().default("bank_transfer"),
    gateway: text("gateway"),
    gatewayTransactionId: text("gateway_transaction_id"),
    // Unique when present: a replayed gateway callback hits this constraint and
    // is treated as a no-op instead of settling the same payment twice.
    webhookEventId: text("webhook_event_id"),
    reference: text("reference"),
    purpose: text("purpose"),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    confirmedByStaffId: uuid("confirmed_by_staff_id").references(() => staffUsers.id, {
      onDelete: "set null",
    }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("payments_gateway_txn_key").on(table.gatewayTransactionId),
    uniqueIndex("payments_webhook_event_key").on(table.webhookEventId),
    index("payments_company_status_idx").on(table.companyId, table.status),
    index("payments_paid_at_idx").on(table.paidAt),
  ],
);

/* -------------------------------------------------------------------------- */
/* Distribution                                                                */
/* -------------------------------------------------------------------------- */

export const softwareReleases = pgTable(
  "software_releases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    version: text("version").notNull(),
    fileName: text("file_name").notNull(),
    downloadPath: text("download_path"),
    platform: text("platform").notNull().default("windows"),
    isLatest: boolean("is_latest").notNull().default(false),
    releaseNotes: text("release_notes"),
    fileSizeBytes: integer("file_size_bytes"),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("software_releases_version_key").on(table.version)],
);

export const downloadEvents = pgTable(
  "download_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    platform: text("platform").notNull().default("windows"),
    appVersion: text("app_version"),
    source: text("source").notNull().default("public_download_page"),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
    countryCode: text("country_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("download_events_created_at_idx").on(table.createdAt),
    index("download_events_company_idx").on(table.companyId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Activation rate limiting                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Brute-force protection for the unauthenticated activation endpoint.
 *
 * Deliberately DB-backed rather than in-memory: the app may run more than one
 * instance, and an in-process counter would let an attacker reset their budget
 * simply by landing on a different instance.
 */
export const activationAttempts = pgTable(
  "activation_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // "ip:1.2.3.4" or "key:<hash>" — one row per bucket per window.
    scope: text("scope").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    attempts: integer("attempts").notNull().default(0),
    failures: integer("failures").notNull().default(0),
    blockedUntil: timestamp("blocked_until", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("activation_attempts_scope_window_key").on(table.scope, table.windowStart),
    index("activation_attempts_updated_idx").on(table.updatedAt),
  ],
);

/* -------------------------------------------------------------------------- */
/* Audit                                                                       */
/* -------------------------------------------------------------------------- */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorType: actorTypeEnum("actor_type").notNull().default("STAFF"),
    // Intentionally not a foreign key: audit rows must outlive the actors and
    // entities they describe.
    actorId: text("actor_id"),
    actorName: text("actor_name"),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
    summary: text("summary"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_created_at_idx").on(table.createdAt),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_company_idx").on(table.companyId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Inferred types                                                              */
/* -------------------------------------------------------------------------- */

export type StaffUser = typeof staffUsers.$inferSelect;
export type StaffRole = (typeof staffRoleEnum.enumValues)[number];
export type Company = typeof companies.$inferSelect;
export type CompanyStatus = (typeof companyStatusEnum.enumValues)[number];
export type CustomerUser = typeof customerUsers.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type BillingTypeValue = (typeof billingTypeEnum.enumValues)[number];
export type Feature = typeof features.$inferSelect;
export type CustomerRoleValue = (typeof customerRoleEnum.enumValues)[number];
export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];
export type License = typeof licenses.$inferSelect;
export type LicenseType = (typeof licenseTypeEnum.enumValues)[number];
export type LicenseStatus = (typeof licenseStatusEnum.enumValues)[number];
export type DeviceActivation = typeof deviceActivations.$inferSelect;
export type DeviceStatus = (typeof deviceStatusEnum.enumValues)[number];
export type Payment = typeof payments.$inferSelect;
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];
export type SoftwareRelease = typeof softwareReleases.$inferSelect;
export type DownloadEvent = typeof downloadEvents.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
