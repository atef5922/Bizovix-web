import "server-only";

/**
 * Server-only environment access.
 *
 * Nothing here throws at import time: the marketing site must keep building and
 * running on a machine that has no database configured. Commercial features
 * check `isDatabaseConfigured()` and degrade to a clear "not connected" state
 * instead of crashing the whole site.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const serverEnv = {
  databaseUrl: read("DATABASE_URL"),
  sessionSecret: read("SESSION_SECRET"),
  licenseKeyPepper: read("LICENSE_KEY_PEPPER"),
  licenseSigningPrivateKey: read("LICENSE_SIGNING_PRIVATE_KEY"),
  licenseSigningPublicKey: read("LICENSE_SIGNING_PUBLIC_KEY"),
  nodeEnv: process.env.NODE_ENV ?? "development",
};

export const isProduction = serverEnv.nodeEnv === "production";

export function isDatabaseConfigured(): boolean {
  return Boolean(serverEnv.databaseUrl);
}

export function requireDatabaseUrl(): string {
  if (!serverEnv.databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local before using commercial features.",
    );
  }
  return serverEnv.databaseUrl;
}

/**
 * Secret used to derive session-token hashes. Falls back to DATABASE_URL in
 * development so a local setup works with one variable, but production must set
 * SESSION_SECRET explicitly — otherwise rotating the database URL would silently
 * invalidate every active session.
 */
export function sessionSecret(): string {
  if (serverEnv.sessionSecret) return serverEnv.sessionSecret;
  if (isProduction) {
    throw new Error("SESSION_SECRET must be set in production.");
  }
  return requireDatabaseUrl();
}

export function licenseKeyPepper(): string {
  if (serverEnv.licenseKeyPepper) return serverEnv.licenseKeyPepper;
  if (isProduction) {
    throw new Error("LICENSE_KEY_PEPPER must be set in production.");
  }
  return "dev-only-license-pepper";
}
