import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-accent"> *</span> : null}
        </label>
      ) : null}
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 className="text-3xl sm:text-4xl leading-tight">{title}</h2>
      {description ? (
        <p className="mt-4 text-muted leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-10 w-10 rounded-full border border-line-strong"
        style={{ backgroundColor: "var(--color-accent-soft)" }}
      />
      <h3 className="text-xl">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    published: "var(--color-positive)",
    draft: "var(--color-warning)",
    archived: "var(--color-muted)",
    new: "var(--accent)",
    in_progress: "var(--color-warning)",
    handled: "var(--color-positive)",
  };
  const label: Record<string, string> = {
    published: "Pubblicato",
    draft: "Bozza",
    archived: "Archiviato",
    new: "Nuova",
    in_progress: "In lavorazione",
    handled: "Gestita",
  };
  const color = palette[status] ?? "var(--color-muted)";
  return (
    <span
      className="badge"
      style={{ color, borderColor: "currentColor" }}
    >
      {label[status] ?? status}
    </span>
  );
}

export function KeyValue({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-line py-3 first:border-t-0 first:pt-0">
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
