-- Migration 022: Document Versioning
CREATE TABLE IF NOT EXISTS document_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  file_url text NOT NULL,
  file_size text,
  file_type text,
  changes_summary text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

-- Enable RLS
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Auth users can read document versions"
  ON document_versions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage document versions"
  ON document_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE email = auth.jwt()->>'email' AND role = 'Admin'
    )
  );

-- Update documents table to include current version info if needed (optional)
-- For now, we'll just keep the latest version info in the documents table as well 
-- to maintain backward compatibility with the existing UI.
