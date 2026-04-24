-- Fix admin account setup
-- The problem: RLS policies have circular dependency

-- Step 1: Temporarily disable RLS to fix the data
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Step 2: Ensure trent@3thirty3.ca exists as Admin
INSERT INTO employees (email, name, role) 
VALUES ('trent@3thirty3.ca', 'Trent Timmerman', 'Admin') 
ON CONFLICT (email) DO UPDATE SET role = 'Admin', name = 'Trent Timmerman';

-- Step 3: Drop ALL existing SELECT policies to start fresh
DROP POLICY IF EXISTS "Admins can read employees" ON employees;
DROP POLICY IF EXISTS "Users can read own employee record" ON employees;
DROP POLICY IF EXISTS "Admins can read all employees" ON employees;

-- Step 4: Create proper non-circular policies
-- Policy 1: ANY authenticated user can read their OWN employee record
-- This is necessary so users can check their own role without being admin first
CREATE POLICY "Users can read own employee record"
  ON employees
  FOR SELECT
  USING (email = auth.jwt()->>'email');

-- Policy 2: Admins can read ALL employee records
-- Uses SECURITY DEFINER function to avoid circular dependency
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees 
    WHERE email = auth.jwt()->>'email' 
    AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can read all employees"
  ON employees
  FOR SELECT
  USING (is_admin());

-- Step 5: Re-enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
