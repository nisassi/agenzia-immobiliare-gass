import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getAdminProperties } from "@/lib/admin-queries";
import { StatusBadge } from "@/components/ui";
import { Pagination } from "@/components/pagination";
import { PropertyActions } from "@/app/admin/(panel)/immobili/property-actions";
import { formatDate, formatPrice, transactionLabel } from "@/lib/utils";
import type { PropertyStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Immobili",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

const STATUS_TABS: Array<{ value: PropertyStatus | "all"; label: string }> = [
  { value: "all", label: "Tutti" },
  { value: "published", label: "Pubblicati" },
  { value: "draft", label: "Bozze" },
  { value: "archived", label: "Archiviati" },
];

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = single(params.search).trim();
  const statusRaw = single(params.status);
  const status: PropertyStatus | "all" = (
    ["published", "draft", "archived"] as const
  ).includes(statusRaw as PropertyStatus)
    ? (statusRaw as PropertyStatus)
    : "all";
  const page = Math.max(1, Number(single(params.page)) || 1);

  const result = await getAdminProperties({
    search: search || undefined,
    status,
    page,
    pageSize: 12,
  });

  const buildTabHref = (value: PropertyStatus | "all") => {
    const query = new URLSearchParams();
    if (value !== "all") query.set("status", value);
    if (search) query.set("search", search);
    const qs = query.toString();
    return qs ? `/admin/immobili?${qs}` : "/admin/immobili";
  };

  const paginationParams: Record<string, string> = {};
  if (status !== "all") paginationParams.status = status;
  if (search) paginationParams.search = search;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Immobili</h1>
          <p className="mt-1 text-sm text-muted">
            {result.total}{" "}
            {result.total === 1 ? "immobile" : "immobili"} in archivio.
          </p>
        </div>
        <Link href="/admin/immobili/nuovo" className="btn btn-accent">
          <Plus className="h-4 w-4" aria-hidden />
          Nuovo immobile
        </Link>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtro stato">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildTabHref(tab.value)}
              role="tab"
              aria-selected={status === tab.value}
              className={
                status === tab.value
                  ? "btn btn-dark btn-sm"
                  : "btn btn-outline btn-sm"
              }
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form action="/admin/immobili" method="get" className="flex gap-2" role="search">
          {status !== "all" ? (
            <input type="hidden" name="status" value={status} />
          ) : null}
          <label className="sr-only" htmlFor="admin-search">
            Cerca immobili
          </label>
          <input
            id="admin-search"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Cerca per titolo, città o slug…"
            className="field w-full sm:w-64"
          />
          <button type="submit" className="btn btn-outline">
            <Search className="h-4 w-4" aria-hidden />
            <span className="sr-only">Cerca</span>
          </button>
        </form>
      </div>

      {result.items.length > 0 ? (
        <>
          <ul className="card divide-y divide-line">
            {result.items.map((property) => (
              <li
                key={property.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/immobili/${property.id}`}
                      className="truncate text-sm font-medium text-ink hover:text-accent-dark"
                    >
                      {property.title}
                    </Link>
                    <StatusBadge status={property.status} />
                    {property.is_featured ? (
                      <span className="badge border-transparent text-white" style={{ backgroundColor: "var(--accent)" }}>
                        In evidenza
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {transactionLabel(property.transaction_type)} ·{" "}
                    {property.city ?? "Città non indicata"} ·{" "}
                    {formatPrice(property.price, property.currency, property.transaction_type)}{" "}
                    · aggiornato {formatDate(property.updated_at)}
                  </p>
                </div>
                <PropertyActions
                  id={property.id}
                  slug={property.slug}
                  status={property.status}
                  isFeatured={property.is_featured}
                />
              </li>
            ))}
          </ul>

          <Pagination
            basePath="/admin/immobili"
            currentPage={result.page}
            pageCount={result.pageCount}
            params={paginationParams}
          />
        </>
      ) : (
        <div className="card px-6 py-16 text-center">
          <h2 className="text-xl">Nessun immobile trovato</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {search
              ? "Nessun risultato per la ricerca. Prova con un altro termine."
              : "Non ci sono ancora immobili in questa categoria. Creane uno nuovo per iniziare."}
          </p>
          <Link href="/admin/immobili/nuovo" className="btn btn-accent mt-6">
            <Plus className="h-4 w-4" aria-hidden />
            Nuovo immobile
          </Link>
        </div>
      )}
    </div>
  );
}
