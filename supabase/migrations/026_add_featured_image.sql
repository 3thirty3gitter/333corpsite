-- Migration 026: Add featured_image column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_image text;

-- Create an index for querying by featured image
CREATE INDEX IF NOT EXISTS idx_products_featured_image ON products(featured_image) WHERE featured_image IS NOT NULL;
