
-- Create documents storage bucket
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Set up storage policies for documents
DROP POLICY IF EXISTS "Public Access Documents" ON storage.objects;
create policy "Public Access Documents"
  on storage.objects for select
  using ( bucket_id = 'documents' );

DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
create policy "Admins can upload documents"
  on storage.objects for insert
  with check ( bucket_id = 'documents' AND (
    SELECT role FROM employees WHERE email = auth.jwt()->>'email'
  ) = 'Admin' );

DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;
create policy "Admins can delete documents"
  on storage.objects for delete
  using ( bucket_id = 'documents' AND (
    SELECT role FROM employees WHERE email = auth.jwt()->>'email'
  ) = 'Admin' );

-- Update documents table to match the UI needs
ALTER TABLE documents ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_important boolean DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
