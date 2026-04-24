-- Create Markup Rules table
CREATE TABLE IF NOT EXISTS markup_rules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier text DEFAULT 'all', -- 'sinalite', 'momentec', or 'all'
    category text DEFAULT 'all',
    markup_type text DEFAULT 'percentage' CHECK (markup_type IN ('percentage', 'flat')),
    markup_value decimal(10, 2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE markup_rules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage markup rules" ON markup_rules 
    FOR ALL USING (EXISTS (
        SELECT 1 FROM employees 
        WHERE email = auth.jwt()->>'email' 
        AND role = 'Admin'
    ));

CREATE POLICY "All employees can read markup rules" ON markup_rules 
    FOR SELECT USING (true);

-- Insert a default rule (e.g., 50% markup on everything)
INSERT INTO markup_rules (supplier, category, markup_type, markup_value)
VALUES ('all', 'all', 'percentage', 50.00);
