-- Migration 023: Pricing Rule Presets
CREATE TABLE IF NOT EXISTS markup_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add profile_id to markup_rules
ALTER TABLE markup_rules ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES markup_profiles(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE markup_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for markup_profiles
CREATE POLICY "Admins can manage markup profiles"
  ON markup_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE email = auth.jwt()->>'email' AND role = 'Admin'
    )
  );

CREATE POLICY "All employees can read markup profiles"
  ON markup_profiles FOR SELECT
  USING (true);

-- Insert a default profile
INSERT INTO markup_profiles (name, description, is_active)
VALUES ('Standard Markup', 'Default pricing rules with standard 50% margins.', true);

-- Update existing rules to point to this profile
UPDATE markup_rules SET profile_id = (SELECT id FROM markup_profiles WHERE name = 'Standard Markup') WHERE profile_id IS NULL;

-- Create an alternative profile (e.g., Aggressive Growth)
INSERT INTO markup_profiles (name, description, is_active)
VALUES ('Aggressive Growth', 'Lower margins for high volume competition.', false);
