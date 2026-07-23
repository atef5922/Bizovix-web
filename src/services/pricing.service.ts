import { pricingPlans } from "@/src/data/pricing";
import { wait } from "@/src/lib/utils";

export async function fetchPricingPlans() {
  await wait(250);
  return { ok: true as const, data: pricingPlans };
}
