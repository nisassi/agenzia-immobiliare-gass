"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env, isSupabaseConfigured } from "@/lib/env";
import { loginSchema, parseFormData } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Supabase non è configurato. Imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY prima di accedere.",
    };
  }

  const parsed = parseFormData(loginSchema, formData);
  if (!parsed.ok) {
    return { status: "error", message: "Controlla i campi.", errors: parsed.errors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Servizio temporaneamente non disponibile." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: "Email o password non corretti.",
    };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Supabase non è configurato." };
  }
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { status: "error", message: "Inserisci la tua email." };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Servizio temporaneamente non disponibile." };
  }
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.siteUrl}/admin/reset-password`,
  });
  // Always report success so we don't leak which emails exist.
  return {
    status: "success",
    message:
      "Se l'indirizzo è registrato, riceverai un'email con le istruzioni per reimpostare la password.",
  };
}

export async function updatePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Supabase non è configurato." };
  }
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) {
    return { status: "error", message: "La password deve avere almeno 8 caratteri." };
  }
  if (password !== confirm) {
    return { status: "error", message: "Le password non coincidono." };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Servizio temporaneamente non disponibile." };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { status: "error", message: "Impossibile aggiornare la password. Riprova." };
  }
  redirect("/admin");
}
