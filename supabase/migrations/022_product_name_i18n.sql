-- Localized product titles (Italian + English)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name_i18n JSONB;

ALTER TABLE phone_listings
  ADD COLUMN IF NOT EXISTS base_name_i18n JSONB;

UPDATE products
SET name_i18n = jsonb_build_object('it', name, 'en', name)
WHERE name_i18n IS NULL;

UPDATE phone_listings
SET base_name_i18n = jsonb_build_object('it', base_name, 'en', base_name)
WHERE base_name_i18n IS NULL;
