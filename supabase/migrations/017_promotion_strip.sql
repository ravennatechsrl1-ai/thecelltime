-- Homepage promotion strip (dynamic text managed from admin)
CREATE TABLE IF NOT EXISTS promotion_strip (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  text TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO promotion_strip (id, text, enabled)
VALUES (1, '', false)
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS promotion_strip_updated_at ON promotion_strip;
CREATE TRIGGER promotion_strip_updated_at
  BEFORE UPDATE ON promotion_strip
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE promotion_strip ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promotion_strip_select" ON promotion_strip;
DROP POLICY IF EXISTS "promotion_strip_update" ON promotion_strip;
CREATE POLICY "promotion_strip_select" ON promotion_strip FOR SELECT USING (true);
CREATE POLICY "promotion_strip_update" ON promotion_strip FOR UPDATE USING (true) WITH CHECK (true);
