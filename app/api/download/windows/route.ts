import { NextResponse } from "next/server";

import { getCustomerSession } from "@/src/server/auth/session";
import { isDatabaseConfigured } from "@/src/server/env";
import { getLatestRelease, recordDownloadEvent } from "@/src/server/services/downloads";
import { siteConfig } from "@/src/config/site";

export const dynamic = "force-dynamic";

/** Fallback if no release row exists yet, so the link never dead-ends. */
const FALLBACK_PATH = siteConfig.erpDownloadFallbackPath;

/**
 * Tracking redirect for the installer.
 *
 * Records a DownloadEvent then 302s to the real file — the binary is never
 * streamed through the app. Tracking is strictly best-effort: a database
 * problem must never stop a customer downloading the software, so every
 * failure path still ends in the redirect.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  // The published installer is an old build; the next release isn't ready
  // yet. Send anyone hitting this route directly (bypassing the disabled
  // buttons) to the download page instead of the stale file.
  if (!siteConfig.erpDownloadEnabled) {
    return NextResponse.redirect(new URL("/download", url.origin), {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const source = url.searchParams.get("source") ?? "public_website";

  let target = FALLBACK_PATH;

  if (isDatabaseConfigured()) {
    try {
      const [release, session] = await Promise.all([getLatestRelease(), getCustomerSession()]);
      if (release?.downloadPath) target = release.downloadPath;
      else if (release?.fileName) target = `/software/${release.fileName}`;

      await recordDownloadEvent({
        platform: "windows",
        appVersion: release?.version ?? null,
        source: session ? "account_portal" : source,
        companyId: session?.company.id ?? null,
      });
    } catch (error) {
      console.error("[download] tracking failed, serving file anyway", error);
    }
  }

  return NextResponse.redirect(new URL(target, url.origin), {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
