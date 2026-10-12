import type { SupabaseClient } from "@supabase/supabase-js";

export type PropertyStatus = "draft" | "published" | "archived";
export type TransactionType = "sale" | "rent";
export type InquiryType = "general" | "property" | "valuation";
export type InquiryStatus = "new" | "in_progress" | "handled";

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  path: string | null;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  transaction_type: TransactionType;
  property_type: string | null;
  price: number | null;
  currency: string;
  city: string | null;
  province: string | null;
  neighborhood: string | null;
  address: string | null;
  is_address_public: boolean;
  living_area: number | null;
  land_area: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: string | null;
  year_built: number | null;
  energy_rating: string | null;
  amenities: string[];
  cover_image_url: string | null;
  cover_image_path: string | null;
  video_url: string | null;
  video_path: string | null;
  is_featured: boolean;
  status: PropertyStatus;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  property_images?: PropertyImage[];
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  property_id: string | null;
  type: InquiryType;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  // valuation specific
  valuation_address: string | null;
  valuation_property_type: string | null;
  valuation_size: number | null;
  valuation_timeframe: string | null;
  status: InquiryStatus;
  source_page: string | null;
  created_at: string;
  properties?: Pick<Property, "id" | "slug" | "title"> | null;
}

export interface SiteSettings {
  id: number;
  agency_name: string;
  tagline: string | null;
  logo_url: string | null;
  logo_path: string | null;
  accent_color: string;
  accent_color_dark: string;
  hero_eyebrow: string | null;
  hero_headline: string;
  hero_subheadline: string | null;
  hero_image_url: string | null;
  hero_image_path: string | null;
  hero_primary_label: string;
  hero_primary_href: string;
  hero_secondary_label: string | null;
  hero_secondary_href: string | null;
  intro_title: string | null;
  intro_body: string | null;
  intro_image_url: string | null;
  about_title: string | null;
  about_body: string | null;
  about_image_url: string | null;
  services_title: string | null;
  services_subtitle: string | null;
  contact_title: string | null;
  contact_intro: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  opening_hours: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  social_youtube: string | null;
  footer_note: string | null;
  seo_default_title: string;
  seo_default_description: string | null;
  seo_keywords: string | null;
  updated_at: string;
}

export type TypedSupabaseClient = SupabaseClient;
