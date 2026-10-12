"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import {
  createService,
  updateService,
} from "@/app/admin/(panel)/servizi/actions";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";
import { useToast } from "@/components/toast";
import { IDLE_STATE } from "@/lib/action-state";
import type { Service } from "@/lib/types";

const ICON_OPTIONS = [
  { value: "", label: "Nessuna icona" },
  { value: "home", label: "Casa" },
  { value: "key", label: "Chiave" },
  { value: "calculator", label: "Calcolatrice" },
  { value: "compass", label: "Bussola" },
  { value: "handshake", label: "Accordo" },
  { value: "sparkles", label: "Dettagli" },
  { value: "building", label: "Edificio" },
  { value: "document", label: "Documento" },
];

export function ServiceForm({ service }: { service?: Service }) {
  const isEdit = Boolean(service);
  const [state, action] = useActionState(
    isEdit ? updateService : createService,
    IDLE_STATE,
  );
  const { notify } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.status === "success" && state.message) {
      notify("success", state.message);
      if (!isEdit) formRef.current?.reset();
      router.refresh();
    }
  }, [state, notify, router, isEdit]);

  return (
    <form ref={formRef} action={action} className="space-y-4" noValidate>
      {isEdit ? <input type="hidden" name="id" value={service!.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titolo" htmlFor={`title-${service?.id ?? "new"}`} required error={errors.title}>
          <input
            id={`title-${service?.id ?? "new"}`}
            name="title"
            className="field"
            defaultValue={service?.title ?? ""}
            required
            maxLength={160}
          />
        </Field>
        <Field label="Icona" htmlFor={`icon-${service?.id ?? "new"}`}>
          <select
            id={`icon-${service?.id ?? "new"}`}
            name="icon"
            className="field"
            defaultValue={service?.icon ?? ""}
          >
            {ICON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Descrizione" htmlFor={`description-${service?.id ?? "new"}`} error={errors.description}>
        <textarea
          id={`description-${service?.id ?? "new"}`}
          name="description"
          rows={3}
          className="field resize-y"
          defaultValue={service?.description ?? ""}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Immagine (URL)"
          htmlFor={`image-${service?.id ?? "new"}`}
          error={errors.image_url}
          hint="Facoltativa. Incolla il link a un'immagine."
        >
          <input
            id={`image-${service?.id ?? "new"}`}
            name="image_url"
            className="field"
            placeholder="https://…"
            defaultValue={service?.image_url ?? ""}
          />
        </Field>
        <Field label="Ordine" htmlFor={`order-${service?.id ?? "new"}`} error={errors.sort_order}>
          <input
            id={`order-${service?.id ?? "new"}`}
            name="sort_order"
            inputMode="numeric"
            className="field"
            defaultValue={service?.sort_order ?? 0}
          />
        </Field>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="is_published"
          className="h-4 w-4"
          defaultChecked={service?.is_published ?? true}
        />
        Visibile sul sito
      </label>

      <SubmitButton pendingLabel="Salvataggio…" className="btn btn-accent">
        <Save className="h-4 w-4" aria-hidden />
        {isEdit ? "Salva servizio" : "Aggiungi servizio"}
      </SubmitButton>
    </form>
  );
}
