-- Add avatar_url column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for avatars bucket
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Admins can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.jwt()->>'email' IN (SELECT email FROM employees WHERE role = 'Admin')
);

CREATE POLICY "Admins can update avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.jwt()->>'email' IN (SELECT email FROM employees WHERE role = 'Admin')
);

CREATE POLICY "Admins can delete avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.jwt()->>'email' IN (SELECT email FROM employees WHERE role = 'Admin')
);
