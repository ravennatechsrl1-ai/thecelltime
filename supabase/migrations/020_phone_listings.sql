-- Phone listings: one product with many storage/color variants
CREATE TABLE IF NOT EXISTS phone_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  phone_model TEXT NOT NULL,
  condition TEXT NOT NULL,
  base_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS phone_listing_id UUID REFERENCES phone_listings(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_products_phone_listing_id ON products (phone_listing_id)
  WHERE phone_listing_id IS NOT NULL;

ALTER TABLE phone_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "phone_listings_select" ON phone_listings;
DROP POLICY IF EXISTS "phone_listings_insert" ON phone_listings;
DROP POLICY IF EXISTS "phone_listings_update" ON phone_listings;
DROP POLICY IF EXISTS "phone_listings_delete" ON phone_listings;
CREATE POLICY "phone_listings_select" ON phone_listings FOR SELECT USING (true);
CREATE POLICY "phone_listings_insert" ON phone_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "phone_listings_update" ON phone_listings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "phone_listings_delete" ON phone_listings FOR DELETE USING (true);
