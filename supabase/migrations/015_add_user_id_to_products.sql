-- Add user_id column to products table if it doesn't exist
-- This column is required by the production database
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Note: We don't force NOT NULL here in the migration to avoid failing on existing rows,
-- but the production DB seems to have it. The application code will now provide it.
