"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error";
interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  notify: (tone: ToastTone, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (tone: ToastTone, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, tone, message }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border bg-surface p-3.5 text-sm shadow-lg",
              toast.tone === "success" ? "border-line-strong" : "border-danger/40",
            )}
          >
            {toast.tone === "success" ? (
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
            <p className="flex-1 text-ink-soft">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded p-0.5 text-muted hover:text-ink"
              aria-label="Chiudi notifica"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
