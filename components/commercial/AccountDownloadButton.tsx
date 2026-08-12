"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { trackAccountDownloadAction } from "@/src/server/actions/account.actions";
import { IDLE_STATE } from "@/src/server/actions/action-state";
import { useWorkspaceToast } from "./WorkspaceToast";

/**
 * Records the download event, then navigates to the installer. The file itself
 * is served statically — it is never streamed through the app.
 */
export function AccountDownloadButton({
  version,
  href,
  fileName,
}: {
  version: string;
  href: string;
  fileName: string;
}) {
  const [busy, setBusy] = useState(false);
  const { pushToast } = useWorkspaceToast();

  async function start() {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("version", version);
      const result = await trackAccountDownloadAction(IDLE_STATE, formData);
      if (!result.ok && result.error) pushToast("error", result.error);
    } catch {
      // Tracking is best-effort — never block the customer's download over it.
    } finally {
      setBusy(false);
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  return (
    <button type="button" className="primary download-cta" onClick={start} disabled={busy}>
      {busy ? <Loader2 className="spin" /> : <Download />}
      {busy ? "Preparing" : "Download for Windows"}
    </button>
  );
}
