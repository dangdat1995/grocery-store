-- ================================================
-- Store Settings & Multi-Branch Support
-- ================================================

-- Store Settings (Cài đặt cửa hàng)
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'Tạp Hoá Online'),
  ('store_phone', '0901234567'),
  ('store_email', 'lienhe@taphoaonline.vn'),
  ('store_description', 'Cửa hàng tạp hoá online - Giao hàng tận nơi'),
  ('store_logo_url', NULL),
  ('store_address', 'TP. Hồ Chí Minh'),
  ('bank_name', 'Vietcombank'),
  ('bank_account_number', '1234567890'),
  ('bank_account_name', 'TAP HOA ONLINE'),
  ('bank_branch', 'Chi nhánh Hồ Chí Minh'),
  ('max_delivery_radius_km', '20'),
  ('opening_time', '06:00'),
  ('closing_time', '21:00'),
  ('facebook_url', ''),
  ('zalo_phone', '');

-- Branches (Chi nhánh cửa hàng)
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  ward TEXT,
  district TEXT,
  city TEXT DEFAULT 'Hồ Chí Minh',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  delivery_radius_km NUMERIC NOT NULL DEFAULT 20,
  opening_time TEXT DEFAULT '06:00',
  closing_time TEXT DEFAULT '21:00',
  is_main BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  manager_name TEXT,
  manager_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default main branch
INSERT INTO branches (name, slug, phone, address, district, city, latitude, longitude, delivery_radius_km, is_main, is_active)
VALUES ('Chi nhánh chính', 'chi-nhanh-chinh', '0901234567', '123 Nguyễn Huệ', 'Quận 1', 'Hồ Chí Minh', 10.7769, 106.7009, 20, true, true);

-- Add branch_id to orders
ALTER TABLE orders ADD COLUMN branch_id UUID REFERENCES branches(id);

-- Add bank_transfer to payment_method check
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cod', 'vnpay', 'momo', 'bank_transfer'));

-- Indexes
CREATE INDEX idx_branches_active ON branches(is_active) WHERE is_active = true;
CREATE INDEX idx_branches_main ON branches(is_main) WHERE is_main = true;
CREATE INDEX idx_store_settings_key ON store_settings(key);

-- RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read store_settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage store_settings" ON store_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Admin manage branches" ON branches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
