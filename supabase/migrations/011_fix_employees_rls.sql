-- Fix employees RLS - ensure users can read their own record
-- Drop ALL existing select policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can read employees" ON employees;
DROP POLICY IF EXISTS "Users can read own employee record" ON employees;
DROP POLICY IF EXISTS "Admins can read all employees" ON employees;

-- Policy: Users can read their own employee record (needed to check their role)
CREATE POLICY "Users can read own employee record"
  ON employees
  FOR SELECT
  USING (email = auth.jwt()->>'email');

-- Policy: Admins can read ALL employee records  
CREATE POLICY "Admins can read all employees"
  ON employees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt()->>'email'
      AND e.role = 'Admin'
    )
  );
