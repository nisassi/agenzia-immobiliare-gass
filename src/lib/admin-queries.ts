import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Inquiry, Property, PropertyStatus } from "@/lib/types";

export interface AdminStats {
  published: number;
  draft: number;
  archived: number;
  featured: number;
  total: number;
  newInquiries: number;
}

async function countWhere(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  status?: PropertyStatus,
): Promise<number> {
  let query = supabase
    .from("properties")
    .select("*", { count: "exact", head: true });
  if (status) query = query.eq("status", status);
  const { count } = await query;
  return count ?? 0;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { published: 0, draft: 0, archived: 0, featured: 0, total: 0, newInquiries: 0 };
  }

  const [published, draft, archived, total, featured, newInquiries] =
    await Promise.all([
      countWhere(supabase, "published"),
      countWhere(supabase, "draft"),
      countWhere(supabase, "archived"),
      countWhere(supabase),
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("is_featured", true)
        .then((res) => res.count ?? 0),
      supabase
        .from("inquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "new")
        .then((res) => res.count ?? 0),
    ]);

  return { published, draft, archived, featured, total, newInquiries };
}

export interface AdminPropertyListParams {
  search?: string;
  status?: PropertyStatus | "all";
  page?: number;
  pageSize?: number;
}

export async function getAdminProperties({
  search,
  status = "all",
  page = 1,
  pageSize = 12,
}: AdminPropertyListParams = {}): Promise<{
  items: Property[];
  total: number;
  page: number;
  pageCount: number;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { items: [], total: 0, page, pageCount: 0 };

  let query = supabase.from("properties").select("*", { count: "exact" });
  if (status !== "all") query = query.eq("status", status);
  if (search) {
    const term = `%${search.replace(/[%,]/g, "")}%`;
    query = query.or(`title.ilike.${term},city.ilike.${term},slug.ilike.${term}`);
  }
  query = query.order("updated_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.range(from, from + pageSize - 1);
  if (error) return { items: [], total: 0, page, pageCount: 0 };

  const total = count ?? 0;
  return {
    items: (data ?? []) as Property[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAdminPropertyById(id: string): Promise<Property | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(id, property_id, url, path, alt, sort_order, created_at)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const property = data as Property;
  property.property_images = (property.property_images ?? []).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return property;
}

export async function getRecentProperties(limit = 5): Promise<Property[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("properties")
    .select("id, slug, title, status, city, price, currency, transaction_type, updated_at, created_at")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Property[];
}

export async function getRecentInquiries(limit = 5): Promise<Inquiry[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("inquiries")
    .select("id, type, name, email, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Inquiry[];
}

export async function slugExists(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  let query = supabase.from("properties").select("id").eq("slug", slug).limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  return (data ?? []).length > 0;
}
