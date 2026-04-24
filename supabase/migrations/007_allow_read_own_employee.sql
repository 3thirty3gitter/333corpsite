-- Allow users to read their own employee record
CREATE POLICY "Users can read own employee record"
  ON employees
  FOR SELECT
  USING (
    email = auth.jwt()->>'email'
  );
