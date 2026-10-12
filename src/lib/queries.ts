import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withSettingsDefaults } from "@/lib/settings";
import type {
  Inquiry,
  Property,
  Service,
  SiteSettings,
  TransactionType,
} from "@/lib/types";

const PROPERTY_LIST_COLUMNS =
  "id, slug, title, short_description, transaction_type, property_type, price, currency, city, province, neighborhood, living_area, rooms, bedrooms, bathrooms, is_featured, status, cover_image_url, created_at, published_at";

export interface PropertyFilters {
  transaction?: TransactionType | "all";
  type?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minArea?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "area_desc";
  page?: number;
  pageSize?: number;
}

export interface PropertyListResult {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/**
 * Site settings row, merged over defaults. Always resolves.
 *
 * Wrapped in React `cache` so the many callers per request (root layout,
 * site layout, pages, metadata) share a single database round-trip.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return withSettingsDefaults(null);
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return withSettingsDefaults(data as Partial<SiteSettings> | null);
});

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_LIST_COLUMNS)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Property[];
}

export async function getLatestProperties(limit = 6): Promise<Property[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_LIST_COLUMNS)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Property[];
}

export async function getPublishedProperties(
  filters: PropertyFilters = {},
): Promise<PropertyListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 12));
  const empty: PropertyListResult = {
    items: [],
    total: 0,
    page,
    pageSize,
    pageCount: 0,
  };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return empty;

  let query = supabase
    .from("properties")
    .select(PROPERTY_LIST_COLUMNS, { count: "exact" })
    .eq("status", "published");

  if (filters.transaction && filters.transaction !== "all") {
    query = query.eq("transaction_type", filters.transaction);
  }
  if (filters.type) {
    query = query.eq("property_type", filters.type);
  }
  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (typeof filters.minPrice === "number") {
    query = query.gte("price", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    query = query.lte("price", filters.maxPrice);
  }
  if (typeof filters.minBedrooms === "number") {
    query = query.gte("bedrooms", filters.minBedrooms);
  }
  if (typeof filters.minArea === "number") {
    query = query.gte("living_area", filters.minArea);
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "area_desc":
      query = query.order("living_area", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) return empty;

  const total = count ?? 0;
  return {
    items: (data ?? []) as Property[],
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(id, property_id, url, path, alt, sort_order, created_at)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  const property = data as Property;
  property.property_images = (property.property_images ?? []).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return property;
}

export async function getRelatedProperties(
  property: Pick<Property, "id" | "city" | "transaction_type">,
  limit = 3,
): Promise<Property[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("properties")
    .select(PROPERTY_LIST_COLUMNS)
    .eq("status", "published")
    .eq("transaction_type", property.transaction_type)
    .neq("id", property.id)
    .limit(limit);
  if (property.city) {
    query = query.eq("city", property.city);
  }
  const { data, error } = await query;
  if (error || (data ?? []).length === 0) {
    // Fall back to any other published listings.
    const fallback = await supabase
      .from("properties")
      .select(PROPERTY_LIST_COLUMNS)
      .eq("status", "published")
      .neq("id", property.id)
      .limit(limit);
    return (fallback.data ?? []) as Property[];
  }
  return (data ?? []) as Property[];
}

export async function getPublishedSlugs(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("status", "published");
  return (data ?? []) as Array<{ slug: string; updated_at: string }>;
}

export async function getServices(onlyPublished = true): Promise<Service[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase.from("services").select("*").order("sort_order", {
    ascending: true,
  });
  if (onlyPublished) query = query.eq("is_published", true);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as Service[];
}

export async function getPropertyOptionsForFilter(): Promise<{
  cities: string[];
  types: string[];
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { cities: [], types: [] };
  const { data } = await supabase
    .from("properties")
    .select("city, property_type")
    .eq("status", "published");
  const cities = new Set<string>();
  const types = new Set<string>();
  for (const row of (data ?? []) as Array<{
    city: string | null;
    property_type: string | null;
  }>) {
    if (row.city) cities.add(row.city);
    if (row.property_type) types.add(row.property_type);
  }
  return {
    cities: [...cities].sort((a, b) => a.localeCompare(b, "it")),
    types: [...types].sort((a, b) => a.localeCompare(b, "it")),
  };
}

export interface PublicInquiry {
  id: string;
  created_at: string;
}

export async function getInquiriesForAdmin(): Promise<Inquiry[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("inquiries")
    .select(
      "id, property_id, type, name, email, phone, message, valuation_address, valuation_property_type, valuation_size, valuation_timeframe, status, source_page, created_at, properties(id, slug, title)",
    )
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as unknown as Inquiry[];
}
