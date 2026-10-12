import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isCurrentUserAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getSiteSettings } from "@/lib/queries";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Accesso amministrazione",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const configMissing = params.config === "missing" || !isSupabaseConfigured;

  const { user } = await getCurrentUser();
  if (user && (await isCurrentUserAdmin())) {
    redirect("/admin");
  }

  const settings = await getSiteSettings();

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(120% 120% at 20% 0%, color-mix(in srgb, var(--accent) 18%, #faf8f5) 0%, #faf8f5 55%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-display text-2xl text-ink hover:text-accent-dark"
          >
            {settings.agency_name}
          </Link>
          <p className="mt-2 text-sm text-muted">Area riservata</p>
        </div>

        <div className="card p-6 sm:p-8">
          {configMissing ? (
            <div
              role="alert"
              className="mb-6 rounded-md border p-4 text-sm"
              style={{
                borderColor: "color-mix(in srgb, var(--color-warning) 45%, white)",
                backgroundColor:
                  "color-mix(in srgb, var(--color-warning) 10%, white)",
              }}
            >
              <p className="font-medium">Database non configurato</p>
              <p className="mt-1 text-muted">
                Copia <code>.env.example</code> in <code>.env.local</code>,
                inserisci <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, quindi riavvia il
                server. Consulta il README per la configurazione completa.
              </p>
            </div>
          ) : null}

          <h1 className="text-2xl">Accedi</h1>
          <p className="mt-1 mb-6 text-sm text-muted">
            Accedi con le credenziali di amministrazione.
          </p>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-ink">
            ← Torna al sito
          </Link>
        </p>
      </div>
    </div>
  );
}
