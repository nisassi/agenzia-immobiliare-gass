import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/admin/property-form";

export const metadata: Metadata = {
  title: "Nuovo immobile",
  robots: { index: false, follow: false },
};

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/immobili"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Torna agli immobili
      </Link>

      <header>
        <h1 className="font-display text-3xl">Nuovo immobile</h1>
        <p className="mt-1 text-sm text-muted">
          Compila i dati principali, poi aggiungi le immagini. L&apos;immobile
          viene creato come bozza finché non lo pubblichi.
        </p>
      </header>

      <PropertyForm />
    </div>
  );
}
