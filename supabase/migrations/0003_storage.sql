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
