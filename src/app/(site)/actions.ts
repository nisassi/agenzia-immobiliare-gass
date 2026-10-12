"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { inquirySchema, valuationSchema, parseFormData } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

/** Best-effort optional email notification. Never breaks the submission. */
async function maybeNotify(data: {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  type: string;
}) {
  const { env, isEmailConfigured } = await import("@/lib/env");
  if (!isEmailConfigured) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.inquiryFromEmail,
        to: env.inquiryNotificationEmail,
        subject: `Nuova richiesta dal sito (${data.type})`,
        text: [
          `Nome: ${data.name}`,
          `Email: ${data.email}`,
          `Telefono: ${data.phone ?? "-"}`,
          "",
          data.message ?? "",
        ].join("\n"),
      }),
      cache: "no-store",
    });
  } catch {
    // Email is optional; the inquiry is already stored in the database.
  }
}

export async function submitInquiry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Il modulo non è ancora operativo: il database non è configurato. Contatta l'agenzia via email.",
    };
  }

  const parsed = parseFormData(inquirySchema, formData);
  if (!parsed.ok) {
    return { status: "error", message: "Controlla i campi evidenziati.", errors: parsed.errors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Servizio temporaneamente non disponibile." };
  }

  const { error } = await supabase.from("inquiries").insert({
    property_id: parsed.data.property_id || null,
    type: parsed.data.property_id ? "property" : "general",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
    source_page: parsed.data.source_page,
  });

  if (error) {
    return {
      status: "error",
      message: "Invio non riuscito. Riprova o contattaci direttamente.",
    };
  }

  await maybeNotify({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
    type: parsed.data.property_id ? "property" : "general",
  });

  return {
    status: "success",
    message: "Grazie! La tua richiesta è stata inviata. Ti risponderemo al più presto.",
  };
}

export async function submitValuation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Il modulo non è ancora operativo: il database non è configurato. Contatta l'agenzia via email.",
    };
  }

  const parsed = parseFormData(valuationSchema, formData);
  if (!parsed.ok) {
    return { status: "error", message: "Controlla i campi evidenziati.", errors: parsed.errors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Servizio temporaneamente non disponibile." };
  }

  const { error } = await supabase.from("inquiries").insert({
    type: "valuation",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
    valuation_address: parsed.data.valuation_address,
    valuation_property_type: parsed.data.valuation_property_type,
    valuation_size: parsed.data.valuation_size,
    valuation_timeframe: parsed.data.valuation_timeframe,
    source_page: parsed.data.source_page,
  });

  if (error) {
    return {
      status: "error",
      message: "Invio non riuscito. Riprova o contattaci direttamente.",
    };
  }

  await maybeNotify({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: `Valutazione per ${parsed.data.valuation_address}. ${parsed.data.message ?? ""}`,
    type: "valuation",
  });

  return {
    status: "success",
    message: "Richiesta di valutazione ricevuta. Ti contatteremo per i dettagli.",
  };
}
