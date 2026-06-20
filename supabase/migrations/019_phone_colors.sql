-- Phone color options + product storage/color fields

CREATE TABLE IF NOT EXISTS catalog_phone_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  hex_color TEXT NOT NULL DEFAULT '#64748b',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS storage TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT;

CREATE INDEX IF NOT EXISTS idx_products_phone_storage ON products (storage)
  WHERE category = 'phones' AND storage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_phone_color ON products (color)
  WHERE category = 'phones' AND color IS NOT NULL;

ALTER TABLE catalog_phone_colors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_phone_colors_select" ON catalog_phone_colors;
DROP POLICY IF EXISTS "catalog_phone_colors_insert" ON catalog_phone_colors;
DROP POLICY IF EXISTS "catalog_phone_colors_update" ON catalog_phone_colors;
DROP POLICY IF EXISTS "catalog_phone_colors_delete" ON catalog_phone_colors;
CREATE POLICY "catalog_phone_colors_select" ON catalog_phone_colors FOR SELECT USING (true);
CREATE POLICY "catalog_phone_colors_insert" ON catalog_phone_colors FOR INSERT WITH CHECK (true);
CREATE POLICY "catalog_phone_colors_update" ON catalog_phone_colors FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "catalog_phone_colors_delete" ON catalog_phone_colors FOR DELETE USING (true);

INSERT INTO catalog_phone_colors (label, hex_color, sort_order)
SELECT v.label, v.hex_color, v.sort_order
FROM (
  VALUES
    ('Black', '#1a1a1a', 0),
    ('White', '#f5f5f5', 1),
    ('Blue', '#2563eb', 2),
    ('Pink', '#ec4899', 3),
    ('Green', '#22c55e', 4),
    ('Gold', '#d4af37', 5),
    ('Silver', '#c0c0c0', 6),
    ('Purple', '#7c3aed', 7),
    ('Red', '#ef4444', 8),
    ('Natural Titanium', '#e8dcc8', 9)
) AS v(label, hex_color, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM catalog_phone_colors LIMIT 1);
