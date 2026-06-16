-- Customer address collected at signup
ALTER TABLE shop_users
  ADD COLUMN IF NOT EXISTS address TEXT;
