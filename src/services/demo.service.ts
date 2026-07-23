import { wait } from "@/src/lib/utils";

export type ServiceResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export async function submitDemoRequest<T extends Record<string, unknown>>(payload: T): Promise<ServiceResponse<T>> {
  await wait();
  // TODO: Replace with NEXT_PUBLIC_DEMO_API_URL integration when the backend is ready.
  if (!payload.email && !payload.workEmail) return { ok: false, error: "A work email is required." };
  return { ok: true, data: payload };
}
