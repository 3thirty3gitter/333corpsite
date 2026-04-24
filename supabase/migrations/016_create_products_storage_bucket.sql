-- Create a storage bucket for product images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Set up access policies
-- Allow public read access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- Allow authenticated users to update
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
create policy "Authenticated users can update"
  on storage.objects for update
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- Allow authenticated users to delete
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
create policy "Authenticated users can delete"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );
