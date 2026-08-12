// Imported from the dependency-free error module, not from `guard`: this file
// is pulled into client bundles, and `guard` reaches the database layer.
import { AuthorizationError } from "@/src/server/auth/errors";

/**
 * Shared shape for every admin mutation. Actions never throw at the UI: they
 * return a state the form renders, so a failed permission check or a duplicate
 * key shows an inline message instead of Next.js's error overlay.
 *
 * Note this module has no "use server" directive on purpose — a server-action
 * file may only export async functions, and these are types and helpers.
 */
export type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
  /** Set once, shown once — currently only the plaintext license key. */
  revealOnce?: string;
};

export const IDLE_STATE: ActionState = { ok: false };

export function actionOk(message: string, revealOnce?: string): ActionState {
  return { ok: true, message, revealOnce };
}

export function actionError(error: string): ActionState {
  return { ok: false, error };
}

/** Postgres error shape we care about for friendly messages. */
type PgError = { code?: string; constraint_name?: string; detail?: string };

export function toActionError(error: unknown): ActionState {
  if (error instanceof AuthorizationError) {
    return actionError(error.message);
  }

  const pg = error as PgError;
  if (pg?.code === "23505") {
    // unique_violation — surface the field rather than a raw constraint name.
    const constraint = pg.constraint_name ?? "";
    if (constraint.includes("email")) return actionError("That email address is already in use.");
    if (constraint.includes("company_code")) return actionError("That company code already exists.");
    if (constraint.includes("code")) return actionError("That code is already in use.");
    if (constraint.includes("version")) return actionError("That version already exists.");
    if (constraint.includes("device")) return actionError("That device is already registered to this license.");
    return actionError("A record with those details already exists.");
  }
  if (pg?.code === "23503") {
    return actionError("That change references a record that no longer exists.");
  }

  if (error instanceof Error) {
    console.error("[action]", error);
    return actionError(error.message);
  }

  console.error("[action] unknown error", error);
  return actionError("Something went wrong. Please try again.");
}

/* -------------------------------------------------------------------------- */
/* FormData parsing                                                            */
/* -------------------------------------------------------------------------- */

export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function optionalStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value.length > 0 ? value : null;
}

export function num(formData: FormData, key: string, fallback: number): number {
  const parsed = Number(str(formData, key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function date(formData: FormData, key: string): Date | null {
  const value = str(formData, key);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
