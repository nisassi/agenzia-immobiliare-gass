"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOrThrow } from "@/lib/auth";
import { env } from "@/lib/env";

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/immobili");
}

export async function registerImage(input: {
  propertyId: string;
  url: string;
  path: string;
  alt?: string;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();

    const { data: last } = await supabase
      .from("property_images")
      .select("sort_order")
      .eq("property_id", input.propertyId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (last?.sort_order ?? -1) + 1;

    const { error: insertError } = await supabase
      .from("property_images")
      .insert({
        property_id: input.propertyId,
        url: input.url,
        path: input.path,
        alt: input.alt ?? null,
        sort_order: nextOrder,
      });
    if (insertError) return { ok: false, message: insertError.message };

    // First image becomes the cover automatically.
    const { data: property } = await supabase
      .from("properties")
      .select("cover_image_url")
      .eq("id", input.propertyId)
      .maybeSingle();
    if (!property?.cover_image_url) {
      await supabase
        .from("properties")
        .update({ cover_image_url: input.url, cover_image_path: input.path })
        .eq("id", input.propertyId);
    }

    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function setCoverImage(
  propertyId: string,
  imageId: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { data: image, error } = await supabase
      .from("property_images")
      .select("url, path")
      .eq("id", imageId)
      .eq("property_id", propertyId)
      .maybeSingle();
    if (error || !image) return { ok: false, message: "Immagine non trovata." };

    const { error: updateError } = await supabase
      .from("properties")
      .update({ cover_image_url: image.url, cover_image_path: image.path })
      .eq("id", propertyId);
    if (updateError) return { ok: false, message: updateError.message };

    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function moveImage(
  imageId: string,
  direction: "up" | "down",
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { data: current } = await supabase
      .from("property_images")
      .select("id, property_id, sort_order")
      .eq("id", imageId)
      .maybeSingle();
    if (!current) return { ok: false, message: "Immagine non trovata." };

    const { data: siblings } = await supabase
      .from("property_images")
      .select("id, sort_order")
      .eq("property_id", current.property_id)
      .order("sort_order", { ascending: true });
    if (!siblings) return { ok: false, message: "Errore di ordinamento." };

    const index = siblings.findIndex((item) => item.id === imageId);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= siblings.length) return { ok: true };

    const other = siblings[swapIndex];
    // Use temporary values to avoid unique-ordering collisions if any exist.
    await supabase
      .from("property_images")
      .update({ sort_order: other.sort_order })
      .eq("id", current.id);
    await supabase
      .from("property_images")
      .update({ sort_order: current.sort_order })
      .eq("id", other.id);

    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function deleteImage(
  imageId: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { data: image } = await supabase
      .from("property_images")
      .select("id, property_id, url, path")
      .eq("id", imageId)
      .maybeSingle();
    if (!image) return { ok: false, message: "Immagine non trovata." };

    const { error } = await supabase
      .from("property_images")
      .delete()
      .eq("id", imageId);
    if (error) return { ok: false, message: error.message };

    // Remove the file only if no other row references the same path.
    if (image.path) {
      const { count } = await supabase
        .from("property_images")
        .select("*", { count: "exact", head: true })
        .eq("path", image.path);
      const { data: property } = await supabase
        .from("properties")
        .select("cover_image_path")
        .eq("id", image.property_id)
        .maybeSingle();
      const referencedAsCover = property?.cover_image_path === image.path;
      if ((count ?? 0) === 0 && !referencedAsCover) {
        await supabase.storage.from(env.storageBucket).remove([image.path]);
      }
    }

    // Reassign cover if we just deleted it.
    const { data: property } = await supabase
      .from("properties")
      .select("cover_image_url")
      .eq("id", image.property_id)
      .maybeSingle();
    if (property?.cover_image_url === image.url) {
      const { data: remaining } = await supabase
        .from("property_images")
        .select("url, path")
        .eq("property_id", image.property_id)
        .order("sort_order", { ascending: true })
        .limit(1);
      const next = remaining?.[0] ?? null;
      await supabase
        .from("properties")
        .update({
          cover_image_url: next?.url ?? null,
          cover_image_path: next?.path ?? null,
        })
        .eq("id", image.property_id);
    }

    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function setVideo(
  propertyId: string,
  video: { url: string; path: string | null },
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { error } = await supabase
      .from("properties")
      .update({ video_url: video.url, video_path: video.path })
      .eq("id", propertyId);
    if (error) return { ok: false, message: error.message };
    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function clearVideo(
  propertyId: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { data: property } = await supabase
      .from("properties")
      .select("video_path")
      .eq("id", propertyId)
      .maybeSingle();
    const { error } = await supabase
      .from("properties")
      .update({ video_url: null, video_path: null })
      .eq("id", propertyId);
    if (error) return { ok: false, message: error.message };
    if (property?.video_path) {
      await supabase.storage.from(env.storageBucket).remove([property.video_path]);
    }
    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}
