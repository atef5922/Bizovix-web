import "server-only";

import {
  createHmac,
  generateKeyPairSync,
  randomInt,
  sign as cryptoSign,
  verify as cryptoVerify,
} from "node:crypto";

import { licenseKeyPepper, serverEnv } from "@/src/server/env";

/**
 * Human-transcribable alphabet: no O/0, I/1, or U — the characters people
 * reliably mistype when reading a key off an invoice or over the phone.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTVWXYZ23456789";
const GROUP_SIZE = 4;
const GROUP_COUNT = 4;

export const LICENSE_PREFIX = "BIZ";

export type LicenseTypeCode = "MONTHLY" | "YEARLY" | "PERPETUAL";

const TYPE_SEGMENT: Record<LicenseTypeCode, string> = {
  MONTHLY: "MON",
  YEARLY: "YRL",
  PERPETUAL: "PRP",
};

/**
 * Generates a license key with cryptographically strong randomness.
 * `randomInt` is rejection-sampled by Node, so there is no modulo bias across
 * the 31-character alphabet.
 */
export function generateLicenseKey(licenseType: LicenseTypeCode): string {
  const groups: string[] = [];
  for (let g = 0; g < GROUP_COUNT; g += 1) {
    let group = "";
    for (let i = 0; i < GROUP_SIZE; i += 1) {
      group += ALPHABET[randomInt(0, ALPHABET.length)];
    }
    groups.push(group);
  }
  return [LICENSE_PREFIX, TYPE_SEGMENT[licenseType], ...groups].join("-");
}

/**
 * Keys are stored only as a peppered HMAC. A stolen database gives an attacker
 * hashes that cannot be brute-forced without also stealing LICENSE_KEY_PEPPER
 * from the application environment.
 */
export function hashLicenseKey(licenseKey: string): string {
  return createHmac("sha256", licenseKeyPepper())
    .update(licenseKey.trim().toUpperCase())
    .digest("hex");
}

/**
 * Hardware fingerprints are stored only as a peppered HMAC too, mirroring
 * license keys. The literal "device:" label domain-separates the two hash
 * spaces so a device hash can never be replayed as a license-key hash (or
 * vice versa) even though both share the same pepper.
 */
export function normalizeDeviceId(input: string): string {
  return input.trim();
}

export function hashDeviceId(rawId: string): string {
  return createHmac("sha256", licenseKeyPepper())
    .update(`device:${normalizeDeviceId(rawId)}`)
    .digest("hex");
}

export function licenseKeyLast4(licenseKey: string): string {
  const compact = licenseKey.replace(/-/g, "");
  return compact.slice(-4);
}

export function licenseKeyPrefix(licenseKey: string): string {
  return licenseKey.split("-").slice(0, 2).join("-");
}

/** Display form for a key we can no longer read: BIZ-YRL-••••-••••-••••-9K3P */
export function maskedLicenseKey(prefix: string, last4: string): string {
  return `${prefix}-••••-••••-••••-${last4}`;
}

/* -------------------------------------------------------------------------- */
/* Signed entitlement                                                          */
/* -------------------------------------------------------------------------- */

export type EntitlementClaims = {
  companyId: string;
  licenseId: string;
  planId: string;
  licenseType: LicenseTypeCode;
  deviceId: string;
  features: string[];
  expiresAt: string | null;
  updatesUntil: string | null;
  offlineGraceDays: number;
  issuedAt: string;
};

/**
 * Ed25519 over a hand-rolled two-part token rather than a JWT library: this
 * token is a different trust domain from the HMAC session cookies, and making
 * the two visually distinct prevents anyone from ever feeding one to the
 * other's verifier. The desktop app ships only the public key.
 */
export function signEntitlement(claims: EntitlementClaims): string {
  const privateKey = serverEnv.licenseSigningPrivateKey;
  if (!privateKey) {
    throw new Error(
      "LICENSE_SIGNING_PRIVATE_KEY is not set. Generate a key pair before issuing entitlements.",
    );
  }

  const payload = Buffer.from(JSON.stringify(claims), "utf8");
  const signature = cryptoSign(null, payload, privateKey.replace(/\\n/g, "\n"));
  return `${payload.toString("base64url")}.${signature.toString("base64url")}`;
}

export function isEntitlementSigningConfigured(): boolean {
  return Boolean(serverEnv.licenseSigningPrivateKey);
}

/**
 * Verifies a token this server previously issued.
 *
 * The signature is checked BEFORE the payload is parsed as JSON, so malformed
 * or attacker-supplied claims never reach the rest of the system. Returns null
 * on any failure — callers must treat null as "not entitled", never as "unknown".
 */
export function verifyEntitlement(token: string): EntitlementClaims | null {
  const publicKey = serverEnv.licenseSigningPublicKey;
  if (!publicKey || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const payload = Buffer.from(parts[0], "base64url");
    const signature = Buffer.from(parts[1], "base64url");
    if (payload.length === 0 || signature.length === 0) return null;

    const ok = cryptoVerify(null, payload, publicKey.replace(/\\n/g, "\n"), signature);
    if (!ok) return null;

    return JSON.parse(payload.toString("utf8")) as EntitlementClaims;
  } catch {
    return null;
  }
}

/**
 * Normalises what a user typed. Keys are shown grouped and uppercase, but people
 * paste them with stray spaces, lowercase, or en-dashes copied out of an email.
 */
export function normalizeLicenseKey(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[‐-―]/g, "-")
    .replace(/\s+/g, "");
}

/** Helper for provisioning: prints a fresh Ed25519 pair for the env file. */
export function generateSigningKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return {
    publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
    privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  };
}
