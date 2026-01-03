-- Create portfolio_categories table
CREATE TABLE IF NOT EXISTS portfolio_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_label TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to categories"
  ON portfolio_categories
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage categories
CREATE POLICY "Allow authenticated users to insert categories"
  ON portfolio_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categories"
  ON portfolio_categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete categories"
  ON portfolio_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default categories
INSERT INTO portfolio_categories (name, slug, display_label, thumbnail_url, display_order) VALUES
  ('all', 'all', 'All', '', 0),
  ('wedding', 'wedding', 'Wedding', '', 1),
  ('pre-wedding', 'pre-wedding', 'Pre-Wedding', '', 2),
  ('baby-shower-maternity', 'baby-shower-maternity', 'Baby Shower & Maternity', '', 3),
  ('birthdays-family', 'birthdays-family', 'Birthdays & Family', '', 4),
  ('drone', 'drone', 'Drone Shoot', '', 5),
  ('model-candid', 'model-candid', 'Model & Candid', '', 6)
ON CONFLICT (slug) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolio_categories_updated_at
  BEFORE UPDATE ON portfolio_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
