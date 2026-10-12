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
