import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { getAdminPropertyById } from "@/lib/admin-queries";
import { PropertyForm } from "@/components/admin/property-form";
import { MediaManager } from "@/components/admin/media-manager";
import { StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Modifica immobile",
  robots: { index: false, follow: false },
};

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getAdminPropertyById(id);
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/immobili"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Torna agli immobili
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            <span className="font-mono text-xs">/immobili/{property.slug}</span>
            {" · "}creato {formatDateTime(property.created_at)}
            {" · "}aggiornato {formatDateTime(property.updated_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {property.status === "published" ? (
            <a
              href={`/immobili/${property.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Anteprima
            </a>
          ) : (
            <span
              className="btn btn-outline btn-sm cursor-not-allowed opacity-60"
              title="Pubblica l'immobile per vedere l'anteprima"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Anteprima
            </span>
          )}
          <Link
            href="/admin/immobili"
            className="btn btn-ghost btn-sm"
            aria-label="Duplica dalla lista"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden />
            Duplica dalla lista
          </Link>
        </div>
      </header>

      <PropertyForm property={property} />

      <div className="border-t border-line pt-6">
        <h2 className="font-display text-2xl">Media</h2>
        <p className="mt-1 mb-5 text-sm text-muted">
          Gestisci foto e video di questo immobile.
        </p>
        <MediaManager
          propertyId={property.id}
          propertyTitle={property.title}
          images={property.property_images ?? []}
          coverImageUrl={property.cover_image_url}
          videoUrl={property.video_url}
        />
      </div>
    </div>
  );
}
