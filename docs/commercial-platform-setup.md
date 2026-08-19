# Commercial Platform Setup

The admin control center (`/admin`) and customer portal (`/account`) are backed by
Postgres running inside this Next.js app — there is no separate API service.

## 1. Configure the environment

`.env.local` is created for you with generated secrets. Fill in the one blank:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

The other values (`SESSION_SECRET`, `LICENSE_KEY_PEPPER`, `LICENSE_SIGNING_*`)
are already generated. To rotate them:

```bash
node scripts/generate-keys.ts
```

> Regenerating `LICENSE_SIGNING_*` invalidates every entitlement already issued
> to a desktop install. Rotate deliberately, not routinely.

## 2. Create the schema and seed data

```bash
npm run db:setup
```

That runs two steps, both safe to re-run:

- `npm run db:migrate` — applies `drizzle/*.sql` in order, tracking what has
  already run in `_bizovix_migrations`.
- `npm run db:seed` — creates the first staff account, the plan/feature
  catalogue mirroring the public pricing page, and the current installer release.

The seed prints the admin email and a randomly generated password **once**.
Store it immediately. To choose your own instead, set `SEED_ADMIN_EMAIL` and
`SEED_ADMIN_PASSWORD` in `.env.local` before seeding.

After changing `src/server/db/schema.ts`, generate a new migration:

```bash
npm run db:generate
```

## 3. Run it

```bash
npm run dev
```

Sign in at `/admin/login`. Customers sign in at `/account/login` — create their
portal user under **Customer users** in the admin panel and set a password there.

## Removing the verification data

End-to-end testing created one demo customer (`BZX-0001 Rahman Trading Ltd`) with
a licence, devices, a settled payment and an invoice. The seeded plans, features
and release are reference data — keep those. To clear only the demo customer:

```bash
psql "$DATABASE_URL" -c "delete from companies where company_code = 'BZX-0001'; delete from audit_logs; delete from download_events;"
```

Cascades remove its users, licences, devices, subscription, invoice and payment.

## Roles

Authorization is enforced server-side in `src/server/auth/roles.ts`; hiding a
button in the UI is cosmetic, every mutation re-checks.

| Role | Can do |
|---|---|
| `SUPER_ADMIN` | Everything, including plans, licence revocation and releases |
| `BILLING_ADMIN` | Subscriptions, payments, invoices |
| `SUPPORT_ADMIN` | Companies, customer users, devices, licence generation |
| `READ_ONLY` | View everything, change nothing |

## How money becomes access

`src/server/services/settlement.ts` is the **only** path that turns a payment
into entitlement. Confirming a manual payment runs it in a single transaction:
issue invoice → extend subscription → reactivate and extend every matching
licence → mark the company active. A future gateway webhook must call this same
function rather than introducing a second activation path.

## Licence keys

Keys are generated server-side with `crypto.randomInt` over a
transcription-safe alphabet, shown **once**, then stored only as a peppered
HMAC plus prefix and last four characters. There is no way to read a key back —
lost keys are reissued, which invalidates the previous one immediately.

## Download tracking

Every download link on the site points at `/api/download/windows`, which records
a `DownloadEvent` and redirects to the current release. This is what populates
the admin **Downloads** section.

If you ever need a fully static export (`NEXT_OUTPUT_EXPORT=true`), set
`siteConfig.erpDownloadPath` back to `erpDownloadFallbackPath` — a static build
has no server, so route handlers and the admin panel are unavailable.

## Deployment

The admin panel needs a Node runtime and a reachable Postgres instance. The
existing `npm run build && npm run start` flow covers this; marketing pages stay
statically prerendered, and only `/admin/*`, `/account/*` and `/api/*` render per
request.
