import "server-only";

import { createHmac, randomBytes } from "node:crypto";

import { sessionSecret } from "@/src/server/env";

/** Opaque session token handed to the browser. Never stored server-side as-is. */
export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Session tokens are stored as a keyed hash, so a leaked database dump cannot
 * be replayed as a set of valid session cookies.
 */
export function hashSessionToken(token: string): string {
  return createHmac("sha256", sessionSecret()).update(token).digest("hex");
}
