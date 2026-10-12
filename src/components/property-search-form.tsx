import { Search } from "lucide-react";

/**
 * Progressive-enhancement search: a plain GET form that submits to the
 * catalogue. It works without JavaScript and produces shareable URLs.
 */
export function PropertySearchForm({
  cities,
  types,
  compact = false,
}: {
  cities: string[];
  types: string[];
  compact?: boolean;
}) {
  return (
    <form
      action="/immobili"
      method="get"
      className={
        compact
          ? "grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      }
      role="search"
      aria-label="Ricerca immobili"
    >
      <div>
        <label className="label" htmlFor="home-transaction">
          Contratto
        </label>
        <select id="home-transaction" name="transaction" className="field" defaultValue="">
          <option value="">Vendita e affitto</option>
          <option value="sale">Vendita</option>
          <option value="rent">Affitto</option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="home-type">
          Tipologia
        </label>
        <select id="home-type" name="type" className="field" defaultValue="">
          <option value="">Tutte</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="home-city">
          Città
        </label>
        <select id="home-city" name="city" className="field" defaultValue="">
          <option value="">Tutte</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="home-minBedrooms">
          Camere (min.)
        </label>
        <select
          id="home-minBedrooms"
          name="minBedrooms"
          className="field"
          defaultValue=""
        >
          <option value="">Indifferente</option>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}+
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2 lg:col-span-4">
        <button type="submit" className="btn btn-accent w-full sm:w-auto">
          <Search className="h-4 w-4" aria-hidden />
          Cerca immobili
        </button>
      </div>
    </form>
  );
}
