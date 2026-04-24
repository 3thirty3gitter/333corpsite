-- Employees table for application users (not Supabase auth users) --
CREATE TABLE IF NOT EXISTS employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  role text NOT NULL DEFAULT 'Viewer',
  created_at timestamptz DEFAULT now()
);
