import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/src/server/env";
import { activateOrRefreshDevice, type ActivationErrorCode } from "@/src/server/services/activation";
import { clientIp } from "@/src/server/services/shared";

export const dynamic = "force-dynamic";

const MAX_LENGTHS = {
  licenseKey: 64,
  deviceHardwareId: 256,
  deviceName: 128,
  platform: 32,
  appVersion: 32,
} as const;

const STATUS_BY_CODE: Record<ActivationErrorCode, number> = {
  SIGNING_NOT_CONFIGURED: 503,
  RATE_LIMITED: 429,
  INVALID_KEY: 401,
  LICENSE_REVOKED: 403,
  LICENSE_EXPIRED: 403,
  LICENSE_SUSPENDED: 403,
  COMPANY_SUSPENDED: 403,
  DEVICE_BLOCKED: 403,
  DEVICE_REPLACED: 409,
  SEAT_LIMIT_REACHED: 409,
};

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

/**
 * Public endpoint the desktop app calls to activate a license key against a
 * machine, and periodically thereafter as a heartbeat. See
 * docs/desktop-activation-api.md for the full contract. Unauthenticated by
 * design — the license key itself is the credential, same trust model as
 * server-side license verification everywhere else in this codebase.
 */
export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: "Service unavailable." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_REQUEST", message: "Malformed request body." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { ok: false, code: "INVALID_REQUEST", message: "Malformed request body." },
      { status: 400 },
    );
  }

  const { licenseKey, deviceHardwareId, deviceName, platform, appVersion } = body as Record<
    string,
    unknown
  >;

  if (
    !isBoundedString(licenseKey, MAX_LENGTHS.licenseKey) ||
    !isBoundedString(deviceHardwareId, MAX_LENGTHS.deviceHardwareId) ||
    !isBoundedString(deviceName, MAX_LENGTHS.deviceName) ||
    (platform !== undefined && !isBoundedString(platform, MAX_LENGTHS.platform)) ||
    (appVersion !== undefined && appVersion !== null && !isBoundedString(appVersion, MAX_LENGTHS.appVersion))
  ) {
    return NextResponse.json(
      { ok: false, code: "INVALID_REQUEST", message: "Malformed request body." },
      { status: 400 },
    );
  }

  try {
    const outcome = await activateOrRefreshDevice({
      licenseKey,
      deviceHardwareId,
      deviceName,
      platform: platform as string | undefined,
      appVersion: (appVersion as string | null | undefined) ?? null,
      ip: clientIp(request.headers),
    });

    if (outcome.ok) {
      return NextResponse.json(outcome, { status: 200 });
    }

    const status = STATUS_BY_CODE[outcome.code];
    const headers: HeadersInit = {};
    if (outcome.retryAfterSeconds) headers["Retry-After"] = String(outcome.retryAfterSeconds);
    return NextResponse.json(outcome, { status, headers });
  } catch (error) {
    console.error("[license/activate] unexpected error", error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
