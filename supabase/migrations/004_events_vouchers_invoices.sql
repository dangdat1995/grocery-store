-- ================================================
-- Events (Sự kiện khuyến mãi)
-- ================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  banner_url TEXT,
  discount_type TEXT CHECK (discount_type IN ('percent', 'fixed')),
  discount_value BIGINT DEFAULT 0,         -- % hoặc VND tuỳ type
  min_order_amount BIGINT DEFAULT 0,       -- Đơn tối thiểu
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event-Product mapping (SP tham gia sự kiện)
CREATE TABLE event_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  sale_price BIGINT,                        -- Giá KM riêng cho SP trong event
  UNIQUE(event_id, product_id)
);

-- ================================================
-- Vouchers (Mã giảm giá)
-- ================================================
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,               -- VD: GIAM20K, FREESHIP
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'free_ship')),
  discount_value BIGINT NOT NULL DEFAULT 0, -- % hoặc VND
  max_discount BIGINT,                      -- Giảm tối đa (cho loại %)
  min_order_amount BIGINT DEFAULT 0,        -- Đơn tối thiểu
  usage_limit INT DEFAULT 0,                -- 0 = không giới hạn
  used_count INT DEFAULT 0,
  per_user_limit INT DEFAULT 1,             -- Mỗi user dùng tối đa
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Voucher usage tracking
CREATE TABLE voucher_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount BIGINT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- Invoices (Hoá đơn)
-- ================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,      -- HD-20260401-001
  order_id UUID REFERENCES orders(id) NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT,
  buyer_address TEXT,
  buyer_tax_code TEXT,                      -- MST (nếu có)
  subtotal BIGINT NOT NULL,
  delivery_fee BIGINT NOT NULL DEFAULT 0,
  discount BIGINT NOT NULL DEFAULT 0,
  tax_amount BIGINT NOT NULL DEFAULT 0,     -- VAT
  total BIGINT NOT NULL,
  note TEXT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add voucher_id to orders
ALTER TABLE orders ADD COLUMN voucher_id UUID REFERENCES vouchers(id);
ALTER TABLE orders ADD COLUMN voucher_discount BIGINT DEFAULT 0;

-- ================================================
-- Indexes
-- ================================================
CREATE INDEX idx_events_active ON events(is_active) WHERE is_active = true;
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_event_products_event ON event_products(event_id);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_active ON vouchers(is_active) WHERE is_active = true;
CREATE INDEX idx_voucher_usages_user ON voucher_usages(user_id);
CREATE INDEX idx_invoices_order ON invoices(order_id);

-- ================================================
-- RLS Policies
-- ================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by everyone" ON events FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage events" ON events FOR ALL USING (is_admin());

ALTER TABLE event_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event products viewable by everyone" ON event_products FOR SELECT USING (true);
CREATE POLICY "Admins manage event products" ON event_products FOR ALL USING (is_admin());

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active vouchers viewable by authenticated" ON vouchers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage vouchers" ON vouchers FOR ALL USING (is_admin());

ALTER TABLE voucher_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own voucher usage" ON voucher_usages FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users create own usage" ON voucher_usages FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own invoices" ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = invoices.order_id AND (orders.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "Admins manage invoices" ON invoices FOR ALL USING (is_admin());

-- ================================================
-- Functions
-- ================================================

-- Generate invoice number: HD-YYYYMMDD-001
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  today_date TEXT;
  inv_count INT;
BEGIN
  today_date := to_char(NOW(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO inv_count FROM invoices WHERE issued_at::date = CURRENT_DATE;
  RETURN 'HD-' || today_date || '-' || LPAD(inv_count::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto updated_at triggers
CREATE TRIGGER trigger_events_updated BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_vouchers_updated BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
