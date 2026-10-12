import { missingEnvVars } from "@/lib/env";

/**
 * A non-intrusive banner that appears only when the Supabase connection is not
 * configured. It prevents "mysterious crashes" by telling the developer exactly
 * which variables are missing.
 */
export function ConfigNotice() {
  const missing = missingEnvVars();
  if (missing.length === 0) return null;

  return (
    <div
      role="alert"
      className="border-b border-warning/40 bg-warning/10 px-4 py-2.5 text-center text-xs text-warning"
    >
      <strong>Configurazione incompleta.</strong>{" "}
      Il database non è connesso: mancano {missing.join(", ")}. Copia{" "}
      <code>.env.example</code> in <code>.env.local</code>, inserisci le
      credenziali Supabase e riavvia il server. Il sito mostra contenuti di
      esempio finché il database non è collegato.
    </div>
  );
}
