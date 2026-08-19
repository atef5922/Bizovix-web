"use client";

import { Download, Loader2, RefreshCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { useWorkspaceToast } from "./WorkspaceToast";

export function DashboardActions() {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [exporting, setExporting] = useState(false);
  const { pushToast } = useWorkspaceToast();

  async function exportReport() {
    setExporting(true);
    try {
      const response = await fetch("/api/admin/export?type=dashboard");
      if (!response.ok) throw new Error(`Export failed (${response.status})`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bizovix-commercial-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      pushToast("ok", "Report downloaded.");
    } catch (error) {
      pushToast("error", error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => startRefresh(() => router.refresh())} disabled={isRefreshing}>
        {isRefreshing ? <Loader2 className="spin" /> : <RefreshCw />}
        {isRefreshing ? "Refreshing" : "Refresh"}
      </button>
      <button type="button" className="primary" onClick={exportReport} disabled={exporting}>
        {exporting ? <Loader2 className="spin" /> : <Download />}
        {exporting ? "Preparing" : "Export report"}
      </button>
    </>
  );
}

/** Period selector for the revenue panel; drives the `months` search param. */
export function RevenuePeriodSelect({ value }: { value: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      aria-label="Revenue period"
      value={String(value)}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        if (event.target.value === "12") params.delete("months");
        else params.set("months", event.target.value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }}
    >
      <option value="12">Last 12 months</option>
      <option value="6">Last 6 months</option>
      <option value="3">Last 3 months</option>
    </select>
  );
}
