# Desktop activation API

This is the contract between the Bizovix backend (this repo) and the Windows
desktop ERP application (a separate codebase). It is the only way real
installs create real `device_activations` rows — everything else in the admin
panel is staff/admin-driven. If the desktop app never calls this, the admin
**Devices**, **Activations** and dashboard **Active devices** numbers will
only ever reflect what staff entered manually.

## Endpoint

```
POST /api/license/activate
Content-Type: application/json
```

No authentication header — the license key itself is the credential, and the
endpoint is rate-limited (see below). Public, internet-facing.

Call this **once when the app starts** and **again periodically while it
runs** (recommended: every 6 hours). The same call activates a fresh install
and refreshes ("heartbeats") an already-active one — there is no separate
heartbeat endpoint, to keep this contract as small as possible.

### Request body

```json
{
  "licenseKey": "BIZ-YRL-AB3D-9F2K-TT4Q-8P1R",
  "deviceHardwareId": "a stable per-machine fingerprint you compute",
  "deviceName": "DESKTOP-ACCOUNTS-1",
  "platform": "windows",
  "appVersion": "1.4.2"
}
```

| Field | Required | Notes |
|---|---|---|
| `licenseKey` | yes | Exactly what the user typed/pasted. The server trims, uppercases and normalizes dash variants — don't pre-process it beyond trimming whitespace. Max 64 chars. |
| `deviceHardwareId` | yes | **Must be stable across restarts and reinstalls of the same OS install** — e.g. derived from the Windows machine GUID / disk serial / TPM identity, not a randomly generated value per launch. This is what a license's device slot is keyed on: if you regenerate it every run, every heartbeat will look like a brand-new device and exhaust the seat limit. Max 256 chars. |
| `deviceName` | yes | Human-readable label shown in the admin panel (e.g. hostname). Max 128 chars. |
| `platform` | no | Defaults to `"windows"`. Max 32 chars. |
| `appVersion` | no | Your app's version string, shown in the admin Devices table. Max 32 chars. |

### Success response — `200`

```json
{
  "ok": true,
  "entitlement": "<base64url payload>.<base64url signature>",
  "company": { "id": "...", "name": "Acme Trading Ltd", "code": "BZX-0042" },
  "license": {
    "id": "...",
    "type": "YEARLY",
    "expiresAt": "2027-01-01T00:00:00.000Z",
    "maxDevices": 3
  },
  "device": { "id": "...", "status": "ACTIVE" }
}
```

Store the whole response, but `entitlement` is the important part — it is
what you check locally to decide whether the app is allowed to run (see
below). Treat this call as best-effort network access: if it fails (no
internet, server down), fall back to the **last entitlement you verified and
stored**, not to "always allow."

### Error responses — `4xx` / `5xx`

Every non-200 response has this shape:

```json
{ "ok": false, "code": "LICENSE_EXPIRED", "message": "This license has expired." }
```

| HTTP | `code` | Meaning | Suggested client behavior |
|---|---|---|---|
| 400 | `INVALID_REQUEST` | Malformed/oversized body | Bug in your request — log it, don't retry immediately |
| 401 | `INVALID_KEY` | Key not recognized | Ask the user to re-check their key |
| 403 | `LICENSE_REVOKED` | Key was revoked by staff | Block the app; tell the user to contact support |
| 403 | `LICENSE_EXPIRED` | Past `expiresAt` | Block the app; prompt to renew |
| 403 | `LICENSE_SUSPENDED` | Suspended by staff (e.g. non-payment) | Block the app; prompt to contact billing |
| 403 | `COMPANY_SUSPENDED` | The whole account is suspended/cancelled | Block the app; contact support |
| 403 | `DEVICE_BLOCKED` | This specific machine was blocked by staff | Block the app on this machine only |
| 409 | `DEVICE_REPLACED` | Staff migrated this seat to a different machine | Tell the user their installation was moved; contact support if unexpected |
| 409 | `SEAT_LIMIT_REACHED` | License's `maxDevices` is already in use | Tell the user to deactivate a device from their account portal, or buy more seats |
| 429 | `RATE_LIMITED` | Too many attempts from this key or IP | Respect the `Retry-After` header (seconds) before retrying |
| 503 | `SERVICE_UNAVAILABLE` | Backend not reachable / not configured | Fall back to the last locally-verified entitlement |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry with backoff |

None of the 4xx codes above should ever cause you to *delete* a previously
stored, still-locally-valid entitlement — only a fresh successful call
replaces it. A temporary network or server problem must never lock a paying
customer out.

## Verifying the entitlement locally (offline enforcement)

`entitlement` is `base64url(payload).base64url(signature)`, Ed25519-signed
server-side. The desktop app ships **only the Ed25519 public key**
(`LICENSE_SIGNING_PUBLIC_KEY` — ask whoever manages the Bizovix backend
deployment for this value; it is safe to embed in the client, it cannot be
used to forge a token) and verifies locally:

1. Split the string on `.` — reject if not exactly two parts.
2. Base64url-decode both parts to raw bytes.
3. Verify the Ed25519 signature (second part) over the raw payload bytes
   (first part) using the public key. Reject if verification fails —
   never parse the payload before the signature check passes.
4. UTF-8 decode and JSON-parse the payload. Shape:

```json
{
  "companyId": "...",
  "licenseId": "...",
  "planId": "...",
  "licenseType": "YEARLY",
  "deviceId": "...",
  "features": ["accounting", "pos", "payroll"],
  "expiresAt": "2027-01-01T00:00:00.000Z",
  "updatesUntil": "2027-01-01T00:00:00.000Z",
  "offlineGraceDays": 7,
  "issuedAt": "2026-08-12T10:00:00.000Z"
}
```

Enforcement rule while offline (no successful call to `/api/license/activate`
recently):

- Compute `daysSinceIssued = (now - issuedAt) / 1 day`.
- If `expiresAt` is set and `now >= expiresAt` → block (perpetual licenses
  have `expiresAt: null` and never expire this way).
- Else if `daysSinceIssued > offlineGraceDays` → block, with a message asking
  the user to reconnect to the internet to re-validate.
- Otherwise → allow, gated to the feature keys in `features`.

This mirrors the server's own `verifyEntitlement()` verification logic
(`src/server/services/license-key.ts`) so both sides agree on what a valid
token looks like.

## Example

```bash
curl -X POST https://your-bizovix-domain/api/license/activate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "BIZ-YRL-AB3D-9F2K-TT4Q-8P1R",
    "deviceHardwareId": "8f14e45fceea167a5a36dedd4bea2543",
    "deviceName": "DESKTOP-ACCOUNTS-1",
    "platform": "windows",
    "appVersion": "1.4.2"
  }'
```

## What this powers on the backend

Every successful call is what makes `/admin/devices`, `/admin/activations`
and the dashboard's **Active devices** tile reflect real field usage instead
of only staff-entered data: the first call for a hardware id creates a real
`device_activations` row; every later call from an already-active device just
refreshes its `lastSeenAt` (shown as "Last seen" in the admin Devices table).
Revoking a license from `/admin/licenses` immediately deactivates every device
on it, and their next heartbeat will get `LICENSE_REVOKED`.
