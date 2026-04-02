-- ================================================
-- Branch Products - Sản phẩm theo chi nhánh
-- ================================================

-- Branch-specific product availability & pricing
CREATE TABLE branch_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  stock_quantity INT DEFAULT 0,
  price_override BIGINT,           -- NULL = dùng giá gốc sản phẩm
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(branch_id, product_id)
);

-- Indexes
CREATE INDEX idx_branch_products_branch ON branch_products(branch_id) WHERE is_available = true;
CREATE INDEX idx_branch_products_product ON branch_products(product_id);

-- RLS
ALTER TABLE branch_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read branch_products" ON branch_products FOR SELECT USING (true);
CREATE POLICY "Admin manage branch_products" ON branch_products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
