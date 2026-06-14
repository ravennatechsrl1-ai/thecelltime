-- TheCellTime — Orders, customers & analytics for admin dashboard
-- Run in Supabase SQL Editor after 001_initial_schema.sql

CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at ON shop_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders (status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_email ON shop_orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_order_id ON shop_order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_product_id ON shop_order_items (product_id);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders readable"
  ON shop_orders FOR SELECT USING (true);

CREATE POLICY "Orders insertable"
  ON shop_orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders updatable"
  ON shop_orders FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Order items readable"
  ON shop_order_items FOR SELECT USING (true);

CREATE POLICY "Order items insertable"
  ON shop_order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Shop users readable"
  ON shop_users FOR SELECT USING (true);

CREATE POLICY "Shop users insertable"
  ON shop_users FOR INSERT WITH CHECK (true);

-- Allow product stock updates after sales
CREATE POLICY "Prodotti aggiornabili"
  ON products FOR UPDATE USING (true) WITH CHECK (true);
