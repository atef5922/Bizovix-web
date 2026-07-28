import { wait } from "@/src/lib/utils";
import type { ServiceResponse } from "./service-response";

export async function submitContact<T extends Record<string, unknown>>(payload: T): Promise<ServiceResponse<T>> {
  await wait();
  // TODO: Replace with NEXT_PUBLIC_CONTACT_API_URL integration when the backend is ready.
  if (!payload.email) return { ok: false, error: "Email is required." };
  return { ok: true, data: payload };
}
