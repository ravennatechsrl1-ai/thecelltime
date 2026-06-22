-- Order fulfillment workflow for admin panel

ALTER TABLE shop_orders DROP CONSTRAINT IF EXISTS shop_orders_status_check;

ALTER TABLE shop_orders
  ADD CONSTRAINT shop_orders_status_check
  CHECK (
    status IN (
      'pending',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    )
  );

ALTER TABLE shop_orders
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_shop_orders_status_created
  ON shop_orders (status, created_at DESC);
