"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { submitInquiry, submitValuation } from "@/app/(site)/actions";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";
import { IDLE_STATE } from "@/lib/action-state";

function FormMessage({
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

/** Hidden honeypot field. Bots fill it; humans never see it. */
function Honeypot() {
  return (
    <div className="absolute h-0 w-0 overflow-hidden" aria-hidden>
      <label htmlFor="company">Azienda</label>
      <input
        id="company"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

export function InquiryForm({
  propertyId,
  sourcePage,
  context,
}: {
  propertyId?: string;
  sourcePage: string;
  context?: string;
}) {
  const [state, action] = useActionState(submitInquiry, IDLE_STATE);
  const errors = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div className="card p-6">
        <CheckCircle2
          className="h-6 w-6"
          style={{ color: "var(--color-positive)" }}
          aria-hidden
        />
        <h3 className="mt-3 text-xl">Richiesta inviata</h3>
        <p className="mt-2 text-sm text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="relative space-y-4" noValidate>
      <Honeypot />
      {propertyId ? (
        <input type="hidden" name="property_id" value={propertyId} />
      ) : null}
      <input type="hidden" name="source_page" value={sourcePage} />

      {context ? (
        <p className="text-sm text-muted">{context}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome e cognome" htmlFor="name" required error={errors.name}>
          <input
            id="name"
            name="name"
            className="field"
            required
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            className="field"
            required
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
      </div>

      <Field label="Telefono" htmlFor="phone" error={errors.phone} hint="Facoltativo">
        <input
          id="phone"
          name="phone"
          type="tel"
          className="field"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
        />
      </Field>

      <Field label="Messaggio" htmlFor="message" required error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="field resize-y"
          required
          aria-invalid={Boolean(errors.message)}
        />
      </Field>

      <FormMessage status={state.status} message={state.message} />

      <SubmitButton pendingLabel="Invio in corso…" className="btn btn-accent w-full sm:w-auto">
        Invia richiesta
      </SubmitButton>
    </form>
  );
}

export function ValuationForm({ sourcePage }: { sourcePage: string }) {
  const [state, action] = useActionState(submitValuation, IDLE_STATE);
  const errors = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div className="card p-6">
        <CheckCircle2
          className="h-6 w-6"
          style={{ color: "var(--color-positive)" }}
          aria-hidden
        />
        <h3 className="mt-3 text-xl">Richiesta ricevuta</h3>
        <p className="mt-2 text-sm text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="relative space-y-4" noValidate>
      <Honeypot />
      <input type="hidden" name="source_page" value={sourcePage} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome e cognome" htmlFor="v-name" required error={errors.name}>
          <input
            id="v-name"
            name="name"
            className="field"
            required
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Field label="Email" htmlFor="v-email" required error={errors.email}>
          <input
            id="v-email"
            name="email"
            type="email"
            className="field"
            required
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Telefono" htmlFor="v-phone" error={errors.phone}>
          <input
            id="v-phone"
            name="phone"
            type="tel"
            className="field"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>
        <Field
          label="Indirizzo dell'immobile"
          htmlFor="v-address"
          required
          error={errors.valuation_address}
        >
          <input
            id="v-address"
            name="valuation_address"
            className="field"
            required
            aria-invalid={Boolean(errors.valuation_address)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Tipologia"
          htmlFor="v-type"
          error={errors.valuation_property_type}
        >
          <input
            id="v-type"
            name="valuation_property_type"
            className="field"
            placeholder="Appartamento, villa…"
          />
        </Field>
        <Field
          label="Superficie (m²)"
          htmlFor="v-size"
          error={errors.valuation_size}
        >
          <input
            id="v-size"
            name="valuation_size"
            inputMode="decimal"
            className="field"
            aria-invalid={Boolean(errors.valuation_size)}
          />
        </Field>
        <Field
          label="Tempistica"
          htmlFor="v-timeframe"
          error={errors.valuation_timeframe}
        >
          <input
            id="v-timeframe"
            name="valuation_timeframe"
            className="field"
            placeholder="Es. entro 3 mesi"
          />
        </Field>
      </div>

      <Field label="Note" htmlFor="v-message" error={errors.message}>
        <textarea
          id="v-message"
          name="message"
          rows={4}
          className="field resize-y"
          aria-invalid={Boolean(errors.message)}
        />
      </Field>

      <FormMessage status={state.status} message={state.message} />

      <SubmitButton
        pendingLabel="Invio in corso…"
        className="btn btn-accent w-full sm:w-auto"
      >
        Richiedi la valutazione
      </SubmitButton>
    </form>
  );
}
