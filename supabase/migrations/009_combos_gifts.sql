-- Combos (bán combo sản phẩm)
CREATE TABLE IF NOT EXISTS combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  combo_price BIGINT NOT NULL,
  original_price BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(combo_id, product_id)
);

-- Gift promotions (quà tặng khuyến mãi)
CREATE TABLE IF NOT EXISTS gift_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  condition_type TEXT NOT NULL DEFAULT 'any_product',  -- any_product, min_amount, specific_product, specific_category
  condition_value TEXT,                                 -- product_id / category_id / min amount
  min_quantity INT DEFAULT 1,
  min_order_amount BIGINT DEFAULT 0,
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  gift_description TEXT NOT NULL,
  gift_quantity INT DEFAULT 1,
  gift_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  usage_limit INT DEFAULT 0,
  used_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read combos" ON combos FOR SELECT USING (true);
CREATE POLICY "Admin manage combos" ON combos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read combo_items" ON combo_items FOR SELECT USING (true);
CREATE POLICY "Admin manage combo_items" ON combo_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read gift_promotions" ON gift_promotions FOR SELECT USING (true);
CREATE POLICY "Admin manage gift_promotions" ON gift_promotions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
