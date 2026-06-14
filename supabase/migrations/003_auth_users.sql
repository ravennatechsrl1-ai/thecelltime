-- Link shop_users to Supabase Auth users
ALTER TABLE shop_users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_shop_users_auth_user_id ON shop_users (auth_user_id);

-- Users can read/update their own profile row
CREATE POLICY "Shop users read own profile"
  ON shop_users FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Shop users insert own profile"
  ON shop_users FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Shop users update own profile"
  ON shop_users FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);