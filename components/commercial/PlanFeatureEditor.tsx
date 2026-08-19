"use client";

import { useEffect, useState } from "react";

import { IDLE_STATE } from "@/src/server/actions/action-state";
import { setPlanFeaturesAction } from "@/src/server/actions/catalog.actions";
import { SubmitButton } from "./ActionControls";
import { useWorkspaceToast } from "./WorkspaceToast";

type FeatureOption = { id: string; name: string; moduleKey: string | null };

/**
 * Feature toggles for one plan. Submits the full selection, so unchecking a box
 * removes the entitlement rather than leaving a stale row behind.
 */
export function PlanFeatureEditor({
  planId,
  planName,
  features,
}: {
  planId: string;
  planName: string;
  features: FeatureOption[];
}) {
  const [open, setOpen] = useState(false);
  const [enabledIds, setEnabledIds] = useState<string[] | null>(null);
  const { pushToast } = useWorkspaceToast();

  // The plan's current selection is fetched on open rather than shipped with
  // every table row — only one plan is edited at a time.
  useEffect(() => {
    if (!open || enabledIds !== null) return;

    const controller = new AbortController();
    fetch(`/api/admin/plan-features?planId=${encodeURIComponent(planId)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Load failed"))))
      .then((data: { enabledIds: string[] }) => setEnabledIds(data.enabledIds))
      .catch((error: Error) => {
        if (error.name === "AbortError") return;
        pushToast("error", "Could not load this plan's features.");
        setOpen(false);
      });

    return () => controller.abort();
  }, [open, enabledIds, planId, pushToast]);

  async function submit(formData: FormData) {
    const result = await setPlanFeaturesAction(IDLE_STATE, formData);
    if (result.ok) {
      if (result.message) pushToast("ok", result.message);
      // Drop the cache so reopening reflects what was just saved.
      setEnabledIds(null);
      setOpen(false);
    } else if (result.error) {
      pushToast("error", result.error);
    }
  }

  if (!open) {
    return (
      <button type="button" className="row-action tone-default" onClick={() => setOpen(true)}>
        <span>Features</span>
      </button>
    );
  }

  return (
    <div className="feature-editor" role="dialog" aria-label={`Features for ${planName}`}>
      <div className="feature-editor-head">
        <strong>{planName} features</strong>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      {enabledIds === null ? (
        <p className="feature-editor-loading">Loading…</p>
      ) : (
        <form action={submit}>
          <input type="hidden" name="planId" value={planId} />
          <div className="feature-editor-list">
            {features.map((feature) => (
              <label key={feature.id}>
                <input
                  type="checkbox"
                  name="featureIds"
                  value={feature.id}
                  defaultChecked={enabledIds.includes(feature.id)}
                />
                <span>
                  {feature.name}
                  {feature.moduleKey ? <small>{feature.moduleKey}</small> : null}
                </span>
              </label>
            ))}
          </div>
          <SubmitButton className="primary" pendingLabel="Saving...">
            Save features
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
