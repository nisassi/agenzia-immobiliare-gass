"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOrThrow } from "@/lib/auth";
import type { InquiryStatus } from "@/lib/types";

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/admin/richieste");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function deleteInquiry(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const { supabase } = await requireAdminOrThrow();
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/admin/richieste");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}
