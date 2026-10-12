"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Search, X } from "lucide-react";

export interface FilterOption {
  cities: string[];
  types: string[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Più recenti" },
  { value: "price_asc", label: "Prezzo crescente" },
  { value: "price_desc", label: "Prezzo decrescente" },
  { value: "area_desc", label: "Superficie maggiore" },
];

/**
 * Filters submit via GET (progressive enhancement) but, when JavaScript is
 * available, update the URL without a full reload. Filter state lives in the
 * URL, so it is shareable and survives refresh/back.
 */
export function PropertyFilters({ cities, types }: FilterOption) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const get = (key: string) => searchParams.get(key) ?? "";
  const hasFilters =
    ["transaction", "type", "city", "minPrice", "maxPrice", "minBedrooms", "minArea"].some(
      (key) => get(key) !== "",
    );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      const stringValue = String(value).trim();
      if (stringValue) params.set(key, stringValue);
    }
    const query = params.toString();
    router.push(query ? `/immobili?${query}` : "/immobili", { scroll: false });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="card p-5"
      role="search"
      aria-label="Filtri immobili"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="f-transaction">
            Contratto
          </label>
          <select
            id="f-transaction"
            name="transaction"
            className="field"
            defaultValue={get("transaction")}
          >
            <option value="">Vendita e affitto</option>
            <option value="sale">Vendita</option>
            <option value="rent">Affitto</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-type">
            Tipologia
          </label>
          <select id="f-type" name="type" className="field" defaultValue={get("type")}>
            <option value="">Tutte</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-city">
            Città
          </label>
          <select id="f-city" name="city" className="field" defaultValue={get("city")}>
            <option value="">Tutte</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-sort">
            Ordina per
          </label>
          <select id="f-sort" name="sort" className="field" defaultValue={get("sort") || "newest"}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-minPrice">
            Prezzo minimo (€)
          </label>
          <input
            id="f-minPrice"
            name="minPrice"
            inputMode="numeric"
            className="field"
            placeholder="Es. 100000"
            defaultValue={get("minPrice")}
          />
        </div>

        <div>
          <label className="label" htmlFor="f-maxPrice">
            Prezzo massimo (€)
          </label>
          <input
            id="f-maxPrice"
            name="maxPrice"
            inputMode="numeric"
            className="field"
            placeholder="Es. 500000"
            defaultValue={get("maxPrice")}
          />
        </div>

        <div>
          <label className="label" htmlFor="f-minBedrooms">
            Camere (min.)
          </label>
          <select
            id="f-minBedrooms"
            name="minBedrooms"
            className="field"
            defaultValue={get("minBedrooms")}
          >
            <option value="">Indifferente</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}+
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-minArea">
            Superficie min. (m²)
          </label>
          <input
            id="f-minArea"
            name="minArea"
            inputMode="numeric"
            className="field"
            placeholder="Es. 80"
            defaultValue={get("minArea")}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-accent">
          <Search className="h-4 w-4" aria-hidden />
          Applica filtri
        </button>
        {hasFilters ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => router.push("/immobili", { scroll: false })}
          >
            <X className="h-4 w-4" aria-hidden />
            Azzera filtri
          </button>
        ) : null}
      </div>
    </form>
  );
}
