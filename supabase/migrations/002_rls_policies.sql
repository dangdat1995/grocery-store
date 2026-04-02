-- ================================================
-- Row Level Security Policies
-- ================================================

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ================================================
-- PROFILES
-- ================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ================================================
-- CATEGORIES
-- ================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin());

-- ================================================
-- PRODUCTS
-- ================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin());

-- ================================================
-- PRODUCT IMAGES
-- ================================================
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  USING (is_admin());

-- ================================================
-- ADDRESSES
-- ================================================
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can manage own addresses"
  ON addresses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (user_id = auth.uid());

-- ================================================
-- DELIVERY ZONES
-- ================================================
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Delivery zones are viewable by everyone"
  ON delivery_zones FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage delivery zones"
  ON delivery_zones FOR ALL
  USING (is_admin());

-- ================================================
-- ORDERS
-- ================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending orders"
  ON orders FOR UPDATE
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR is_admin()
  );

-- ================================================
-- ORDER ITEMS
-- ================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can insert order items for own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
