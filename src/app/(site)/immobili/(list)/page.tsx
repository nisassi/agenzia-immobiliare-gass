import type { Metadata } from "next";
import { getPublishedProperties, getPropertyOptionsForFilter } from "@/lib/queries";
import { PropertyCard } from "@/components/property-card";
import { PropertyFilters } from "@/components/property-filters";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/ui";
import type { PropertyFilters as Filters } from "@/lib/queries";
import type { TransactionType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Immobili in vendita e in affitto",
  description:
    "Consulta tutti gli immobili disponibili. Filtra per contratto, tipologia, città, prezzo, camere e superficie.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function toNumber(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

const TRANSACTIONS: TransactionType[] = ["sale", "rent"];
const SORTS: Filters["sort"][] = ["newest", "price_asc", "price_desc", "area_desc"];

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const transactionRaw = single(params.transaction);
  const transaction: Filters["transaction"] = TRANSACTIONS.includes(
    transactionRaw as TransactionType,
  )
    ? (transactionRaw as TransactionType)
    : "all";
  const sortRaw = single(params.sort) as Filters["sort"];
  const sort: Filters["sort"] = SORTS.includes(sortRaw) ? sortRaw : "newest";
  const page = Math.max(1, toNumber(single(params.page)) ?? 1);

  const filters: Filters = {
    transaction,
    type: single(params.type) || undefined,
    city: single(params.city) || undefined,
    minPrice: toNumber(single(params.minPrice)),
    maxPrice: toNumber(single(params.maxPrice)),
    minBedrooms: toNumber(single(params.minBedrooms)),
    minArea: toNumber(single(params.minArea)),
    sort,
    page,
    pageSize: 9,
  };

  const [result, options] = await Promise.all([
    getPublishedProperties(filters),
    getPropertyOptionsForFilter(),
  ]);

  const activeParams: Record<string, string> = {};
  for (const key of [
    "transaction",
    "type",
    "city",
    "minPrice",
    "maxPrice",
    "minBedrooms",
    "minArea",
    "sort",
  ]) {
    const value = single(params[key]);
    if (value) activeParams[key] = value;
  }

  return (
    <div className="container-x py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Portafoglio immobili</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Immobili</h1>
        <p className="mt-4 text-muted">
          Usa i filtri per trovare l&apos;immobile più adatto alle tue esigenze.
        </p>
      </header>

      <div className="mt-8">
        <PropertyFilters cities={options.cities} types={options.types} />
      </div>

      <div className="mt-8 flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted" role="status">
          {result.total === 0
            ? "Nessun immobile trovato"
            : `${result.total} ${result.total === 1 ? "immobile" : "immobili"}`}
          {result.pageCount > 1
            ? ` · pagina ${result.page} di ${result.pageCount}`
            : ""}
        </p>
      </div>

      {result.items.length > 0 ? (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <Pagination
            basePath="/immobili"
            currentPage={result.page}
            pageCount={result.pageCount}
            params={activeParams}
          />
        </>
      ) : (
        <EmptyState
          className="mt-6"
          title="Nessun immobile corrisponde ai filtri"
          description="Prova a modificare o azzerare i filtri di ricerca."
        />
      )}
    </div>
  );
}
