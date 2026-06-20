-- Allow updating catalog brand rows (admin)

DROP POLICY IF EXISTS "catalog_phone_brands_update" ON catalog_phone_brands;
CREATE POLICY "catalog_phone_brands_update"
  ON catalog_phone_brands FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "catalog_device_brands_update" ON catalog_device_brands;
CREATE POLICY "catalog_device_brands_update"
  ON catalog_device_brands FOR UPDATE
  USING (true)
  WITH CHECK (true);
