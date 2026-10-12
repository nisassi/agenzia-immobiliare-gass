-- =============================================================================
-- setup.sql  —  CONVENIENCE SCRIPT (generated from the versioned migrations)
-- -----------------------------------------------------------------------------
-- This is the exact concatenation, in order, of:
--   migrations/0001_schema.sql
--   migrations/0002_rls.sql
--   migrations/0003_storage.sql
--
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- It is safe to re-run (uses IF NOT EXISTS and DROP POLICY IF EXISTS).
--
-- The versioned files in supabase/migrations/ remain the source of truth.
-- =============================================================================
-- =============================================================================
-- 0001_schema.sql
-- Core schema for a single real-estate agency website.
-- Run in the Supabase SQL editor, or via `supabase db push` if using the CLI.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admin membership
-- ---------------------------------------------------------------------------
-- Membership in this table is the ONLY source of administrator privilege.
-- Rows are added deliberately via the SQL editor / service role (see README).
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Authorized administrators. Membership is granted manually, never via public sign-up.';

-- ---------------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------------
create table if not exists public.properties (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  title              text not null check (char_length(title) between 3 and 200),
  short_description  text check (short_description is null or char_length(short_description) <= 320),
  description        text,
  transaction_type   text not null check (transaction_type in ('sale', 'rent')),
  property_type      text,
  price              numeric(12, 2) check (price is null or price >= 0),
  currency           text not null default 'EUR' check (char_length(currency) = 3),
  city               text,
  province           text,
  neighborhood       text,
  address            text,
  is_address_public  boolean not null default false,
  living_area        numeric(10, 2) check (living_area is null or living_area >= 0),
  land_area          numeric(10, 2) check (land_area is null or land_area >= 0),
  rooms              integer check (rooms is null or rooms >= 0),
  bedrooms           integer check (bedrooms is null or bedrooms >= 0),
  bathrooms          integer check (bathrooms is null or bathrooms >= 0),
  floor              text,
  year_built         integer check (year_built is null or year_built between 1000 and 2100),
  energy_rating      text,
  amenities          text[] not null default '{}',
  cover_image_url    text,
  cover_image_path   text,
  video_url          text,
  video_path         text,
  is_featured        boolean not null default false,
  status             text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title          text,
  seo_description    text,
  created_by         uuid references auth.users (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  published_at       timestamptz
);

create index if not exists properties_status_idx      on public.properties (status);
create index if not exists properties_transaction_idx  on public.properties (transaction_type);
create index if not exists properties_type_idx         on public.properties (property_type);
create index if not exists properties_city_idx         on public.properties (city);
create index if not exists properties_price_idx        on public.properties (price);
create index if not exists properties_area_idx         on public.properties (living_area);
create index if not exists properties_created_at_idx   on public.properties (created_at desc);
create index if not exists properties_featured_idx     on public.properties (is_featured) where status = 'published';

-- ---------------------------------------------------------------------------
-- Property gallery images
-- ---------------------------------------------------------------------------
create table if not exists public.property_images (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  url         text not null,
  path        text,
  alt         text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists property_images_property_idx
  on public.property_images (property_id, sort_order);

-- ---------------------------------------------------------------------------
-- Services (editable from the dashboard)
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 2 and 160),
  description  text,
  icon         text,
  image_url    text,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists services_sort_idx on public.services (sort_order);

-- ---------------------------------------------------------------------------
-- Global site settings (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                       integer primary key default 1 check (id = 1),
  agency_name              text not null default 'Agenzia Immobiliare',
  tagline                  text,
  logo_url                 text,
  logo_path                text,
  accent_color             text not null default '#8A6A45',
  accent_color_dark        text not null default '#6B5236',
  hero_eyebrow             text,
  hero_headline            text not null default 'Spazi che meritano di essere raccontati',
  hero_subheadline         text,
  hero_image_url           text,
  hero_image_path          text,
  hero_primary_label       text not null default 'Sfoglia gli immobili',
  hero_primary_href        text not null default '/immobili',
  hero_secondary_label     text,
  hero_secondary_href      text,
  intro_title              text,
  intro_body               text,
  intro_image_url          text,
  about_title              text,
  about_body               text,
  about_image_url          text,
  services_title           text,
  services_subtitle        text,
  contact_title            text,
  contact_intro            text,
  contact_email            text,
  contact_phone            text,
  contact_address          text,
  opening_hours            text,
  social_facebook          text,
  social_instagram         text,
  social_linkedin          text,
  social_youtube           text,
  footer_note              text,
  seo_default_title        text not null default 'Agenzia Immobiliare â€” Immobili in vendita e in affitto',
  seo_default_description  text,
  seo_keywords             text,
  updated_at               timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Inquiries and valuation requests
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id                      uuid primary key default gen_random_uuid(),
  property_id             uuid references public.properties (id) on delete set null,
  type                    text not null default 'general' check (type in ('general', 'property', 'valuation')),
  name                    text not null check (char_length(name) between 2 and 120),
  email                   text not null check (char_length(email) between 3 and 200),
  phone                   text,
  message                 text check (message is null or char_length(message) <= 4000),
  valuation_address       text check (valuation_address is null or char_length(valuation_address) <= 300),
  valuation_property_type text,
  valuation_size          numeric(10, 2),
  valuation_timeframe     text,
  status                  text not null default 'new' check (status in ('new', 'in_progress', 'handled')),
  source_page             text,
  created_at              timestamptz not null default now()
);

create index if not exists inquiries_status_idx  on public.inquiries (status);
create index if not exists inquiries_created_idx on public.inquiries (created_at desc);
create index if not exists inquiries_property_idx on public.inquiries (property_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- published_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' then
    if tg_op = 'INSERT' then
      new.published_at := coalesce(new.published_at, now());
    elsif old.status is distinct from 'published' or new.published_at is null then
      new.published_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists properties_set_published_at on public.properties;
create trigger properties_set_published_at
  before insert or update on public.properties
  for each row execute function public.set_published_at();

-- =============================================================================
-- 0002_rls.sql
-- Row Level Security. This is the authoritative security boundary: the
-- browser only ever holds the publishable key, so every rule below is enforced
-- by PostgreSQL regardless of what the frontend does.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- is_admin()
-- SECURITY DEFINER so it can read public.admins without re-entering RLS
-- (which would cause infinite recursion in the admins policies).
-- `set search_path = ''` forces fully-qualified names, preventing search_path
-- hijacking. EXECUTE is granted to anon/authenticated so policies can call it.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- admins
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;

drop policy if exists "admins readable by self or admins" on public.admins;
create policy "admins readable by self or admins"
  on public.admins
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- No insert/update/delete policies: administrators are provisioned manually
-- (SQL editor / service role), so nobody can grant themselves access.

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
alter table public.properties enable row level security;

drop policy if exists "published properties are public" on public.properties;
create policy "published properties are public"
  on public.properties
  for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists "admins insert properties" on public.properties;
create policy "admins insert properties"
  on public.properties
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admins update properties" on public.properties;
create policy "admins update properties"
  on public.properties
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete properties" on public.properties;
create policy "admins delete properties"
  on public.properties
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- property_images
-- ---------------------------------------------------------------------------
alter table public.property_images enable row level security;

drop policy if exists "images of published properties are public" on public.property_images;
create policy "images of published properties are public"
  on public.property_images
  for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'published'
    )
  );

