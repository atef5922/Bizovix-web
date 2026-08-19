/**
 * Prints the secrets the commercial platform needs, ready to paste into
 * .env.local. Run once per environment — regenerating the signing pair
 * invalidates every entitlement already issued to a desktop install.
 *
 *   node scripts/generate-keys.ts
 */
import { generateKeyPairSync, randomBytes } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");

const toEnvLine = (key: string, pem: string) =>
  `${key}="${pem.trimEnd().replace(/\n/g, "\\n")}"`;

console.log("# --- Bizovix commercial platform secrets ---");
console.log(`SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
console.log(`LICENSE_KEY_PEPPER=${randomBytes(32).toString("base64url")}`);
console.log(
  toEnvLine(
    "LICENSE_SIGNING_PRIVATE_KEY",
    privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  ),
);
console.log(
  toEnvLine(
    "LICENSE_SIGNING_PUBLIC_KEY",
    publicKey.export({ type: "spki", format: "pem" }).toString(),
  ),
);
