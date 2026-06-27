-- Allow admins to hide products from the storefront without deleting them.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS frozen BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_frozen ON products (frozen)
  WHERE frozen = true;

COMMENT ON COLUMN products.frozen IS 'When true, product is hidden from the public shop but kept in admin and database.';
