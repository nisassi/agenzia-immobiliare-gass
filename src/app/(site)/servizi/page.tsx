import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  Key,
  Calculator,
  Compass,
  Handshake,
  Sparkles,
  Building2,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { getServices, getSiteSettings } from "@/lib/queries";
import { Media } from "@/components/media";
import { EmptyState } from "@/components/ui";

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  key: Key,
  calculator: Calculator,
  compass: Compass,
  handshake: Handshake,
  sparkles: Sparkles,
  building: Building2,
  document: FileText,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.services_title ?? "Servizi",
    description: settings.services_subtitle ?? undefined,
    alternates: { canonical: "/servizi" },
  };
}

export default async function ServicesPage() {
  const [settings, services] = await Promise.all([
    getSiteSettings(),
    getServices(true),
  ]);

  return (
    <div className="container-x py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="eyebrow">Servizi</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">
          {settings.services_title ?? "I nostri servizi"}
        </h1>
        {settings.services_subtitle ? (
          <p className="mt-4 text-muted">{settings.services_subtitle}</p>
        ) : null}
      </header>

      {services.length > 0 ? (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = ICONS[service.icon ?? ""] ?? Home;
            return (
              <li key={service.id} className="card flex flex-col overflow-hidden">
                {service.image_url ? (
                  <div className="relative aspect-[16/9] border-b border-line">
                    <Media
                      src={service.image_url}
                      alt={service.title}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-md"
                    style={{ backgroundColor: "var(--color-accent-soft)" }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: "var(--accent-dark)" }}
                      aria-hidden
                    />
                  </span>
                  <h2 className="mt-4 text-xl">{service.title}</h2>
                  {service.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          className="mt-12"
          title="Nessun servizio pubblicato"
          description="I servizi pubblicati dal pannello di amministrazione appariranno qui."
        />
      )}

      <div className="mt-14 rounded-lg border border-line bg-surface p-8 text-center">
        <h2 className="text-2xl">Vuoi parlare con noi?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          Contattaci per una consulenza o per richiedere la valutazione del tuo
          immobile.
        </p>
        <Link href="/contatti" className="btn btn-accent mt-6">
          Vai ai contatti
        </Link>
      </div>
    </div>
  );
}
