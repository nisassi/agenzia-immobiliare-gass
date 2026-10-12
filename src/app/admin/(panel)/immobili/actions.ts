"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminOrThrow } from "@/lib/auth";
import { formDataToObject, propertySchema, slugSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { slugExists } from "@/lib/admin-queries";
import type { ActionState } from "@/lib/action-state";
import type { PropertyStatus } from "@/lib/types";

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const clean = slugSchema.safeParse(base).success ? base : slugify(base) || "immobile";
  let candidate = clean;
  let counter = 2;
  while (await slugExists(candidate, excludeId)) {
    candidate = `${clean}-${counter}`;
    counter += 1;
    if (counter > 200) break;
  }
  return candidate;
}

function revalidateProperty(slug?: string) {
  revalidatePath("/");
  revalidatePath("/immobili");
  if (slug) revalidatePath(`/immobili/${slug}`);
  revalidatePath("/admin/immobili");
}

export async function createProperty(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let supabase;
  let user;
  try {
    ({ supabase, user } = await requireAdminOrThrow());
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  const raw = formDataToObject(formData);
  if (!raw.slug || String(raw.slug).trim() === "") {
    raw.slug = slugify(String(raw.title ?? ""));
  }
  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "error", message: "Controlla i campi evidenziati.", errors };
  }

  const slug = await ensureUniqueSlug(parsed.data.slug);
  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...parsed.data,
      slug,
      created_by: user.id,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    return { status: "error", message: `Salvataggio non riuscito: ${error?.message ?? "errore"}` };
  }

  revalidateProperty(data.slug as string);
  redirect(`/admin/immobili/${data.id}`);
}

export async function updateProperty(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let supabase;
  try {
    ({ supabase } = await requireAdminOrThrow());
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Immobile non valido." };

  const raw = formDataToObject(formData);
  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "error", message: "Controlla i campi evidenziati.", errors };
  }

  const slug = await ensureUniqueSlug(parsed.data.slug, id);
  const { error } = await supabase
    .from("properties")
    .update({ ...parsed.data, slug })
    .eq("id", id);

  if (error) {
    return { status: "error", message: `Salvataggio non riuscito: ${error.message}` };
  }

  revalidateProperty(slug);
  return { status: "success", message: "Modifiche salvate." };
}

export async function setPropertyStatus(
  id: string,
  status: PropertyStatus,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { data, error } = await supabase
      .from("properties")
      .update({ status })
      .eq("id", id)
      .select("slug")
      .single();
    if (error) return { ok: false, message: error.message };
    revalidateProperty(data?.slug as string | undefined);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function toggleFeatured(
  id: string,
  next: boolean,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { error } = await supabase
      .from("properties")
      .update({ is_featured: next })
      .eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidateProperty();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function deleteProperty(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();

    // Collect storage paths so we don't leave orphaned files behind.
    const { data: property } = await supabase
      .from("properties")
      .select("cover_image_path, video_path, property_images(path)")
      .eq("id", id)
      .maybeSingle();

    const paths: string[] = [];
    if (property) {
      const record = property as {
        cover_image_path: string | null;
        video_path: string | null;
        property_images: Array<{ path: string | null }> | null;
      };
      if (record.cover_image_path) paths.push(record.cover_image_path);
      if (record.video_path) paths.push(record.video_path);
      for (const image of record.property_images ?? []) {
        if (image.path) paths.push(image.path);
      }
    }

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };

    if (paths.length > 0) {
      const { env } = await import("@/lib/env");
      await supabase.storage.from(env.storageBucket).remove(paths);
    }

    revalidateProperty();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function duplicateProperty(
  id: string,
): Promise<{ ok: boolean; id?: string; message?: string }> {
  try {
    const { supabase, user } = await requireAdminOrThrow();
    const { data: source, error: readError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (readError || !source) {
      return { ok: false, message: "Immobile non trovato." };
    }

    const record = source as Record<string, unknown>;
    const baseSlug = `${record.slug as string}-copia`;
    const slug = await ensureUniqueSlug(baseSlug);

    const {
      id: _id,
      created_at: _created,
      updated_at: _updated,
      published_at: _published,
      ...rest
    } = record;
    void _id;
    void _created;
    void _updated;
    void _published;

    const { data: inserted, error: insertError } = await supabase
      .from("properties")
      .insert({
        ...rest,
        slug,
        title: `${record.title as string} (copia)`,
        status: "draft",
        is_featured: false,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return { ok: false, message: insertError?.message ?? "Duplicazione non riuscita." };
    }

    // Copy gallery image references (the underlying files are shared, so we do
    // not delete them when one copy removes its reference).
    const { data: images } = await supabase
      .from("property_images")
      .select("url, path, alt, sort_order")
      .eq("property_id", id);
    if (images && images.length > 0) {
      await supabase.from("property_images").insert(
        images.map((image) => ({ ...image, property_id: inserted.id })),
      );
    }

    revalidateProperty();
    return { ok: true, id: inserted.id };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}
