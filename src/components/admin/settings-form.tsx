"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateSettings } from "@/app/admin/(panel)/contenuti/actions";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";
import { ImageUploadField } from "@/components/admin/image-upload";
import { useToast } from "@/components/toast";
import { IDLE_STATE } from "@/lib/action-state";
import type { SiteSettings } from "@/lib/types";

function Section({
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
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState(updateSettings, IDLE_STATE);
  const { notify } = useToast();
  const router = useRouter();
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.status === "success" && state.message) {
      notify("success", state.message);
      router.refresh();
    }
  }, [state, notify, router]);

  return (
    <form action={action} className="space-y-6" noValidate>
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

      <Section
        title="Identità dell'agenzia"
        description="Nome, logo e colori del marchio."
      >
        <Field label="Nome agenzia" htmlFor="agency_name" required error={errors.agency_name}>
          <input
            id="agency_name"
            name="agency_name"
            className="field"
            defaultValue={settings.agency_name}
            required
          />
        </Field>
        <Field label="Sottotitolo / payoff" htmlFor="tagline" error={errors.tagline}>
          <input
            id="tagline"
            name="tagline"
            className="field"
            defaultValue={settings.tagline ?? ""}
          />
        </Field>

        <div className="sm:col-span-2">
          <ImageUploadField
            kind="logo"
            label="Logo"
            currentUrl={settings.logo_url}
            hint="Consigliato: PNG o WebP orizzontale con sfondo trasparente. Se assente viene usato il nome dell'agenzia."
            previewClassName="h-24"
          />
        </div>

        <Field
          label="Colore principale"
          htmlFor="accent_color"
          error={errors.accent_color}
          hint="Usato per pulsanti, link e accenti."
        >
          <div className="flex items-center gap-3">
            <input
              id="accent_color"
              name="accent_color"
              type="color"
              className="h-10 w-14 cursor-pointer rounded border border-line-strong bg-surface"
              defaultValue={settings.accent_color}
            />
          </div>
        </Field>
        <Field label="Colore principale (scuro)" htmlFor="accent_color_dark" error={errors.accent_color_dark}>
          <input
            id="accent_color_dark"
            name="accent_color_dark"
            type="color"
            className="h-10 w-14 cursor-pointer rounded border border-line-strong bg-surface"
            defaultValue={settings.accent_color_dark}
          />
        </Field>
      </Section>

      <Section title="Homepage — sezione principale" description="Il blocco in cima alla homepage.">
        <Field label="Sopratitolo" htmlFor="hero_eyebrow" error={errors.hero_eyebrow}>
          <input id="hero_eyebrow" name="hero_eyebrow" className="field" defaultValue={settings.hero_eyebrow ?? ""} />
        </Field>
        <Field label="Titolo principale" htmlFor="hero_headline" required error={errors.hero_headline}>
          <input id="hero_headline" name="hero_headline" className="field" defaultValue={settings.hero_headline} required />
        </Field>
        <Field label="Sottotitolo" htmlFor="hero_subheadline" error={errors.hero_subheadline} className="sm:col-span-2">
          <textarea id="hero_subheadline" name="hero_subheadline" rows={2} className="field resize-y" defaultValue={settings.hero_subheadline ?? ""} />
        </Field>

        <div className="sm:col-span-2">
          <ImageUploadField kind="hero" label="Immagine di sfondo" currentUrl={settings.hero_image_url} hint="Immagine ampia (almeno 1920px). Se assente viene usato uno sfondo elegante." />
        </div>

        <Field label="Pulsante principale — testo" htmlFor="hero_primary_label" error={errors.hero_primary_label}>
          <input id="hero_primary_label" name="hero_primary_label" className="field" defaultValue={settings.hero_primary_label} />
        </Field>
        <Field label="Pulsante principale — link" htmlFor="hero_primary_href" error={errors.hero_primary_href}>
          <input id="hero_primary_href" name="hero_primary_href" className="field" defaultValue={settings.hero_primary_href} />
        </Field>
        <Field label="Pulsante secondario — testo" htmlFor="hero_secondary_label" error={errors.hero_secondary_label}>
          <input id="hero_secondary_label" name="hero_secondary_label" className="field" defaultValue={settings.hero_secondary_label ?? ""} />
        </Field>
        <Field label="Pulsante secondario — link" htmlFor="hero_secondary_href" error={errors.hero_secondary_href}>
          <input id="hero_secondary_href" name="hero_secondary_href" className="field" defaultValue={settings.hero_secondary_href ?? ""} />
        </Field>
      </Section>

      <Section title="Presentazione e Chi siamo">
        <Field label="Titolo presentazione" htmlFor="intro_title" error={errors.intro_title}>
          <input id="intro_title" name="intro_title" className="field" defaultValue={settings.intro_title ?? ""} />
        </Field>
        <div className="sm:col-span-2">
          <ImageUploadField kind="intro" label="Immagine presentazione" currentUrl={settings.intro_image_url} />
        </div>
        <Field label="Testo presentazione" htmlFor="intro_body" error={errors.intro_body} className="sm:col-span-2">
          <textarea id="intro_body" name="intro_body" rows={4} className="field resize-y" defaultValue={settings.intro_body ?? ""} />
        </Field>
        <Field label="Titolo pagina Chi siamo" htmlFor="about_title" error={errors.about_title}>
          <input id="about_title" name="about_title" className="field" defaultValue={settings.about_title ?? ""} />
        </Field>
        <div className="sm:col-span-2">
          <ImageUploadField kind="about" label="Immagine Chi siamo" currentUrl={settings.about_image_url} />
        </div>
        <Field label="Testo pagina Chi siamo" htmlFor="about_body" error={errors.about_body} className="sm:col-span-2">
          <textarea id="about_body" name="about_body" rows={6} className="field resize-y" defaultValue={settings.about_body ?? ""} />
        </Field>
      </Section>

      <Section title="Servizi e contatti" description="Intestazione della pagina Servizi e dati di contatto.">
        <Field label="Titolo Servizi" htmlFor="services_title" error={errors.services_title}>
          <input id="services_title" name="services_title" className="field" defaultValue={settings.services_title ?? ""} />
        </Field>
        <Field label="Sottotitolo Servizi" htmlFor="services_subtitle" error={errors.services_subtitle}>
          <input id="services_subtitle" name="services_subtitle" className="field" defaultValue={settings.services_subtitle ?? ""} />
        </Field>
        <Field label="Titolo Contatti" htmlFor="contact_title" error={errors.contact_title}>
          <input id="contact_title" name="contact_title" className="field" defaultValue={settings.contact_title ?? ""} />
        </Field>
        <Field label="Introduzione Contatti" htmlFor="contact_intro" error={errors.contact_intro}>
          <input id="contact_intro" name="contact_intro" className="field" defaultValue={settings.contact_intro ?? ""} />
        </Field>
        <Field label="Email" htmlFor="contact_email" error={errors.contact_email}>
          <input id="contact_email" name="contact_email" type="email" className="field" defaultValue={settings.contact_email ?? ""} />
        </Field>
        <Field label="Telefono" htmlFor="contact_phone" error={errors.contact_phone}>
          <input id="contact_phone" name="contact_phone" className="field" defaultValue={settings.contact_phone ?? ""} />
        </Field>
        <Field label="Indirizzo" htmlFor="contact_address" error={errors.contact_address} className="sm:col-span-2">
          <input id="contact_address" name="contact_address" className="field" defaultValue={settings.contact_address ?? ""} />
        </Field>
        <Field label="Orari di apertura" htmlFor="opening_hours" error={errors.opening_hours}>
          <input id="opening_hours" name="opening_hours" className="field" defaultValue={settings.opening_hours ?? ""} />
        </Field>
      </Section>

      <Section title="Social">
        <Field label="Facebook" htmlFor="social_facebook" error={errors.social_facebook}>
          <input id="social_facebook" name="social_facebook" className="field" placeholder="https://…" defaultValue={settings.social_facebook ?? ""} />
        </Field>
        <Field label="Instagram" htmlFor="social_instagram" error={errors.social_instagram}>
          <input id="social_instagram" name="social_instagram" className="field" placeholder="https://…" defaultValue={settings.social_instagram ?? ""} />
        </Field>
        <Field label="LinkedIn" htmlFor="social_linkedin" error={errors.social_linkedin}>
          <input id="social_linkedin" name="social_linkedin" className="field" placeholder="https://…" defaultValue={settings.social_linkedin ?? ""} />
        </Field>
        <Field label="YouTube" htmlFor="social_youtube" error={errors.social_youtube}>
          <input id="social_youtube" name="social_youtube" className="field" placeholder="https://…" defaultValue={settings.social_youtube ?? ""} />
        </Field>
      </Section>

      <Section title="Piè di pagina e SEO" description="Nota a piè di pagina e metadati predefiniti.">
        <Field label="Nota piè di pagina" htmlFor="footer_note" error={errors.footer_note} className="sm:col-span-2">
          <input id="footer_note" name="footer_note" className="field" defaultValue={settings.footer_note ?? ""} />
        </Field>
        <Field label="Titolo SEO predefinito" htmlFor="seo_default_title" required error={errors.seo_default_title} className="sm:col-span-2">
          <input id="seo_default_title" name="seo_default_title" className="field" defaultValue={settings.seo_default_title} required />
        </Field>
        <Field label="Descrizione SEO predefinita" htmlFor="seo_default_description" error={errors.seo_default_description} className="sm:col-span-2">
          <textarea id="seo_default_description" name="seo_default_description" rows={2} className="field resize-y" defaultValue={settings.seo_default_description ?? ""} />
        </Field>
        <Field label="Parole chiave" htmlFor="seo_keywords" error={errors.seo_keywords} className="sm:col-span-2" hint="Separate da virgole. Uso facoltativo.">
          <input id="seo_keywords" name="seo_keywords" className="field" defaultValue={settings.seo_keywords ?? ""} />
        </Field>
      </Section>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <SubmitButton pendingLabel="Salvataggio…">
          <Save className="h-4 w-4" aria-hidden />
          Salva contenuti
        </SubmitButton>
      </div>
    </form>
  );
}
