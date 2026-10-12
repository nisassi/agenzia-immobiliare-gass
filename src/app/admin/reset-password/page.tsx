"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePassword } from "@/app/admin/login/actions";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";
import { IDLE_STATE } from "@/lib/action-state";

export default function ResetPasswordPage() {
  const [state, action] = useActionState(updatePassword, IDLE_STATE);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl">Nuova password</h1>
          <p className="mt-1 mb-6 text-sm text-muted">
            Scegli una nuova password per il tuo account.
          </p>

          <form action={action} className="space-y-4" noValidate>
            <Field label="Nuova password" htmlFor="password" required>
              <input
                id="password"
                name="password"
                type="password"
                className="field"
                required
                autoComplete="new-password"
                minLength={8}
              />
            </Field>
            <Field label="Conferma password" htmlFor="confirm" required>
              <input
                id="confirm"
                name="confirm"
                type="password"
                className="field"
                required
                autoComplete="new-password"
                minLength={8}
              />
            </Field>

            {state.status !== "idle" && state.message ? (
              <p
                role="status"
                className="rounded-md border p-3 text-sm"
                style={{
                  borderColor:
                    state.status === "success"
                      ? "color-mix(in srgb, var(--color-positive) 45%, white)"
                      : "color-mix(in srgb, var(--color-danger) 45%, white)",
                }}
              >
                {state.message}
              </p>
            ) : null}

            <SubmitButton
              pendingLabel="Aggiornamento…"
              className="btn btn-accent w-full"
            >
              Aggiorna password
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            <Link href="/admin/login" className="hover:text-ink">
              ← Torna al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
