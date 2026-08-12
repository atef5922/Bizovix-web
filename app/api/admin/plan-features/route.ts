import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { getStaffSession } from "@/src/server/auth/session";
import { getDb } from "@/src/server/db/client";
import { planFeatures } from "@/src/server/db/schema";
import { isDatabaseConfigured } from "@/src/server/env";

export const dynamic = "force-dynamic";

/** Current feature selection for one plan, used by the inline feature editor. */
export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ enabledIds: [] });
  }

  const planId = new URL(request.url).searchParams.get("planId");
  if (!planId) {
    return NextResponse.json({ error: "planId is required" }, { status: 400 });
  }

  const rows = await getDb()
    .select({ featureId: planFeatures.featureId })
    .from(planFeatures)
    .where(and(eq(planFeatures.planId, planId), eq(planFeatures.enabled, true)));

  return NextResponse.json({ enabledIds: rows.map((row) => row.featureId) });
}
