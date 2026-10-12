import Link from "next/link";
import {
  ArrowRight,
  Home,
  Key,
  Calculator,
  Compass,
  Handshake,
  Mail,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";
import { getSiteSettings, getFeaturedProperties, getLatestProperties, getServices, getPropertyOptionsForFilter } from "@/lib/queries";
import { Media } from "@/components/media";
import { PropertyCard } from "@/components/property-card";
import { PropertySearchForm } from "@/components/property-search-form";
import { InquiryForm } from "@/components/public-forms";
import { EmptyState, SectionHeading } from "@/components/ui";

const SERVICE_ICONS: Record<string, typeof Home> = {
  home: Home,
  key: Key,
  calculator: Calculator,
  compass: Compass,
  handshake: Handshake,
};

export default async function HomePage() {
  const [settings, featured, latest, services, options] = await Promise.all([
    getSiteSettings(),
    getFeaturedProperties(6),
    getLatestProperties(6),
    getServices(true),
    getPropertyOptionsForFilter(),
  ]);

  const listings = featured.length > 0 ? featured : latest;
  const usingFallback = featured.length === 0 && latest.length > 0;

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate overflow-hidden bg-dark text-white">
        {settings.hero_image_url ? (
          <>
            <Media
              src={settings.hero_image_url}
              alt=""
              priority
              sizes="100vw"
              className="absolute inset-0 -z-10 opacity-60"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-r from-dark/95 via-dark/80 to-dark/40"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(120% 120% at 15% 0%, color-mix(in srgb, var(--accent) 30%, #1c1a18) 0%, #1c1a18 60%)",
            }}
          />
        )}

        <div className="container-x relative py-24 sm:py-32">
          <div className="max-w-3xl">
            {settings.hero_eyebrow ? (
              <p
                className="text-xs font-semibold uppercase tracking-[0.22em]"
                style={{ color: "color-mix(in srgb, var(--accent) 55%, white)" }}
              >
                {settings.hero_eyebrow}
              </p>
            ) : null}
            <h1 className="mt-5 font-display text-4xl leading-[1.08] text-white sm:text-6xl">
              {settings.hero_headline}
            </h1>
            {settings.hero_subheadline ? (
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                {settings.hero_subheadline}
              </p>
            ) : null}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={settings.hero_primary_href} className="btn btn-accent">
                {settings.hero_primary_label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              {settings.hero_secondary_label && settings.hero_secondary_href ? (
                <Link
                  href={settings.hero_secondary_href}
                  className="btn border border-white/25 text-white hover:bg-white/10"
                >
                  {settings.hero_secondary_label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="container-x relative pb-0">
          <div className="card -mb-10 translate-y-10 p-5 shadow-xl sm:-mb-12 sm:translate-y-12 sm:p-7">
            <p className="mb-4 text-sm font-medium text-ink">
              Trova il tuo prossimo immobile
            </p>
            <PropertySearchForm
              cities={options.cities}
              types={options.types}
              compact
            />
          </div>
        </div>
      </section>

      <div aria-hidden className="h-16 sm:h-20" />

      {/* ---------------------------------------------------- Featured listings */}
      <section className="container-x py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow={usingFallback ? "Ultimi annunci" : "In evidenza"}
            title={usingFallback ? "Ultimi immobili inseriti" : "Immobili in evidenza"}
            description="Una selezione di immobili dal nostro portafoglio."
          />
          <Link href="/immobili" className="btn btn-outline btn-sm">
            Vedi tutti
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-10"
            title="Nessun immobile pubblicato"
            description="Gli immobili pubblicati dal pannello di amministrazione appariranno qui automaticamente."
          />
        )}
      </section>

      {/* ---------------------------------------------------------- Services */}
      {services.length > 0 ? (
        <section className="border-y border-line bg-surface">
          <div className="container-x py-16 sm:py-20">
            <SectionHeading
              align="center"
              eyebrow="Come possiamo aiutarti"
              title={settings.services_title ?? "I nostri servizi"}
              description={settings.services_subtitle}
            />
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {services.slice(0, 4).map((service) => {
                const Icon = SERVICE_ICONS[service.icon ?? ""] ?? Home;
                return (
                  <div key={service.id} className="flex flex-col">
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
                    <h3 className="mt-4 text-lg">{service.title}</h3>
                    {service.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {service.description}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-12 text-center">
              <Link href="/servizi" className="btn btn-outline">
                Tutti i servizi
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------- Intro */}
      <section className="container-x py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <SectionHeading
              eyebrow={settings.tagline ?? undefined}
              title={settings.intro_title ?? settings.about_title ?? "Chi siamo"}
              description={settings.intro_body ?? settings.about_body}
            />
            <div className="mt-6">
              <Link href="/chi-siamo" className="btn btn-outline btn-sm">
                Scopri di più
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line">
              <Media
                src={settings.intro_image_url ?? settings.about_image_url}
                alt="Immagine dell'agenzia"
                sizes="(max-width: 1024px) 100vw, 50vw"
                fallbackLabel="Immagine dimostrativa"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Valuation */}
      <section className="bg-dark text-white">
        <div className="container-x grid gap-8 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: "color-mix(in srgb, var(--accent) 55%, white)" }}
            >
              Valutazione
            </p>
            <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl">
              Quanto vale il tuo immobile?
            </h2>
            <p className="mt-4 max-w-lg text-white/70">
              Richiedi una valutazione della tua proprietà. Riceverai un primo
              orientamento in base alle caratteristiche dell&apos;immobile e al
              contesto di mercato.
            </p>
            <Link href="/contatti#valutazione" className="btn btn-accent mt-8">
              Richiedi una valutazione
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              "Analisi delle caratteristiche dell'immobile",
              "Confronto con immobili simili in zona",
              "Primo orientamento sul prezzo",
              "Nessun impegno",
            ].map((item) => (
              <li
                key={item}
                className="rounded-md border border-white/15 p-4 text-sm text-white/80"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------------------- Contact */}
      <section className="container-x py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Contatti"
              title="Parliamo del tuo progetto"
              description={settings.contact_intro}
            />
            <dl className="mt-8 space-y-4 text-sm">
              {settings.contact_email ? (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-accent" aria-hidden />
                  <dt className="sr-only">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="hover:text-accent-dark"
                    >
                      {settings.contact_email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.contact_phone ? (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-accent" aria-hidden />
                  <dt className="sr-only">Telefono</dt>
                  <dd>
                    <a
                      href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                      className="hover:text-accent-dark"
                    >
                      {settings.contact_phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.contact_address ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
                  <dt className="sr-only">Indirizzo</dt>
                  <dd>{settings.contact_address}</dd>
                </div>
              ) : null}
              {settings.opening_hours ? (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
                  <dt className="sr-only">Orari</dt>
                  <dd>{settings.opening_hours}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="card p-6 sm:p-8">
            <h3 className="text-lg">Scrivici un messaggio</h3>
            <div className="mt-5">
              <InquiryForm sourcePage="/" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
