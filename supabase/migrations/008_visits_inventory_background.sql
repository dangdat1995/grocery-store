-- 008: Page visits tracking, inventory management (batch/expiry), background settings, event media

-- Page visit tracking
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  page TEXT NOT NULL DEFAULT '/',
  visit_count INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  UNIQUE(date, page)
);
CREATE INDEX IF NOT EXISTS idx_page_visits_date ON page_visits(date);

-- Add visit counts to analytics_daily
ALTER TABLE analytics_daily ADD COLUMN IF NOT EXISTS page_views INT DEFAULT 0;
ALTER TABLE analytics_daily ADD COLUMN IF NOT EXISTS unique_visitors INT DEFAULT 0;

-- Category icon (emoji)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;

-- Product purchase options (retail / wholesale)
ALTER TABLE products ADD COLUMN IF NOT EXISTS bulk_unit TEXT; -- e.g. 'thung' (case/box)
ALTER TABLE products ADD COLUMN IF NOT EXISTS bulk_quantity INT; -- items per case, e.g. 24
ALTER TABLE products ADD COLUMN IF NOT EXISTS bulk_price BIGINT; -- price per case

-- Inventory management
CREATE TABLE IF NOT EXISTS inventory_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  batch_code TEXT, -- e.g. LOT-20260401
  quantity INT NOT NULL DEFAULT 0,
  remaining INT NOT NULL DEFAULT 0,
  cost_price BIGINT DEFAULT 0, -- giá nhập
  manufacture_date DATE,
  expiry_date DATE,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inventory_batch_product ON inventory_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batch_expiry ON inventory_batches(expiry_date);

-- Inventory transactions log
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES inventory_batches(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'import', 'export', 'adjustment', 'expired', 'return'
  quantity INT NOT NULL, -- positive = in, negative = out
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_product ON inventory_transactions(product_id);

-- Event media (banner images, videos)
ALTER TABLE events ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]';
-- media format: [{type: 'image'|'video', url: '...', alt: '...'}]

-- Background settings (already stored in store_settings key-value, just documenting keys)
-- Keys: bg_type ('color'|'gradient'|'image'|'video'), bg_color, bg_gradient_from, bg_gradient_to, bg_image_url, bg_video_url, bg_overlay_opacity

-- RLS
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_page_visits" ON page_visits FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_inventory_batches" ON inventory_batches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "admin_all_inventory_tx" ON inventory_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
