"use client";

import { useState } from "react";

import { IDLE_STATE } from "@/src/server/actions/action-state";
import { replaceDeviceAction } from "@/src/server/actions/licensing.actions";
import { SubmitButton } from "./ActionControls";
import { useWorkspaceToast } from "./WorkspaceToast";

/**
 * Replacement needs the new machine's name, so it opens a small inline prompt
 * instead of firing straight away like the other row actions.
 */
export function DeviceReplaceButton({
  deviceId,
  deviceName,
}: {
  deviceId: string;
  deviceName: string;
}) {
  const [open, setOpen] = useState(false);
  const { pushToast } = useWorkspaceToast();

  async function submit(formData: FormData) {
    const result = await replaceDeviceAction(IDLE_STATE, formData);
    if (result.ok) {
      if (result.message) pushToast("ok", result.message);
      setOpen(false);
    } else if (result.error) {
      pushToast("error", result.error);
    }
  }

  if (!open) {
    return (
      <button type="button" className="row-action tone-default" onClick={() => setOpen(true)}>
        <span>Replace</span>
      </button>
    );
  }

  return (
    <form action={submit} className="inline-replace">
      <input type="hidden" name="id" value={deviceId} />
      <input
        name="deviceName"
        required
        autoFocus
        placeholder={`Replacement for ${deviceName}`}
        aria-label="Replacement device name"
      />
      <SubmitButton className="row-action tone-primary" pendingLabel="…">
        <span>Confirm</span>
      </SubmitButton>
      <button type="button" className="row-action tone-default" onClick={() => setOpen(false)}>
        <span>Cancel</span>
      </button>
    </form>
  );
}
