import type { SiteSettings } from "@/lib/types";

/**
 * Sensible defaults used when a settings row has not been saved yet, or when a
 * field is left empty. These are intentionally generic: no invented awards,
 * history or claims. The agency owner replaces them from the dashboard.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  agency_name: "Agenzia Immobiliare",
  tagline: "Immobili selezionati in Italia",
  logo_url: null,
  logo_path: null,
  accent_color: "#8A6A45",
  accent_color_dark: "#6B5236",
  hero_eyebrow: "Immobili selezionati",
  hero_headline: "Spazi che meritano di essere raccontati",
  hero_subheadline:
    "Un servizio immobiliare curato, trasparente e attento al dettaglio, per accompagnarti in ogni fase della compravendita o dell'affitto.",
  hero_image_url: null,
  hero_image_path: null,
  hero_primary_label: "Sfoglia gli immobili",
  hero_primary_href: "/immobili",
  hero_secondary_label: "Richiedi una valutazione",
  hero_secondary_href: "/contatti#valutazione",
  intro_title: "Un approccio su misura",
  intro_body:
    "Seguiamo ogni incarico con attenzione, dalla prima consulenza alla firma. Questo testo è un contenuto di esempio: personalizzalo dal pannello di amministrazione con la descrizione della tua agenzia.",
  intro_image_url: null,
  about_title: "Chi siamo",
  about_body:
    "Questa è una pagina di esempio. Racconta qui la storia della tua agenzia, il team e i valori che guidano il tuo lavoro. Evita di inserire qualifiche o riconoscimenti non verificabili finché non sono confermati.",
  about_image_url: null,
  services_title: "I nostri servizi",
  services_subtitle:
    "Dalla vendita alla locazione, fino alla valutazione: un supporto completo e trasparente.",
  contact_title: "Contattaci",
  contact_intro:
    "Scrivici per informazioni su un immobile o per richiedere una valutazione. Ti risponderemo il prima possibile.",
  contact_email: null,
  contact_phone: null,
  contact_address: null,
  opening_hours: null,
  social_facebook: null,
  social_instagram: null,
  social_linkedin: null,
  social_youtube: null,
  footer_note:
    "Sito dimostrativo. I contenuti sono di esempio e vanno sostituiti con i dati reali dell'agenzia prima della pubblicazione.",
  seo_default_title: "Agenzia Immobiliare — Immobili in vendita e in affitto",
  seo_default_description:
    "Consulta gli immobili in vendita e in affitto e contatta l'agenzia per informazioni o per una valutazione.",
  seo_keywords: null,
  updated_at: new Date(0).toISOString(),
};

/** Merge a partial settings row over the defaults. */
export function withSettingsDefaults(
  row: Partial<SiteSettings> | null | undefined,
): SiteSettings {
  if (!row) return DEFAULT_SETTINGS;
  const merged = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const [key, value] of Object.entries(row)) {
    if (value !== null && value !== undefined && value !== "") {
      merged[key] = value;
    }
  }
  return merged as unknown as SiteSettings;
}
