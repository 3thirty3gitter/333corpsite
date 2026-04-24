-- Add source_id column to products table for supplier integrations
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_id text;

-- Index for source_id to speed up lookups
CREATE INDEX IF NOT EXISTS idx_products_source_id ON products(source_id);

-- Add unique constraint on (source, source_id) to prevent duplicates
-- But only if both are not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_source_source_id_unique ON products (source, source_id) WHERE source_id IS NOT NULL;

-- Insert default SinaLite settings row
INSERT INTO supplier_settings (id, enabled)
VALUES ('sinalite', false)
ON CONFLICT (id) DO NOTHING;
