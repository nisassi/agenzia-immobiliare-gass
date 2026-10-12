import Link from "next/link";
import {
  Building2,
  FileEdit,
  Archive,
  Star,
  MessageSquare,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  getAdminStats,
  getRecentInquiries,
  getRecentProperties,
} from "@/lib/admin-queries";
import { StatusBadge } from "@/components/ui";
import {
  formatDate,
  INQUIRY_TYPE_LABELS,
  transactionLabel,
} from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";

export default async function AdminOverviewPage() {
  const [stats, recentProperties, recentInquiries] = await Promise.all([
    getAdminStats(),
    getRecentProperties(6),
    getRecentInquiries(5),
  ]);

  const cards = [
    { label: "Pubblicati", value: stats.published, Icon: Building2, href: "/admin/immobili?status=published" },
    { label: "Bozze", value: stats.draft, Icon: FileEdit, href: "/admin/immobili?status=draft" },
    { label: "Archiviati", value: stats.archived, Icon: Archive, href: "/admin/immobili?status=archived" },
    { label: "In evidenza", value: stats.featured, Icon: Star, href: "/admin/immobili" },
    { label: "Richieste nuove", value: stats.newInquiries, Icon: MessageSquare, href: "/admin/richieste" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Panoramica</h1>
          <p className="mt-1 text-sm text-muted">
            Riepilogo dei contenuti e delle richieste ricevute.
          </p>
        </div>
        <Link href="/admin/immobili/nuovo" className="btn btn-accent">
          <Plus className="h-4 w-4" aria-hidden />
          Nuovo immobile
        </Link>
      </header>

      {!isSupabaseConfigured ? (
        <div
          role="alert"
          className="rounded-lg border p-4 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--color-warning) 45%, white)",
            backgroundColor: "color-mix(in srgb, var(--color-warning) 8%, white)",
          }}
        >
          Il database non è configurato: queste statistiche resteranno a zero
          finché non colleghi il progetto Supabase (vedi README).
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ label, value, Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="card p-5 transition-colors hover:border-line-strong"
          >
            <Icon className="h-5 w-5 text-accent" aria-hidden />
            <p className="mt-3 font-display text-3xl">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">
              {label}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-lg">Immobili recenti</h2>
            <Link
              href="/admin/immobili"
              className="text-xs text-muted hover:text-ink"
            >
              Vedi tutti <ArrowRight className="inline h-3 w-3" aria-hidden />
            </Link>
          </div>
          {recentProperties.length > 0 ? (
            <ul className="divide-y divide-line">
              {recentProperties.map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/admin/immobili/${property.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-ink/[0.03]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {property.title}
                      </span>
                      <span className="block text-xs text-muted">
                        {transactionLabel(property.transaction_type)} ·{" "}
                        {property.city ?? "—"} · {formatDate(property.updated_at)}
                      </span>
                    </span>
                    <StatusBadge status={property.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">
              Nessun immobile. Crea il primo annuncio.
            </p>
          )}
        </section>

        <section className="card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-lg">Richieste recenti</h2>
            <Link
              href="/admin/richieste"
              className="text-xs text-muted hover:text-ink"
            >
              Vedi tutte <ArrowRight className="inline h-3 w-3" aria-hidden />
            </Link>
          </div>
          {recentInquiries.length > 0 ? (
            <ul className="divide-y divide-line">
              {recentInquiries.map((inquiry) => (
                <li
                  key={inquiry.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {inquiry.name}
                    </span>
                    <span className="block text-xs text-muted">
                      {INQUIRY_TYPE_LABELS[inquiry.type]} ·{" "}
                      {formatDate(inquiry.created_at)}
                    </span>
                  </span>
                  <StatusBadge status={inquiry.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">
              Nessuna richiesta ricevuta.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
