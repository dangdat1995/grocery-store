-- 007: Shipping tracking, analytics, customer loyalty

-- Add shipping tracking fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_carrier TEXT DEFAULT 'store'; -- store, ghn, ghtk, viettel_post, j&t, custom
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS preparing_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_at TIMESTAMPTZ;

-- Order status history for timeline tracking
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);

-- Customer loyalty: total orders, total spent
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_orders INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_spent BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'new'; -- new, bronze, silver, gold, platinum
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS note TEXT; -- admin notes

-- Voucher distribution log
CREATE TABLE IF NOT EXISTS voucher_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'event_auto', 'loyalty_reward', 'manual'
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voucher_id, user_id) -- prevent duplicate distribution
);
CREATE INDEX IF NOT EXISTS idx_voucher_dist_user ON voucher_distributions(user_id);

-- Store analytics daily snapshots
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_orders INT DEFAULT 0,
  total_revenue BIGINT DEFAULT 0,
  total_customers INT DEFAULT 0,
  new_customers INT DEFAULT 0,
  avg_order_value BIGINT DEFAULT 0,
  top_products JSONB DEFAULT '[]', -- [{product_id, name, quantity, revenue}]
  orders_by_status JSONB DEFAULT '{}', -- {pending: 5, confirmed: 3, ...}
  orders_by_payment JSONB DEFAULT '{}', -- {cod: 3, vnpay: 2, ...}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update customer loyalty stats after order delivered
CREATE OR REPLACE FUNCTION update_customer_loyalty()
RETURNS TRIGGER AS $$
DECLARE
  v_total_orders INT;
  v_total_spent BIGINT;
  v_tier TEXT;
BEGIN
  -- Only run when order is delivered
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Calculate totals
    SELECT COUNT(*), COALESCE(SUM(total), 0)
    INTO v_total_orders, v_total_spent
    FROM orders
    WHERE user_id = NEW.user_id AND status = 'delivered';

    -- Determine tier
    v_tier := CASE
      WHEN v_total_orders >= 50 OR v_total_spent >= 20000000 THEN 'platinum'
      WHEN v_total_orders >= 20 OR v_total_spent >= 10000000 THEN 'gold'
      WHEN v_total_orders >= 10 OR v_total_spent >= 5000000 THEN 'silver'
      WHEN v_total_orders >= 3 OR v_total_spent >= 1000000 THEN 'bronze'
      ELSE 'new'
    END;

    -- Update profile
    UPDATE profiles SET
      total_orders = v_total_orders,
      total_spent = v_total_spent,
      loyalty_tier = v_tier,
      last_order_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_loyalty ON orders;
CREATE TRIGGER trigger_update_loyalty
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_loyalty();

-- RLS for new tables
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_status_history" ON order_status_history FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "user_read_own_status_history" ON order_status_history FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

CREATE POLICY "admin_all_voucher_dist" ON voucher_distributions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "user_read_own_voucher_dist" ON voucher_distributions FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "admin_all_analytics" ON analytics_daily FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
