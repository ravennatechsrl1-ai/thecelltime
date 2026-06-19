-- Admin-managed catalog options (phones + device hierarchy for protection/accessories)

CREATE TABLE IF NOT EXISTS catalog_phone_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_phone_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES catalog_phone_brands(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_id, slug)
);

CREATE TABLE IF NOT EXISTS catalog_phone_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  shop_group TEXT NOT NULL DEFAULT 'new' CHECK (shop_group IN ('new', 'used')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_phone_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_device_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_type TEXT NOT NULL CHECK (device_type IN ('mobiles', 'tablets', 'computers', 'watch')),
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (device_type, slug)
);

CREATE TABLE IF NOT EXISTS catalog_device_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES catalog_device_brands(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_id, slug)
);

CREATE TABLE IF NOT EXISTS catalog_device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES catalog_device_series(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  is_recent BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (series_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_catalog_phone_models_brand ON catalog_phone_models (brand_id);
CREATE INDEX IF NOT EXISTS idx_catalog_device_series_brand ON catalog_device_series (brand_id);
CREATE INDEX IF NOT EXISTS idx_catalog_device_models_series ON catalog_device_models (series_id);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_condition_check;
