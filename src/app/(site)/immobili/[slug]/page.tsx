import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Building2,
  Calendar,
  Car,
  Layers,
  Maximize,
  Ruler,
  Zap,
  MapPin,
  Check,
} from "lucide-react";
import {
  getPropertyBySlug,
  getRelatedProperties,
  getSiteSettings,
} from "@/lib/queries";
import { PropertyGallery } from "@/components/property-gallery";
import { VideoEmbed } from "@/components/video-embed";
import { PropertyCard } from "@/components/property-card";
import { InquiryForm } from "@/components/public-forms";
import { formatNumber, formatPrice, propertyLocation, transactionLabel } from "@/lib/utils";
import { env } from "@/lib/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) {
    return { title: "Immobile non trovato" };
  }
  const title = property.seo_title ?? property.title;
  const description =
    property.seo_description ?? property.short_description ?? undefined;
  return {
    title,
    description,
    alternates: { canonical: `/immobili/${property.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${env.siteUrl}/immobili/${property.slug}`,
      images: property.cover_image_url ? [property.cover_image_url] : undefined,
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProperties(property, 3),
    getSiteSettings(),
  ]);

  const location = propertyLocation(property);
  const images = [
    ...(property.cover_image_url
      ? [{ url: property.cover_image_url, alt: property.title }]
      : []),
    ...(property.property_images ?? [])
      .filter((image) => image.url !== property.cover_image_url)
      .map((image) => ({
        url: image.url,
        alt: image.alt ?? property.title,
      })),
  ];

  const showAddress = property.is_address_public && property.address;

  const details = [
    { label: "Tipologia", value: property.property_type, Icon: Building2 },
    {
      label: "Superficie",
      value: property.living_area ? `${formatNumber(property.living_area)} m²` : null,
      Icon: Maximize,
    },
    { label: "Camere", value: property.bedrooms, Icon: BedDouble },
    { label: "Bagni", value: property.bathrooms, Icon: Bath },
    { label: "Locali", value: property.rooms, Icon: Layers },
    {
      label: "Superficie terreno",
      value: property.land_area ? `${formatNumber(property.land_area)} m²` : null,
      Icon: Ruler,
    },
    { label: "Piano", value: property.floor, Icon: Layers },
    { label: "Anno di costruzione", value: property.year_built, Icon: Calendar },
    { label: "Classe energetica", value: property.energy_rating, Icon: Zap },
  ].filter((item) => item.value !== null && item.value !== undefined && item.value !== "");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.short_description ?? undefined,
    url: `${env.siteUrl}/immobili/${property.slug}`,
    ...(property.cover_image_url ? { image: property.cover_image_url } : {}),
    ...(location
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: property.city ?? undefined,
            addressRegion: property.province ?? undefined,
            addressCountry: "IT",
            ...(showAddress ? { streetAddress: property.address ?? undefined } : {}),
          },
        }
      : {}),
    ...(property.price
      ? {
          offers: {
            "@type": "Offer",
            price: property.price,
            priceCurrency: property.currency,
          },
        }
      : {}),
  };

  return (
    <article className="container-x py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Link
        href="/immobili"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Tutti gli immobili
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <PropertyGallery images={images} title={property.title} />

          <header className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge border-transparent bg-accent text-white">
                {transactionLabel(property.transaction_type)}
              </span>
              {property.property_type ? (
                <span className="badge">{property.property_type}</span>
              ) : null}
            </div>
            <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              {property.title}
            </h1>
            {location ? (
              <p className="mt-3 flex items-center gap-2 text-muted">
                <MapPin className="h-4 w-4" aria-hidden />
                {location}
              </p>
            ) : null}
            {showAddress ? (
              <p className="mt-1 text-sm text-muted">{property.address}</p>
            ) : null}
            <p className="mt-5 font-display text-3xl text-ink">
              {formatPrice(property.price, property.currency, property.transaction_type)}
            </p>
          </header>

          <PropertyDetails items={details} />

          {property.description ? (
            <section className="mt-10">
              <h2 className="text-2xl">Descrizione</h2>
              <div className="prose-body mt-4">
                {property.description
                  .split(/\n{2,}|\n/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </section>
          ) : null}

          {property.amenities.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-2xl">Caratteristiche</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink-soft"
                  >
                    <Check className="h-3.5 w-3.5 text-accent" aria-hidden />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {property.video_url ? (
            <section className="mt-10">
              <h2 className="text-2xl">Video</h2>
              <div className="mt-4">
                <VideoEmbed url={property.video_url} title={property.title} />
              </div>
            </section>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="text-lg">Richiedi informazioni</h2>
            <p className="mt-1 text-sm text-muted">
              Compila il modulo e ti ricontatteremo al più presto.
            </p>
            <div className="mt-5">
              <InquiryForm
                propertyId={property.id}
                sourcePage={`/immobili/${property.slug}`}
              />
            </div>
          </div>

          {settings.contact_phone || settings.contact_email ? (
            <div className="mt-4 card p-5 text-sm">
              <p className="font-medium text-ink">Preferisci parlare con noi?</p>
              <div className="mt-2 space-y-1 text-muted">
                {settings.contact_phone ? (
                  <p>
                    Tel.{" "}
                    <a
                      className="hover:text-accent-dark"
                      href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                    >
                      {settings.contact_phone}
                    </a>
                  </p>
                ) : null}
                {settings.contact_email ? (
                  <p>
                    <a
                      className="hover:text-accent-dark"
                      href={`mailto:${settings.contact_email}`}
                    >
                      {settings.contact_email}
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-line pt-12">
          <h2 className="text-2xl">Altri immobili</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function PropertyDetails({
  items,
}: {
  items: Array<{ label: string; value: unknown; Icon: typeof Car }>;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-2xl">Caratteristiche principali</h2>
      <dl className="mt-4 grid grid-cols-2 gap-x-8 sm:grid-cols-3">
        {items.map(({ label, value, Icon }) => (
          <div key={label} className="py-3">
            <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
