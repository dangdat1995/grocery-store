-- ================================================
-- Database Functions & Triggers
-- ================================================

-- Generate order number: GH-20260401-001
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  today_date TEXT;
  order_count INT;
  new_number TEXT;
BEGIN
  today_date := to_char(NOW(), 'YYYYMMDD');

  SELECT COUNT(*) + 1 INTO order_count
  FROM orders
  WHERE created_at::date = CURRENT_DATE;

  new_number := 'GH-' || today_date || '-' || LPAD(order_count::TEXT, 3, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-set order_number before insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_products_updated
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_categories_updated
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Calculate delivery fee from distance
CREATE OR REPLACE FUNCTION get_delivery_fee(distance_km NUMERIC)
RETURNS BIGINT AS $$
DECLARE
  fee BIGINT;
BEGIN
  SELECT dz.fee INTO fee
  FROM delivery_zones dz
  WHERE dz.is_active = true
    AND distance_km >= dz.min_distance_km
    AND distance_km <= dz.max_distance_km
  LIMIT 1;

  RETURN fee;
END;
$$ LANGUAGE plpgsql;

-- Search products by name (Vietnamese text)
CREATE OR REPLACE FUNCTION search_products(search_query TEXT)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE is_active = true
    AND (
      name ILIKE '%' || search_query || '%'
      OR to_tsvector('simple', name) @@ plainto_tsquery('simple', search_query)
    )
  ORDER BY
    CASE WHEN name ILIKE search_query || '%' THEN 0 ELSE 1 END,
    name
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
