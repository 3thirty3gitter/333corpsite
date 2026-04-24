-- Add supplier integration columns to products table
-- Also create supplier_settings table

-- Add new columns to existing products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT 'Apparel';
ALTER TABLE products ADD COLUMN IF NOT EXISTS msrp_currency text DEFAULT 'CAD';
ALTER TABLE products ADD COLUMN IF NOT EXISTS msrp_value text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS options jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Index for common queries (use IF NOT EXISTS pattern)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Update products RLS policy for public read
DROP POLICY IF EXISTS "Anyone can read active products" ON products;
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  USING (active = true OR active IS NULL);

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  USING (is_admin());

-- Supplier settings table for API credentials
CREATE TABLE IF NOT EXISTS supplier_settings (
  id text PRIMARY KEY,
  enabled boolean DEFAULT false,
  credentials jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on supplier_settings
ALTER TABLE supplier_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access supplier settings
DROP POLICY IF EXISTS "Admins can manage supplier settings" ON supplier_settings;
CREATE POLICY "Admins can manage supplier settings"
  ON supplier_settings
  FOR ALL
  USING (is_admin());

-- Insert default Momentec settings row
INSERT INTO supplier_settings (id, enabled)
VALUES ('momentec', false)
ON CONFLICT (id) DO NOTHING;
