-- Enable Row Level Security on employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all employees
CREATE POLICY "Admins can read employees"
  ON employees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE email = auth.jwt()->>'email'
      AND role = 'Admin'
    )
  );

-- Policy: Admins can insert employees
CREATE POLICY "Admins can insert employees"
  ON employees
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE email = auth.jwt()->>'email'
      AND role = 'Admin'
    )
  );

-- Policy: Admins can update employees
CREATE POLICY "Admins can update employees"
  ON employees
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE email = auth.jwt()->>'email'
      AND role = 'Admin'
    )
  );

-- Policy: Admins can delete employees
CREATE POLICY "Admins can delete employees"
  ON employees
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE email = auth.jwt()->>'email'
      AND role = 'Admin'
    )
  );

-- Enable Row Level Security on pilot_test table
ALTER TABLE pilot_test ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read pilot_test
CREATE POLICY "Authenticated users can read pilot_test"
  ON pilot_test
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Admins can insert into pilot_test
CREATE POLICY "Admins can insert pilot_test"
  ON pilot_test
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE email = auth.jwt()->>'email'
      AND role = 'Admin'
    )
  );

-- Policy: Admins can delete from pilot_test
CREATE POLICY "Admins can delete pilot_test"
  ON pilot_test
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE email = auth.jwt()->>'email'
      AND role = 'Admin'
    )
  );

-- Create index on employees email for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
