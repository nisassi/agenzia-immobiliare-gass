import type { Metadata } from "next";
import { getServices } from "@/lib/queries";
import { ServiceForm } from "@/components/admin/service-form";
import { EmptyState } from "@/components/ui";
import { ServiceActions } from "@/app/admin/(panel)/servizi/service-actions";

export const metadata: Metadata = {
  title: "Servizi",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage() {
  const services = await getServices(false);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl">Servizi</h1>
        <p className="mt-1 text-sm text-muted">
          I servizi mostrati nella homepage e nella pagina Servizi. L&apos;ordine
          di visualizzazione segue il campo «Ordine» (numeri più bassi prima).
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg">Servizi esistenti</h2>
        {services.length > 0 ? (
          <ul className="space-y-4">
            {services.map((service) => (
              <li key={service.id} className="card p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {service.title}
                    </p>
                    <p className="text-xs text-muted">
                      {service.is_published ? "Visibile" : "Nascosto"} · ordine{" "}
                      {service.sort_order}
                    </p>
                  </div>
                  <ServiceActions id={service.id} title={service.title} />
                </div>
                <ServiceForm service={service} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nessun servizio"
            description="Aggiungi il primo servizio compilando il modulo qui sotto."
          />
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg">Aggiungi un servizio</h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Compila i campi e salva per creare un nuovo servizio.
        </p>
        <ServiceForm />
      </section>
    </div>
  );
}
