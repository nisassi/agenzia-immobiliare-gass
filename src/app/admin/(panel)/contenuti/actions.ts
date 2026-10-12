"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOrThrow } from "@/lib/auth";
import { formDataToObject, settingsSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

const BRANDING_FIELDS = {
  logo: { url: "logo_url", path: "logo_path" },
  hero: { url: "hero_image_url", path: "hero_image_path" },
  intro: { url: "intro_image_url", path: null },
  about: { url: "about_image_url", path: null },
} as const;

type BrandingKind = keyof typeof BRANDING_FIELDS;

function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/chi-siamo");
  revalidatePath("/servizi");
  revalidatePath("/contatti");
}

export async function updateSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let supabase;
  try {
    ({ supabase } = await requireAdminOrThrow());
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  const raw = formDataToObject(formData);
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "error", message: "Controlla i campi evidenziati.", errors };
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...parsed.data }, { onConflict: "id" });

  if (error) {
    return { status: "error", message: `Salvataggio non riuscito: ${error.message}` };
  }

  revalidateSite();
  return { status: "success", message: "Contenuti aggiornati." };
}

export async function updateBranding(input: {
  kind: BrandingKind;
  url: string;
  path: string | null;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    if (!(input.kind in BRANDING_FIELDS)) {
      return { ok: false, message: "Tipo di immagine non valido." };
    }
    if (!/^https?:\/\//.test(input.url)) {
      return { ok: false, message: "URL immagine non valido." };
    }
    const mapping = BRANDING_FIELDS[input.kind];
    const update: Record<string, string | null> = { [mapping.url]: input.url };
    if (mapping.path) update[mapping.path] = input.path;

    const { error } = await supabase
      .from("site_settings")
      .update(update)
      .eq("id", 1);
    if (error) return { ok: false, message: error.message };

    revalidateSite();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function clearBranding(
  kind: BrandingKind,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const mapping = BRANDING_FIELDS[kind];
    if (!mapping) return { ok: false, message: "Tipo non valido." };

    // Remove the file if we track its path.
    if (mapping.path) {
      const { data: current } = await supabase
        .from("site_settings")
        .select(mapping.path)
        .eq("id", 1)
        .maybeSingle();
      const path = (current as Record<string, string | null> | null)?.[mapping.path];
      if (path) {
        const { env } = await import("@/lib/env");
        await supabase.storage.from(env.storageBucket).remove([path]);
      }
    }

    const update: Record<string, string | null> = { [mapping.url]: null };
    if (mapping.path) update[mapping.path] = null;
    const { error } = await supabase
      .from("site_settings")
      .update(update)
      .eq("id", 1);
    if (error) return { ok: false, message: error.message };

    revalidateSite();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}
