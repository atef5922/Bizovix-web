"use client";

import { Loader2, Lock, ShieldCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { customerLoginAction, staffLoginAction, type AuthFormState } from "@/src/server/actions/auth.actions";

const INITIAL: AuthFormState = { error: null };

function LoginSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="primary" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="spin" /> Signing in...
        </>
      ) : (
        label
      )}
    </button>
  );
}

function LoginShell({
  title,
  subtitle,
  configured,
  action,
  state,
  footer,
}: {
  title: string;
  subtitle: string;
  configured: boolean;
  action: (formData: FormData) => void;
  state: AuthFormState;
  footer: React.ReactNode;
}) {
  return (
    <div className="workspace-auth">
      <div className="workspace-auth-card">
        <div className="workspace-auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/bizovix-logo-nav.png" alt="Bizovix" />
        </div>
        <div className="workspace-auth-head">
          <span>
            <ShieldCheck />
          </span>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        {!configured ? (
          <div className="auth-alert">
            <TriangleAlert />
            <p>
              <strong>Database not configured</strong>
              <span>Set DATABASE_URL in .env.local, then run the migration and seed scripts.</span>
            </p>
          </div>
        ) : null}

        <form action={action}>
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@bizovix.com"
              disabled={!configured}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              disabled={!configured}
            />
          </label>

          {state.error ? (
            <p className="form-error" role="alert">
              {state.error}
            </p>
          ) : null}

          <LoginSubmit label="Sign in" />
        </form>

        <div className="workspace-auth-foot">
          <Lock />
          {footer}
        </div>
      </div>
    </div>
  );
}

export function StaffLoginForm({
  configured,
  title,
  subtitle,
}: {
  configured: boolean;
  title: string;
  subtitle: string;
}) {
  const [state, formAction] = useActionState(staffLoginAction, INITIAL);
  return (
    <LoginShell
      title={title}
      subtitle={subtitle}
      configured={configured}
      action={formAction}
      state={state}
      footer={
        <span>
          Staff access only. <Link href="/">Back to website</Link>
        </span>
      }
    />
  );
}

export function CustomerLoginForm({ configured }: { configured: boolean }) {
  const [state, formAction] = useActionState(customerLoginAction, INITIAL);
  return (
    <LoginShell
      title="Customer Portal"
      subtitle="Manage your Bizovix subscription"
      configured={configured}
      action={formAction}
      state={state}
      footer={
        <span>
          Need access? Contact your account manager. <Link href="/">Back to website</Link>
        </span>
      }
    />
  );
}
