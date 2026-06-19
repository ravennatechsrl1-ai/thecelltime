-- Hierarchical accessories: device tree + accessory subtype
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS accessory_device_type TEXT,
  ADD COLUMN IF NOT EXISTS accessory_brand_slug TEXT,
  ADD COLUMN IF NOT EXISTS accessory_model_slug TEXT,
  ADD COLUMN IF NOT EXISTS accessory_series TEXT,
  ADD COLUMN IF NOT EXISTS accessory_subtype TEXT;

CREATE INDEX IF NOT EXISTS idx_products_accessory_lookup
  ON products (category, accessory_device_type, accessory_brand_slug, accessory_model_slug)
  WHERE category = 'accessories' AND accessory_device_type IS NOT NULL;
