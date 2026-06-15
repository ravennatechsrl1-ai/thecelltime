-- Product promotions: percentage discount off the listed price
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS promotion_percent INTEGER
    CHECK (promotion_percent IS NULL OR (promotion_percent > 0 AND promotion_percent <= 100));

CREATE INDEX IF NOT EXISTS idx_products_promotion_percent
  ON products (promotion_percent)
  WHERE promotion_percent IS NOT NULL;
