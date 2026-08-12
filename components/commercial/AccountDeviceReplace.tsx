"use client";

import { useState } from "react";

import { IDLE_STATE } from "@/src/server/actions/action-state";
import { selfReplaceDeviceAction } from "@/src/server/actions/account.actions";
import { SubmitButton } from "./ActionControls";
import { useWorkspaceToast } from "./WorkspaceToast";

/** Customer-facing device replacement; asks for the new computer's name. */
export function AccountDeviceReplace({
  deviceId,
  deviceName,
  disabled,
}: {
  deviceId: string;
  deviceName: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { pushToast } = useWorkspaceToast();

  async function submit(formData: FormData) {
    const result = await selfReplaceDeviceAction(IDLE_STATE, formData);
    if (result.ok) {
      if (result.message) pushToast("ok", result.message);
      setOpen(false);
    } else if (result.error) {
      pushToast("error", result.error);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="row-action tone-default"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? "Self-service limit reached — contact support." : "Replace this computer"}
      >
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
        placeholder={`New computer replacing ${deviceName}`}
        aria-label="Replacement computer name"
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
