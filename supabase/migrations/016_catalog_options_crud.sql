-- Allow updating/deleting all admin catalog option tables

DROP POLICY IF EXISTS "catalog_phone_conditions_update" ON catalog_phone_conditions;
DROP POLICY IF EXISTS "catalog_phone_conditions_delete" ON catalog_phone_conditions;
CREATE POLICY "catalog_phone_conditions_update" ON catalog_phone_conditions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "catalog_phone_conditions_delete" ON catalog_phone_conditions FOR DELETE USING (true);

DROP POLICY IF EXISTS "catalog_phone_storage_update" ON catalog_phone_storage;
DROP POLICY IF EXISTS "catalog_phone_storage_delete" ON catalog_phone_storage;
CREATE POLICY "catalog_phone_storage_update" ON catalog_phone_storage FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "catalog_phone_storage_delete" ON catalog_phone_storage FOR DELETE USING (true);

DROP POLICY IF EXISTS "catalog_phone_models_update" ON catalog_phone_models;
DROP POLICY IF EXISTS "catalog_phone_models_delete" ON catalog_phone_models;
CREATE POLICY "catalog_phone_models_update" ON catalog_phone_models FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "catalog_phone_models_delete" ON catalog_phone_models FOR DELETE USING (true);

DROP POLICY IF EXISTS "catalog_device_series_update" ON catalog_device_series;
DROP POLICY IF EXISTS "catalog_device_series_delete" ON catalog_device_series;
CREATE POLICY "catalog_device_series_update" ON catalog_device_series FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "catalog_device_series_delete" ON catalog_device_series FOR DELETE USING (true);

DROP POLICY IF EXISTS "catalog_device_models_update" ON catalog_device_models;
DROP POLICY IF EXISTS "catalog_device_models_delete" ON catalog_device_models;
CREATE POLICY "catalog_device_models_update" ON catalog_device_models FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "catalog_device_models_delete" ON catalog_device_models FOR DELETE USING (true);
