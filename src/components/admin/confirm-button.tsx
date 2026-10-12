"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

/**
 * Accessible confirmation dialog for destructive actions.
 *
 * `onConfirm` is a Server Action (or any async function) returning
 * `{ ok, message }`. Errors are surfaced instead of silently swallowed.
 */
export function ConfirmButton({
  label,
  title,
  description,
  confirmLabel = "Conferma",
  className = "btn btn-danger btn-sm",
  icon,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel?: string;
  className?: string;
  icon?: ReactNode;
  onConfirm: () => Promise<{ ok: boolean; message?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { notify } = useToast();

  function run() {
    startTransition(async () => {
      const result = await onConfirm();
      setOpen(false);
      notify(
        result.ok ? "success" : "error",
        result.ok ? `${title}: operazione completata.` : result.message ?? "Operazione non riuscita.",
      );
    });
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {icon}
        {label}
      </button>

      {open ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="card w-full max-w-md p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <AlertTriangle
              className="h-6 w-6"
              style={{ color: "var(--color-danger)" }}
              aria-hidden
            />
            <h2 className="mt-3 text-xl">{title}</h2>
            <p className="mt-2 text-sm text-muted">{description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Annulla
              </button>
              <button
                type="button"
                className={cn("btn btn-danger", pending && "opacity-70")}
                onClick={run}
                disabled={pending}
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
