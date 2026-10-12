import type { Property, TransactionType } from "@/lib/types";

/** Minimal class name combiner (no dependency). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatPrice(
  price: number | null | undefined,
  currency = "EUR",
  transaction: TransactionType = "sale",
): string {
  if (price === null || price === undefined || Number.isNaN(price)) {
    return "Prezzo su richiesta";
  }
  const formatted = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
  return transaction === "rent" ? `${formatted}/mese` : formatted;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value))
    return "—";
  return new Intl.NumberFormat("it-IT").format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Human readable location, e.g. "Firenze, Toscana". */
export function propertyLocation(
  property: Pick<Property, "city" | "province" | "neighborhood">,
): string {
  const parts = [property.neighborhood, property.city, property.province].filter(
    (part): part is string => Boolean(part && part.trim()),
  );
  // De-duplicate consecutive identical values.
  return parts
    .filter((part, index) => part !== parts[index - 1])
    .join(", ");
}

const TRANSACTION_LABELS: Record<TransactionType, string> = {
  sale: "Vendita",
  rent: "Affitto",
};

export function transactionLabel(type: TransactionType): string {
  return TRANSACTION_LABELS[type] ?? type;
}

export const PROPERTY_STATUS_LABELS = {
  draft: "Bozza",
  published: "Pubblicato",
  archived: "Archiviato",
} as const;

export const INQUIRY_STATUS_LABELS = {
  new: "Nuova",
  in_progress: "In lavorazione",
  handled: "Gestita",
} as const;

export const INQUIRY_TYPE_LABELS = {
  general: "Informazioni",
  property: "Richiesta immobile",
  valuation: "Valutazione",
} as const;

export function truncate(value: string | null | undefined, length = 160): string {
  if (!value) return "";
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}
