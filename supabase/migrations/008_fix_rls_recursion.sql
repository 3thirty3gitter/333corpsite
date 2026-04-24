-- Fix infinite recursion in RLS policies by using a security definer function

-- Create a function to check if the current user is an admin
-- SECURITY DEFINER ensures this runs with owner privileges, bypassing RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees
    WHERE email = auth.jwt()->>'email'
    AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Admins can read employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON employees;

-- Re-create policies using the function
CREATE POLICY "Admins can read employees"
  ON employees
  FOR SELECT
  USING ( is_admin() );

CREATE POLICY "Admins can insert employees"
  ON employees
  FOR INSERT
  WITH CHECK ( is_admin() );

CREATE POLICY "Admins can update employees"
  ON employees
  FOR UPDATE
  USING ( is_admin() );

CREATE POLICY "Admins can delete employees"
  ON employees
  FOR DELETE
  USING ( is_admin() );
