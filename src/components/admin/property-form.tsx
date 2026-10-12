"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import {
  createProperty,
  updateProperty,
} from "@/app/admin/(panel)/immobili/actions";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";
import { useToast } from "@/components/toast";
import { IDLE_STATE } from "@/lib/action-state";
import { slugify } from "@/lib/utils";
import type { Property } from "@/lib/types";

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function PropertyForm({ property }: { property?: Property }) {
  const isEdit = Boolean(property);
  const [state, action] = useActionState(
    isEdit ? updateProperty : createProperty,
    IDLE_STATE,
  );
  const { notify } = useToast();
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(Boolean(property?.slug));

  useEffect(() => {
    if (state.status === "success" && state.message) {
      notify("success", state.message);
      router.refresh();
    }
  }, [state, notify, router]);

  const errors = state.errors ?? {};

  function syncSlug() {
    if (slugTouched.current || !slugRef.current) return;
    slugRef.current.value = slugify(titleRef.current?.value ?? "");
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      {property ? <input type="hidden" name="id" value={property.id} /> : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-md border p-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--color-danger) 45%, white)",
            backgroundColor: "color-mix(in srgb, var(--color-danger) 8%, white)",
          }}
        >
          {state.message}
        </p>
      ) : null}

      <FormSection
        title="Informazioni principali"
        description="Titolo, descrizioni e tipologia dell'immobile."
      >
        <Field
          label="Titolo annuncio"
          htmlFor="title"
          required
          error={errors.title}
          className="sm:col-span-2"
        >
          <input
            ref={titleRef}
            id="title"
            name="title"
            className="field"
            defaultValue={property?.title ?? ""}
            required
            maxLength={200}
            onBlur={syncSlug}
            aria-invalid={Boolean(errors.title)}
          />
        </Field>

        <Field
          label="Slug (URL)"
          htmlFor="slug"
          error={errors.slug}
          hint="Identificatore dell'URL. Modificandolo cambiano i link pubblici: usalo con attenzione."
          className="sm:col-span-2"
        >
          <input
            ref={slugRef}
            id="slug"
            name="slug"
            className="field font-mono text-sm"
            defaultValue={property?.slug ?? ""}
            placeholder="es. appartamento-centro-storico"
            onChange={() => {
              slugTouched.current = true;
            }}
            aria-invalid={Boolean(errors.slug)}
          />
        </Field>

        <Field label="Contratto" htmlFor="transaction_type" required>
          <select
            id="transaction_type"
            name="transaction_type"
            className="field"
            defaultValue={property?.transaction_type ?? "sale"}
          >
            <option value="sale">Vendita</option>
            <option value="rent">Affitto</option>
          </select>
        </Field>

        <Field label="Tipologia immobile" htmlFor="property_type">
          <input
            id="property_type"
            name="property_type"
            className="field"
            defaultValue={property?.property_type ?? ""}
            placeholder="Appartamento, Villa, Terreno…"
          />
        </Field>

        <Field
          label="Descrizione breve"
          htmlFor="short_description"
          error={errors.short_description}
          className="sm:col-span-2"
          hint="Massimo 320 caratteri. Usata nelle schede e nei risultati di ricerca."
        >
          <textarea
            id="short_description"
            name="short_description"
            rows={2}
            className="field resize-y"
            defaultValue={property?.short_description ?? ""}
            maxLength={320}
          />
        </Field>

        <Field
          label="Descrizione completa"
          htmlFor="description"
          error={errors.description}
          className="sm:col-span-2"
        >
          <textarea
            id="description"
            name="description"
            rows={8}
            className="field resize-y"
            defaultValue={property?.description ?? ""}
          />
        </Field>
      </FormSection>

      <FormSection title="Prezzo">
        <Field label="Prezzo (€)" htmlFor="price" error={errors.price}>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            className="field"
            defaultValue={property?.price ?? ""}
            placeholder="es. 250000"
            aria-invalid={Boolean(errors.price)}
          />
        </Field>
        <Field
          label="Valuta"
          htmlFor="currency"
          error={errors.currency}
          hint="Codice ISO a 3 lettere (EUR)."
        >
          <input
            id="currency"
            name="currency"
            className="field"
            defaultValue={property?.currency ?? "EUR"}
            maxLength={3}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Posizione"
        description="L'indirizzo esatto è privato per impostazione predefinita."
      >
        <Field label="Città" htmlFor="city">
          <input
            id="city"
            name="city"
            className="field"
            defaultValue={property?.city ?? ""}
          />
        </Field>
        <Field label="Provincia" htmlFor="province">
          <input
            id="province"
            name="province"
            className="field"
            defaultValue={property?.province ?? ""}
          />
        </Field>
        <Field label="Zona / quartiere" htmlFor="neighborhood">
          <input
            id="neighborhood"
            name="neighborhood"
            className="field"
            defaultValue={property?.neighborhood ?? ""}
          />
        </Field>
        <Field label="Indirizzo" htmlFor="address">
          <input
            id="address"
            name="address"
            className="field"
            defaultValue={property?.address ?? ""}
          />
        </Field>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="is_address_public"
              className="mt-1 h-4 w-4"
              defaultChecked={property?.is_address_public ?? false}
            />
            <span>
              Mostra l&apos;indirizzo esatto nella pagina pubblica
              <span className="mt-0.5 block text-xs text-muted">
                Se non selezionato, l&apos;indirizzo resta interno e non compare
                sul sito.
              </span>
            </span>
          </label>
        </div>
      </FormSection>

      <FormSection
        title="Caratteristiche"
        description="Compila solo i campi pertinenti alla tipologia di immobile."
      >
        <Field label="Superficie (m²)" htmlFor="living_area" error={errors.living_area}>
          <input
            id="living_area"
            name="living_area"
            inputMode="decimal"
            className="field"
            defaultValue={property?.living_area ?? ""}
          />
        </Field>
        <Field label="Superficie terreno (m²)" htmlFor="land_area" error={errors.land_area}>
          <input
            id="land_area"
            name="land_area"
            inputMode="decimal"
            className="field"
            defaultValue={property?.land_area ?? ""}
          />
        </Field>
        <Field label="Locali" htmlFor="rooms" error={errors.rooms}>
          <input
            id="rooms"
            name="rooms"
            inputMode="numeric"
            className="field"
            defaultValue={property?.rooms ?? ""}
          />
        </Field>
        <Field label="Camere" htmlFor="bedrooms" error={errors.bedrooms}>
          <input
            id="bedrooms"
            name="bedrooms"
            inputMode="numeric"
            className="field"
            defaultValue={property?.bedrooms ?? ""}
          />
        </Field>
        <Field label="Bagni" htmlFor="bathrooms" error={errors.bathrooms}>
          <input
            id="bathrooms"
            name="bathrooms"
            inputMode="numeric"
            className="field"
            defaultValue={property?.bathrooms ?? ""}
          />
        </Field>
        <Field label="Piano" htmlFor="floor">
          <input
            id="floor"
            name="floor"
            className="field"
            defaultValue={property?.floor ?? ""}
          />
        </Field>
        <Field label="Anno di costruzione" htmlFor="year_built" error={errors.year_built}>
          <input
            id="year_built"
            name="year_built"
            inputMode="numeric"
            className="field"
            defaultValue={property?.year_built ?? ""}
          />
        </Field>
        <Field label="Classe energetica" htmlFor="energy_rating">
          <input
            id="energy_rating"
            name="energy_rating"
            className="field"
            defaultValue={property?.energy_rating ?? ""}
            placeholder="A4, B, …"
          />
        </Field>
        <Field
          label="Caratteristiche / dotazioni"
          htmlFor="amenities"
          className="sm:col-span-2"
          hint="Separa ogni voce con una virgola o vai a capo."
        >
          <textarea
            id="amenities"
            name="amenities"
            rows={3}
            className="field resize-y"
            defaultValue={property?.amenities?.join(", ") ?? ""}
            placeholder="Balcone, Ascensore, Giardino…"
          />
        </Field>
      </FormSection>

      <FormSection title="Video">
        <Field
          label="Link video esterno"
          htmlFor="video_url"
          error={errors.video_url}
          className="sm:col-span-2"
          hint="YouTube, Vimeo o un file .mp4/.webm. Per caricare un file, usa il gestore media dopo aver salvato."
        >
          <input
            id="video_url"
            name="video_url"
            className="field"
            defaultValue={property?.video_url ?? ""}
            placeholder="https://…"
            aria-invalid={Boolean(errors.video_url)}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Pubblicazione e SEO"
        description="Controlla la visibilità e i metadati per i motori di ricerca."
      >
        <Field label="Stato" htmlFor="status">
          <select
            id="status"
            name="status"
            className="field"
            defaultValue={property?.status ?? "draft"}
          >
            <option value="draft">Bozza (non pubblico)</option>
            <option value="published">Pubblicato</option>
            <option value="archived">Archiviato</option>
          </select>
        </Field>
        <div className="flex items-end">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="is_featured"
              className="h-4 w-4"
              defaultChecked={property?.is_featured ?? false}
            />
            Metti in evidenza in homepage
          </label>
        </div>
        <Field label="Titolo SEO" htmlFor="seo_title" error={errors.seo_title}>
          <input
            id="seo_title"
            name="seo_title"
            className="field"
            defaultValue={property?.seo_title ?? ""}
            maxLength={200}
          />
        </Field>
        <Field
          label="Descrizione SEO"
          htmlFor="seo_description"
          error={errors.seo_description}
        >
          <input
            id="seo_description"
            name="seo_description"
            className="field"
            defaultValue={property?.seo_description ?? ""}
            maxLength={320}
          />
        </Field>
      </FormSection>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <SubmitButton pendingLabel="Salvataggio…">
          <Save className="h-4 w-4" aria-hidden />
          {isEdit ? "Salva modifiche" : "Crea immobile"}
        </SubmitButton>
      </div>
    </form>
  );
}
