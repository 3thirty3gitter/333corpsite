-- Create a basic test table used for health checks and seeding
CREATE TABLE IF NOT EXISTS pilot_test (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
