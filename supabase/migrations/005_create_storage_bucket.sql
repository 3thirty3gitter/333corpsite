-- Create a storage bucket for quick link icons if it doesn't exist
insert into storage.buckets (id, name, public)
values ('quick_link_icons', 'quick_link_icons', true)
on conflict (id) do nothing;

-- Set up access policies
-- Allow public read access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'quick_link_icons' );

-- Allow authenticated users to upload
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'quick_link_icons' and auth.role() = 'authenticated' );
