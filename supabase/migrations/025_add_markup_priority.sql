-- Migration 025: Add priority column to markup_rules
ALTER TABLE markup_rules ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;

-- Create an index on priority for sorting
CREATE INDEX IF NOT EXISTS idx_markup_rules_priority ON markup_rules(priority DESC);
