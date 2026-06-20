-- Allow deleting catalog brand rows (admin)

DROP POLICY IF EXISTS "catalog_phone_brands_delete" ON catalog_phone_brands;
CREATE POLICY "catalog_phone_brands_delete"
  ON catalog_phone_brands FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "catalog_device_brands_delete" ON catalog_device_brands;
CREATE POLICY "catalog_device_brands_delete"
  ON catalog_device_brands FOR DELETE
  USING (true);
