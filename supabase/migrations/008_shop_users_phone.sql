-- Customer phone collected at signup
ALTER TABLE shop_users
  ADD COLUMN IF NOT EXISTS phone TEXT;
