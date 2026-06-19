-- Protection products: device hierarchy + subtype
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IN ('phones', 'accessories', 'other', 'protection'));

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS protection_device_type TEXT,
  ADD COLUMN IF NOT EXISTS protection_brand_slug TEXT,
  ADD COLUMN IF NOT EXISTS protection_model_slug TEXT,
  ADD COLUMN IF NOT EXISTS protection_series TEXT,
  ADD COLUMN IF NOT EXISTS protection_subtype TEXT;

CREATE INDEX IF NOT EXISTS idx_products_protection_lookup
  ON products (category, protection_device_type, protection_brand_slug, protection_model_slug)
  WHERE category = 'protection';