drop policy if exists "admins insert images" on public.property_images;
create policy "admins insert images"
  on public.property_images
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admins update images" on public.property_images;
create policy "admins update images"
  on public.property_images
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete images" on public.property_images;
create policy "admins delete images"
  on public.property_images
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
alter table public.services enable row level security;

drop policy if exists "published services are public" on public.services;
create policy "published services are public"
  on public.services
  for select
  to anon, authenticated
  using (is_published or public.is_admin());

drop policy if exists "admins insert services" on public.services;
create policy "admins insert services"
  on public.services
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admins update services" on public.services;
create policy "admins update services"
  on public.services
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete services" on public.services;
create policy "admins delete services"
  on public.services
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- site_settings
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;

drop policy if exists "site settings are public" on public.site_settings;
create policy "site settings are public"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "admins insert site settings" on public.site_settings;
create policy "admins insert site settings"
  on public.site_settings
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admins update site settings" on public.site_settings;
create policy "admins update site settings"
  on public.site_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- inquiries
-- Anyone may submit an inquiry; only admins may read or manage them.
-- ---------------------------------------------------------------------------
alter table public.inquiries enable row level security;

drop policy if exists "anyone can submit an inquiry" on public.inquiries;
create policy "anyone can submit an inquiry"
  on public.inquiries
  for insert
  to anon, authenticated
  with check (
    char_length(name) between 2 and 120
    and char_length(email) between 3 and 200
    and (message is null or char_length(message) <= 4000)
    and status = 'new'
  );

drop policy if exists "admins read inquiries" on public.inquiries;
create policy "admins read inquiries"
  on public.inquiries
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins update inquiries" on public.inquiries;
create policy "admins update inquiries"
  on public.inquiries
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete inquiries" on public.inquiries;
create policy "admins delete inquiries"
  on public.inquiries
  for delete
  to authenticated
  using (public.is_admin());

-- =============================================================================
-- 0003_storage.sql
-- Public-read bucket for property media with admin-only write access.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-media',
  'property-media',
  true,
  52428800, -- 50 MB hard ceiling; the app enforces smaller limits per media type
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read for listing media.
drop policy if exists "property media is publicly readable" on storage.objects;
create policy "property media is publicly readable"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'property-media');

-- Only administrators can upload, replace or delete media.
drop policy if exists "admins upload property media" on storage.objects;
create policy "admins upload property media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'property-media' and public.is_admin());

drop policy if exists "admins update property media" on storage.objects;
create policy "admins update property media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'property-media' and public.is_admin())
  with check (bucket_id = 'property-media' and public.is_admin());

drop policy if exists "admins delete property media" on storage.objects;
create policy "admins delete property media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'property-media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- A second, private bucket for the agency logo is intentionally NOT created.
-- The logo is a single small image and lives in the same public bucket under
-- the `branding/` prefix.
-- ---------------------------------------------------------------------------
