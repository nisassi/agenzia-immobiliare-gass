"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOrThrow } from "@/lib/auth";
import { formDataToObject, serviceSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

function revalidateServices() {
  revalidatePath("/");
  revalidatePath("/servizi");
  revalidatePath("/admin/servizi");
}

export async function createService(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let supabase;
  try {
    ({ supabase } = await requireAdminOrThrow());
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  const parsed = serviceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".") || "form"] = issue.message;
    }
    return { status: "error", message: "Controlla i campi.", errors };
  }

  const { error } = await supabase
    .from("services")
    .insert({ ...parsed.data, sort_order: parsed.data.sort_order ?? 0 });
  if (error) return { status: "error", message: error.message };

  revalidateServices();
  return { status: "success", message: "Servizio creato." };
}

export async function updateService(
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
  if (!id) return { status: "error", message: "Servizio non valido." };

  const parsed = serviceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".") || "form"] = issue.message;
    }
    return { status: "error", message: "Controlla i campi.", errors };
  }

  const { error } = await supabase
    .from("services")
    .update({ ...parsed.data, sort_order: parsed.data.sort_order ?? 0 })
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidateServices();
  return { status: "success", message: "Servizio aggiornato." };
}

export async function deleteService(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidateServices();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}
