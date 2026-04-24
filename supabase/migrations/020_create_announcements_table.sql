
-- Announcements table for the internal dashboard
CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Auth users can read announcements" ON announcements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE email = auth.jwt()->>'email'
    AND role = 'Admin'
  )
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed some initial announcements
INSERT INTO announcements (title, content, priority)
VALUES 
('Welcome to PilotSuite 2025!', 'Our new internal portal is now live with training resources and document library.', 'normal'),
('New Feature: SinaLite Pricing', 'SinaLite product prices are now automatically marked up for internal quoting.', 'normal'),
('Scheduled Maintenance', 'The system will be offline for 1 hour this Saturday at 10 PM EST for backend updates.', 'high');
