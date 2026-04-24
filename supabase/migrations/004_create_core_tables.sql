-- Create core application tables

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees
    WHERE email = auth.jwt()->>'email'
    AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  category text,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training Modules
CREATE TABLE IF NOT EXISTS training_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text,
  duration_minutes integer,
  created_at timestamptz DEFAULT now()
);

-- User Training Progress
CREATE TABLE IF NOT EXISTS user_training_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid REFERENCES training_modules(id) ON DELETE CASCADE,
  status text DEFAULT 'Not Started',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- Quick Links
CREATE TABLE IF NOT EXISTS quick_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  category text,
  icon text,
  is_sso boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price decimal(10, 2),
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert notifications" ON notifications FOR INSERT WITH CHECK (is_admin());

-- Knowledge Base Policies
CREATE POLICY "Auth users can read kb" ON knowledge_base_articles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can all kb" ON knowledge_base_articles FOR ALL USING (is_admin());

-- Training Policies
CREATE POLICY "Auth users can read training" ON training_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can all training" ON training_modules FOR ALL USING (is_admin());

-- Training Progress Policies
CREATE POLICY "Users can read own progress" ON user_training_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_training_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can all progress" ON user_training_progress FOR ALL USING (is_admin());

-- Documents Policies
CREATE POLICY "Auth users can read docs" ON documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can all docs" ON documents FOR ALL USING (is_admin());

-- Quick Links Policies
CREATE POLICY "Auth users can read links" ON quick_links FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can all links" ON quick_links FOR ALL USING (is_admin());

-- Products Policies
CREATE POLICY "Auth users can read products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can all products" ON products FOR ALL USING (is_admin());
