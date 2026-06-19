-- RLS for admin catalog tables (public read/write via anon — same as products admin)
-- Idempotent: safe to re-run if policies were already created (e.g. via MCP)

ALTER TABLE catalog_phone_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_phone_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_phone_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_phone_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_device_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_device_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_device_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_phone_brands_select" ON catalog_phone_brands;
DROP POLICY IF EXISTS "catalog_phone_brands_insert" ON catalog_phone_brands;
CREATE POLICY "catalog_phone_brands_select" ON catalog_phone_brands FOR SELECT USING (true);
CREATE POLICY "catalog_phone_brands_insert" ON catalog_phone_brands FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "catalog_phone_models_select" ON catalog_phone_models;
DROP POLICY IF EXISTS "catalog_phone_models_insert" ON catalog_phone_models;
CREATE POLICY "catalog_phone_models_select" ON catalog_phone_models FOR SELECT USING (true);
CREATE POLICY "catalog_phone_models_insert" ON catalog_phone_models FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "catalog_phone_conditions_select" ON catalog_phone_conditions;
DROP POLICY IF EXISTS "catalog_phone_conditions_insert" ON catalog_phone_conditions;
CREATE POLICY "catalog_phone_conditions_select" ON catalog_phone_conditions FOR SELECT USING (true);
CREATE POLICY "catalog_phone_conditions_insert" ON catalog_phone_conditions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "catalog_phone_storage_select" ON catalog_phone_storage;
DROP POLICY IF EXISTS "catalog_phone_storage_insert" ON catalog_phone_storage;
CREATE POLICY "catalog_phone_storage_select" ON catalog_phone_storage FOR SELECT USING (true);
CREATE POLICY "catalog_phone_storage_insert" ON catalog_phone_storage FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "catalog_device_brands_select" ON catalog_device_brands;
DROP POLICY IF EXISTS "catalog_device_brands_insert" ON catalog_device_brands;
CREATE POLICY "catalog_device_brands_select" ON catalog_device_brands FOR SELECT USING (true);
CREATE POLICY "catalog_device_brands_insert" ON catalog_device_brands FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "catalog_device_series_select" ON catalog_device_series;
DROP POLICY IF EXISTS "catalog_device_series_insert" ON catalog_device_series;
CREATE POLICY "catalog_device_series_select" ON catalog_device_series FOR SELECT USING (true);
CREATE POLICY "catalog_device_series_insert" ON catalog_device_series FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "catalog_device_models_select" ON catalog_device_models;
DROP POLICY IF EXISTS "catalog_device_models_insert" ON catalog_device_models;
CREATE POLICY "catalog_device_models_select" ON catalog_device_models FOR SELECT USING (true);
CREATE POLICY "catalog_device_models_insert" ON catalog_device_models FOR INSERT WITH CHECK (true);
