"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  className = "btn btn-accent",
  pendingLabel,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={cn(className)}
      disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
