/**
 * Deliberately dependency-free.
 *
 * `action-state.ts` needs this class and is imported by client components, so
 * it must not reach anything that touches `next/headers` or the database —
 * doing so drags the Postgres driver into the browser bundle.
 */
export class AuthorizationError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}
