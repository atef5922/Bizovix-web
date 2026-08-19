"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { IDLE_STATE, type ActionState } from "@/src/server/actions/action-state";
import { useWorkspaceToast } from "./WorkspaceToast";

type ServerAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

/* -------------------------------------------------------------------------- */
/* Submit button                                                               */
/* -------------------------------------------------------------------------- */

export function SubmitButton({
  children,
  className,
  pendingLabel,
  disabled,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} title={title}>
      {pending ? (
        <>
          <Loader2 className="spin" /> {pendingLabel ?? "Working..."}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Row action — one button that posts a single mutation                        */
/* -------------------------------------------------------------------------- */

/**
 * Results are handled inside the form action rather than in a `useEffect` on
 * `useActionState`: the action already runs in an event context, so toasting
 * and closing there avoids the cascading re-render an effect would cause.
 */
export function RowAction({
  action,
  fields,
  label,
  icon,
  confirm,
  tone = "default",
  disabled,
  disabledReason,
}: {
  action: ServerAction;
  fields: Record<string, string>;
  label: string;
  icon?: React.ReactNode;
  /** When set, the click must be confirmed before the action is submitted. */
  confirm?: string;
  tone?: "default" | "danger" | "primary";
  disabled?: boolean;
  disabledReason?: string;
}) {
  const { pushToast } = useWorkspaceToast();
  // A row action can return a one-time secret (licence reissue mints a new
  // key). It must be shown in a modal, not a toast: toasts auto-dismiss, and
  // losing this value means the customer is locked out with no way to recover.
  const [revealed, setRevealed] = useState<{ value: string; message?: string } | null>(null);

  async function submit(formData: FormData) {
    const result = await action(IDLE_STATE, formData);
    if (result.ok) {
      if (result.revealOnce) {
        setRevealed({ value: result.revealOnce, message: result.message });
      } else if (result.message) {
        pushToast("ok", result.message);
      }
    } else if (result.error) {
      pushToast("error", result.error);
    }
  }

  return (
    <>
      <form
        action={submit}
        onSubmit={(event) => {
          if (confirm && !window.confirm(confirm)) event.preventDefault();
        }}
      >
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <SubmitButton
          className={`row-action tone-${tone}`}
          disabled={disabled}
          title={disabled ? disabledReason : label}
          pendingLabel=""
        >
          {icon}
          <span>{label}</span>
        </SubmitButton>
      </form>

      {revealed ? (
        <div className="reveal-modal" role="dialog" aria-modal="true" aria-label="One-time secret">
          <div className="reveal-modal-card">
            {revealed.message ? <p className="reveal-modal-message">{revealed.message}</p> : null}
            <RevealOnce value={revealed.value} />
            <button type="button" className="primary" onClick={() => setRevealed(null)}>
              I have saved it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Show-once secret                                                            */
/* -------------------------------------------------------------------------- */

export function RevealOnce({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="reveal-once">
      <div>
        <strong>Copy this now — it cannot be shown again</strong>
        <code>{value}</code>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2500);
          } catch {
            // Clipboard is blocked in insecure contexts; the value is on screen
            // to copy by hand, so this is not worth interrupting the user for.
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
