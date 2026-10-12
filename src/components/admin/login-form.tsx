"use client";

import { useActionState, useState } from "react";
import {
  signIn,
  requestPasswordReset,
} from "@/app/admin/login/actions";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";
import { IDLE_STATE } from "@/lib/action-state";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

function Message({
  status,
  message,
}: {
  status: "idle" | "success" | "error";
  message?: string;
}) {
  if (status === "idle" || !message) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-md border p-3 text-sm"
      style={{
        borderColor:
          status === "success"
            ? "color-mix(in srgb, var(--color-positive) 45%, white)"
            : "color-mix(in srgb, var(--color-danger) 45%, white)",
        backgroundColor:
          status === "success"
            ? "color-mix(in srgb, var(--color-positive) 10%, white)"
            : "color-mix(in srgb, var(--color-danger) 10%, white)",
      }}
    >
      {status === "success" ? (
        <CheckCircle2
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: "var(--color-positive)" }}
          aria-hidden
        />
      ) : (
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: "var(--color-danger)" }}
          aria-hidden
        />
      )}
      <p className="text-ink-soft">{message}</p>
    </div>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(signIn, IDLE_STATE);
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetState, resetAction] = useActionState(
    requestPasswordReset,
    IDLE_STATE,
  );

  if (mode === "reset") {
    return (
      <form action={resetAction} className="space-y-4" noValidate>
        <p className="text-sm text-muted">
          Inserisci la tua email: riceverai un link per reimpostare la password.
        </p>
        <Field label="Email" htmlFor="reset-email" required>
          <input
            id="reset-email"
            name="email"
            type="email"
            className="field"
            required
            autoComplete="email"
          />
        </Field>
        <Message status={resetState.status} message={resetState.message} />
        <div className="flex items-center gap-3">
          <SubmitButton pendingLabel="Invio…">Invia link</SubmitButton>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setMode("login")}
          >
            Torna al login
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="Email" htmlFor="email" required error={state.errors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          className="field"
          required
          autoComplete="email"
          aria-invalid={Boolean(state.errors?.email)}
        />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        required
        error={state.errors?.password}
      >
        <input
          id="password"
          name="password"
          type="password"
          className="field"
          required
          autoComplete="current-password"
          aria-invalid={Boolean(state.errors?.password)}
        />
      </Field>

      <Message status={state.status} message={state.message} />

      <SubmitButton
        pendingLabel="Accesso in corso…"
        className="btn btn-accent w-full"
      >
        Accedi
      </SubmitButton>

      <button
        type="button"
        className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline"
        onClick={() => setMode("reset")}
      >
        Password dimenticata?
      </button>
    </form>
  );
}
