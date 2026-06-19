-- Admin-managed repair service types (issue + base estimate)

CREATE TABLE IF NOT EXISTS catalog_repair_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  base_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO catalog_repair_types (slug, label, base_price, sort_order)
VALUES
  ('screen', 'Schermo Rotto', 89, 0),
  ('battery', 'Sostituzione Batteria', 59, 1),
  ('charging', 'Connettore di Ricarica', 49, 2)
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_catalog_repair_types_active
  ON catalog_repair_types (is_active, sort_order);

ALTER TABLE catalog_repair_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_repair_types_select" ON catalog_repair_types;
DROP POLICY IF EXISTS "catalog_repair_types_insert" ON catalog_repair_types;
DROP POLICY IF EXISTS "catalog_repair_types_update" ON catalog_repair_types;
DROP POLICY IF EXISTS "catalog_repair_types_delete" ON catalog_repair_types;

CREATE POLICY "catalog_repair_types_select" ON catalog_repair_types
  FOR SELECT USING (true);

CREATE POLICY "catalog_repair_types_insert" ON catalog_repair_types
  FOR INSERT WITH CHECK (true);

CREATE POLICY "catalog_repair_types_update" ON catalog_repair_types
  FOR UPDATE USING (true);

CREATE POLICY "catalog_repair_types_delete" ON catalog_repair_types
  FOR DELETE USING (true);
