import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/queries";
import { Media } from "@/components/media";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.about_title ?? "Chi siamo",
    description: settings.intro_body ?? settings.tagline ?? undefined,
    alternates: { canonical: "/chi-siamo" },
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const paragraphs = (settings.about_body ?? "")
    .split(/\n{2,}|\n/)
    .filter(Boolean);

  return (
    <div className="container-x py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="eyebrow">L&apos;agenzia</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">
          {settings.about_title ?? "Chi siamo"}
        </h1>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line">
          <Media
            src={settings.about_image_url ?? settings.intro_image_url}
            alt="Immagine dell'agenzia"
            sizes="(max-width: 1024px) 100vw, 50vw"
            fallbackLabel="Immagine dimostrativa"
          />
        </div>

        <div className="prose-body">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <p>
              I contenuti di questa pagina non sono ancora stati impostati. Puoi
              aggiungerli dal pannello di amministrazione, sezione
              &laquo;Contenuti&raquo;.
            </p>
          )}

          <div className="mt-6 rounded-md border border-line bg-surface p-4 text-sm">
            <p className="font-medium text-ink">Nota per l&apos;agenzia</p>
            <p className="mt-1 text-muted">
              Inserisci solo informazioni verificate. Evita premi, certificazioni,
              anni di attività o recensioni finché non sono documentati.
            </p>
          </div>
        </div>
      </div>

      {(settings.intro_title || settings.intro_body) && (
        <section className="mt-16 border-t border-line pt-12">
          <h2 className="text-2xl">{settings.intro_title ?? "Il nostro approccio"}</h2>
          {settings.intro_body ? (
            <div className="prose-body mt-4 max-w-3xl">
              {settings.intro_body
                .split(/\n{2,}|\n/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/servizi" className="btn btn-outline">
              I nostri servizi
            </Link>
            <Link href="/contatti" className="btn btn-accent">
              Contattaci
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
