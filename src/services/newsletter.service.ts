import { wait } from "@/src/lib/utils";
import type { ServiceResponse } from "./service-response";

export async function subscribeNewsletter<T extends Record<string, unknown>>(payload: T): Promise<ServiceResponse<T>> {
  await wait(400);
  // TODO: Replace with newsletter provider integration when ready.
  if (!payload.email) return { ok: false, error: "Email is required." };
  return { ok: true, data: payload };
}
