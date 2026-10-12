import Link from "next/link";
import { BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import { Media } from "@/components/media";
import type { Property } from "@/lib/types";
import {
  formatNumber,
  formatPrice,
  propertyLocation,
  transactionLabel,
} from "@/lib/utils";

export function PropertyCard({ property }: { property: Property }) {
  const location = propertyLocation(property);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-shadow duration-200 hover:shadow-[0_18px_40px_-24px_rgba(28,26,24,0.45)]">
      <Link
        href={`/immobili/${property.slug}`}
        className="flex h-full flex-col focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-line">
          <Media
            src={property.cover_image_url}
            alt={property.title}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
            fallbackLabel="Immagine in arrivo"
          />
          <span className="absolute left-3 top-3 badge bg-surface/95 backdrop-blur">
            {transactionLabel(property.transaction_type)}
          </span>
          {property.is_featured ? (
            <span
              className="absolute right-3 top-3 badge border-transparent text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              In evidenza
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          {property.property_type ? (
            <p className="text-xs uppercase tracking-wider text-accent">
              {property.property_type}
            </p>
          ) : null}
          <h3 className="mt-1.5 text-lg leading-snug text-ink group-hover:text-accent-dark">
            {property.title}
          </h3>
          {location ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {location}
            </p>
          ) : null}

          <p className="mt-4 font-display text-xl text-ink">
            {formatPrice(property.price, property.currency, property.transaction_type)}
          </p>

          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm text-muted">
            {property.living_area ? (
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" aria-hidden />
                <dt className="sr-only">Superficie</dt>
                <dd>{formatNumber(property.living_area)} m²</dd>
              </div>
            ) : null}
            {property.bedrooms ? (
              <div className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" aria-hidden />
                <dt className="sr-only">Camere</dt>
                <dd>{property.bedrooms}</dd>
              </div>
            ) : null}
            {property.bathrooms ? (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" aria-hidden />
                <dt className="sr-only">Bagni</dt>
                <dd>{property.bathrooms}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </Link>
    </article>
  );
}
