"use client";

import { Database, Plus, X } from "lucide-react";
import { useRef, useState } from "react";

import { IDLE_STATE, type ActionState } from "@/src/server/actions/action-state";
import { RevealOnce, SubmitButton } from "./ActionControls";
import { useWorkspaceToast } from "./WorkspaceToast";

export type FieldSpec =
  | {
      kind: "text" | "email" | "tel" | "number" | "date" | "password" | "textarea";
      name: string;
      label: string;
      required?: boolean;
      placeholder?: string;
      defaultValue?: string;
      min?: string;
      step?: string;
      hint?: string;
      full?: boolean;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
      required?: boolean;
      defaultValue?: string;
      hint?: string;
      full?: boolean;
    }
  | {
      kind: "checkbox";
      name: string;
      label: string;
      defaultChecked?: boolean;
      hint?: string;
      full?: boolean;
    };

type ServerAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function FieldControl({ field }: { field: FieldSpec }) {
  if (field.kind === "checkbox") {
    return (
      <label className={`field-checkbox ${field.full ? "full" : ""}`}>
        <input type="checkbox" name={field.name} defaultChecked={field.defaultChecked} />
        <span>
          {field.label}
          {field.hint ? <small>{field.hint}</small> : null}
        </span>
      </label>
    );
  }

  if (field.kind === "select") {
    return (
      <label className={field.full ? "full" : ""}>
        <span>
          {field.label}
          {field.required ? <i aria-hidden="true">*</i> : null}
        </span>
        <select name={field.name} required={field.required} defaultValue={field.defaultValue ?? ""}>
          <option value="" disabled={field.required}>
            Select…
          </option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {field.hint ? <small className="field-hint">{field.hint}</small> : null}
      </label>
    );
  }

  return (
    <label className={field.full ? "full" : ""}>
      <span>
        {field.label}
        {field.required ? <i aria-hidden="true">*</i> : null}
      </span>
      {field.kind === "textarea" ? (
        <textarea
          name={field.name}
          required={field.required}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          rows={3}
        />
      ) : (
        <input
          type={field.kind}
          name={field.name}
          required={field.required}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          min={field.min}
          step={field.step}
        />
      )}
      {field.hint ? <small className="field-hint">{field.hint}</small> : null}
    </label>
  );
}

/**
 * The "Add new" affordance used by every section. Collapsed to a button until
 * opened, so a list page still leads with its data rather than a large form.
 */
export function CreateRecordPanel({
  title,
  description,
  triggerLabel = "Add new",
  submitLabel,
  fields,
  action,
  note,
  hiddenFields,
}: {
  title: string;
  description?: string;
  triggerLabel?: string;
  submitLabel: string;
  fields: FieldSpec[];
  action: ServerAction;
  note?: string;
  hiddenFields?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="primary" onClick={() => setOpen(true)}>
        <Plus /> {triggerLabel}
      </button>
    );
  }

  return (
    <RecordFormPanel
      title={title}
      description={description}
      submitLabel={submitLabel}
      fields={fields}
      action={action}
      note={note}
      hiddenFields={hiddenFields}
      onClose={() => setOpen(false)}
    />
  );
}

export function RecordFormPanel({
  title,
  description,
  submitLabel,
  fields,
  action,
  note,
  hiddenFields,
  onClose,
}: {
  title: string;
  description?: string;
  submitLabel: string;
  fields: FieldSpec[];
  action: ServerAction;
  note?: string;
  hiddenFields?: Record<string, string>;
  onClose?: () => void;
}) {
  const [state, setState] = useState<ActionState>(IDLE_STATE);
  const { pushToast } = useWorkspaceToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Handled in the action itself rather than an effect on `useActionState`,
  // so the reset/close happens in an event context without a cascading render.
  async function submit(formData: FormData) {
    const result = await action(IDLE_STATE, formData);
    setState(result);

    if (result.ok) {
      if (result.message) pushToast("ok", result.message);
      formRef.current?.reset();
      // A revealed one-time secret must stay on screen until dismissed.
      if (!result.revealOnce) onClose?.();
    } else if (result.error) {
      pushToast("error", result.error);
    }
  }

  return (
    <section className="workspace-panel create-panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close form">
            <X />
          </button>
        ) : null}
      </div>

      <form ref={formRef} action={submit}>
        {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

        <div className="form-grid record-form">
          {fields.map((field) => (
            <FieldControl key={field.name} field={field} />
          ))}
        </div>

        {note ? (
          <div className="form-note">
            <Database />
            <p>
              <strong>Server-side only</strong>
              <span>{note}</span>
            </p>
          </div>
        ) : null}

        {state.revealOnce ? <RevealOnce value={state.revealOnce} /> : null}
        {state.error ? <p className="form-error">{state.error}</p> : null}

        <div className="form-actions">
          <SubmitButton className="primary" pendingLabel="Saving...">
            {submitLabel}
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
