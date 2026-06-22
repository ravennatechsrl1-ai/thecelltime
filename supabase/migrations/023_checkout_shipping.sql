-- Delivery address + PaymentIntent tracking for custom checkout

ALTER TABLE shop_orders
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_orders_stripe_payment_intent_id
  ON shop_orders (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
