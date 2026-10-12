import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Contenuti",
  robots: { index: false, follow: false },
};

export default async function ContentSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Contenuti del sito</h1>
        <p className="mt-1 text-sm text-muted">
          Modifica testi, immagini, colori e dati di contatto. Le modifiche
          diventano visibili sul sito dopo il salvataggio.
        </p>
      </header>

      <SettingsForm settings={settings} />
    </div>
  );
}
