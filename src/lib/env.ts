/**
 * Centralised environment access.
 *
 * Everything here is read from `process.env` on the server. Only the
 * `NEXT_PUBLIC_*` values are ever exposed to the browser by Next.js.
 *
 * The application is designed to *render* even when Supabase is not yet
 * configured, so that the marketing shell is visible and the missing
 * configuration is reported clearly instead of crashing.
 */

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";

/**
 * Public base URL used for metadata, sitemap and canonical URLs.
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL (explicit, recommended in production)
 *   2. Vercel's stable production domain (VERCEL_PROJECT_PRODUCTION_URL)
 *   3. Vercel's per-deployment URL (VERCEL_URL)
 *   4. http://localhost:3000
 *
 * Vercel injects the last two automatically, so preview/production deploys are
 * correct even before the explicit variable is configured.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`.replace(/\/+$/, "");

  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return `https://${deployment}`.replace(/\/+$/, "");

  return "http://localhost:3000";
}

/** Supabase publishes both legacy `anon` keys and new `sb_publishable_…` keys. */
const rawAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  // Support the newer key name without breaking the documented one.
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

export const env = {
  supabaseUrl: rawUrl.replace(/\/+$/, ""),
  supabaseAnonKey: rawAnonKey,
  storageBucket:
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "property-media",
  maxImageUploadBytes: Number(
    process.env.NEXT_PUBLIC_MAX_IMAGE_UPLOAD_BYTES ?? 10485760,
  ),
  maxVideoUploadBytes: Number(
    process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_BYTES ?? 52428800,
  ),
  siteUrl: resolveSiteUrl(),
  resendApiKey: process.env.RESEND_API_KEY?.trim() || "",
  inquiryNotificationEmail: process.env.INQUIRY_NOTIFICATION_EMAIL?.trim() || "",
  inquiryFromEmail: process.env.INQUIRY_FROM_EMAIL?.trim() || "",
} as const;

/** True when a Supabase project has been connected. */
export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);

export const isEmailConfigured = Boolean(
  env.resendApiKey && env.inquiryNotificationEmail && env.inquiryFromEmail,
);

/**
 * Human readable description of what is missing, used by setup screens.
 * Returns an empty array when everything required is present.
 */
export function missingEnvVars(): string[] {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return missing;
}
