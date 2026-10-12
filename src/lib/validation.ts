import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const trimmed = (max: number) => z.string().trim().max(max);
const optionalString = (max = 2000) =>
  z
    .union([trimmed(max), z.literal("")])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

/** Accepts empty values and locale decimal separators. */
const numericNullable = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const parsed = Number(String(value).replace(/\s/g, "").replace(",", "."));
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().nullable());

const positiveNumeric = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const parsed = Number(String(value).replace(/\s/g, "").replace(",", "."));
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().min(0).nullable());

const integer = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const parsed = Number(String(value).trim());
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().int().min(0).nullable());

const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

const amenities = z.preprocess(
  (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  },
  z.array(z.string().max(80)).max(60),
);

const hexColor = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Colore esadecimale non valido");

const optionalUrl = z
  .union([trimmed(500), z.literal("")])
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .refine(
    (v) => v === null || v === undefined || /^(https?:)?\/\//.test(v) || v.startsWith("/"),
    "URL non valido",
  );

/* -------------------------------------------------------------------------- */
/*  Property                                                                   */
/* -------------------------------------------------------------------------- */

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug troppo corto")
  .max(120, "Slug troppo lungo")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Usa solo lettere minuscole, numeri e trattini",
  );

export const propertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, "Il titolo è troppo corto")
    .max(200, "Il titolo è troppo lungo"),
  slug: slugSchema,
  short_description: optionalString(320),
  description: optionalString(20000),
  transaction_type: z.enum(["sale", "rent"]),
  property_type: optionalString(120),
  price: positiveNumeric,
  currency: z.string().trim().min(3).max(3).default("EUR"),
  city: optionalString(120),
  province: optionalString(120),
  neighborhood: optionalString(120),
  address: optionalString(240),
  is_address_public: checkbox,
  living_area: positiveNumeric,
  land_area: positiveNumeric,
  rooms: integer,
  bedrooms: integer,
  bathrooms: integer,
  floor: optionalString(60),
  year_built: numericNullable.refine(
    (v) => v === null || (v >= 1500 && v <= 2100),
    "Anno non valido",
  ),
  energy_rating: optionalString(20),
  amenities,
  video_url: optionalUrl,
  is_featured: checkbox,
  status: z.enum(["draft", "published", "archived"]),
  seo_title: optionalString(200),
  seo_description: optionalString(320),
});

export type PropertyInput = z.infer<typeof propertySchema>;

/* -------------------------------------------------------------------------- */
/*  Site settings                                                              */
/* -------------------------------------------------------------------------- */

export const settingsSchema = z.object({
  agency_name: z.string().trim().min(1, "Il nome è obbligatorio").max(120),
  tagline: optionalString(200),
  accent_color: hexColor,
  accent_color_dark: hexColor,
  hero_eyebrow: optionalString(120),
  hero_headline: z.string().trim().min(1, "Il titolo è obbligatorio").max(200),
  hero_subheadline: optionalString(400),
  hero_primary_label: z.string().trim().min(1).max(60),
  hero_primary_href: z.string().trim().min(1).max(200),
  hero_secondary_label: optionalString(60),
  hero_secondary_href: optionalString(200),
  intro_title: optionalString(200),
  intro_body: optionalString(4000),
  about_title: optionalString(200),
  about_body: optionalString(12000),
  services_title: optionalString(200),
  services_subtitle: optionalString(400),
  contact_title: optionalString(200),
  contact_intro: optionalString(2000),
  contact_email: optionalString(200),
  contact_phone: optionalString(60),
  contact_address: optionalString(300),
  opening_hours: optionalString(300),
  social_facebook: optionalUrl,
  social_instagram: optionalUrl,
  social_linkedin: optionalUrl,
  social_youtube: optionalUrl,
  footer_note: optionalString(400),
  seo_default_title: z.string().trim().min(1).max(200),
  seo_default_description: optionalString(320),
  seo_keywords: optionalString(300),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

export const serviceSchema = z.object({
  title: z.string().trim().min(2, "Titolo troppo corto").max(160),
  description: optionalString(4000),
  icon: optionalString(60),
  image_url: optionalUrl,
  sort_order: integer,
  is_published: checkbox,
});

export type ServiceInput = z.infer<typeof serviceSchema>;

/* -------------------------------------------------------------------------- */
/*  Public forms                                                               */
/* -------------------------------------------------------------------------- */

const honeypot = z
  .string()
  .max(0, "Richiesta rifiutata")
  .optional()
  .default("");

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Inserisci il tuo nome").max(120),
  email: z.email("Inserisci un indirizzo email valido").max(200),
  phone: optionalString(60),
  message: z
    .string()
    .trim()
    .min(10, "Il messaggio è troppo corto")
    .max(4000),
  property_id: optionalString(60),
  source_page: optionalString(200),
  // Honeypot: must stay empty.
  company: honeypot,
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const valuationSchema = z.object({
  name: z.string().trim().min(2, "Inserisci il tuo nome").max(120),
  email: z.email("Inserisci un indirizzo email valido").max(200),
  phone: optionalString(60),
  message: optionalString(4000),
  valuation_address: z
    .string()
    .trim()
    .min(3, "Inserisci l'indirizzo dell'immobile")
    .max(300),
  valuation_property_type: optionalString(120),
  valuation_size: positiveNumeric,
  valuation_timeframe: optionalString(120),
  source_page: optionalString(200),
  company: honeypot,
});

export type ValuationInput = z.infer<typeof valuationSchema>;

/* -------------------------------------------------------------------------- */
/*  Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: z.email("Inserisci un indirizzo email valido"),
  password: z.string().min(6, "La password è troppo corta"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/* -------------------------------------------------------------------------- */
/*  FormData parsing                                                           */
/* -------------------------------------------------------------------------- */

export type FieldErrors = Record<string, string>;

export function formDataToObject(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Files are handled separately by the media manager.
      continue;
    }
    if (key in result) {
      const existing = result[key];
      result[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      result[key] = value;
    }
  }
  return result;
}

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldErrors };

export function parseFormData<S extends z.ZodTypeAny>(
  schema: S,
  formData: FormData,
): ParseResult<z.infer<S>> {
  const raw = formDataToObject(formData);
  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
