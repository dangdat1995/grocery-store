-- ================================================
-- Cửa Hàng Tạp Hoá Online - Initial Schema
-- ================================================

-- Categories (Danh mục sản phẩm)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products (Sản phẩm)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,              -- VND (no decimals)
  compare_at_price BIGINT,            -- Giá gốc (hiển thị giảm giá)
  unit TEXT NOT NULL DEFAULT 'kg',    -- kg, goi, chai, hop, etc.
  stock_quantity INT NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  weight_grams INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product Images (Ảnh sản phẩm)
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

-- User Profiles (Hồ sơ người dùng - extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Addresses (Sổ địa chỉ)
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT DEFAULT 'home',          -- home, work, other
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,       -- Số nhà, tên đường
  ward TEXT NOT NULL,                 -- Phường/Xã
  district TEXT NOT NULL,             -- Quận/Huyện
  city TEXT NOT NULL DEFAULT 'Hồ Chí Minh',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery Zones (Vùng giao hàng)
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_distance_km NUMERIC NOT NULL,
  max_distance_km NUMERIC NOT NULL,
  fee BIGINT NOT NULL,                -- VND
  is_active BOOLEAN DEFAULT true
);

-- Orders (Đơn hàng)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  address_id UUID REFERENCES addresses(id),
  delivery_zone_id UUID REFERENCES delivery_zones(id),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'
  )),
  payment_method TEXT CHECK (payment_method IN ('cod', 'vnpay', 'momo')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'paid', 'refunded', 'failed'
  )),
  subtotal BIGINT NOT NULL,
  delivery_fee BIGINT NOT NULL DEFAULT 0,
  discount BIGINT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL,
  delivery_address TEXT,              -- Snapshot địa chỉ giao
  delivery_lat DOUBLE PRECISION,
  delivery_lng DOUBLE PRECISION,
  delivery_distance_km NUMERIC,
  note TEXT,                          -- Ghi chú: "giao buổi chiều"
  estimated_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items (Chi tiết đơn hàng)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  product_name TEXT NOT NULL,         -- Snapshot tên SP lúc đặt
  product_price BIGINT NOT NULL,      -- Snapshot giá lúc đặt
  quantity INT NOT NULL,
  subtotal BIGINT NOT NULL
);

-- ================================================
-- Indexes
-- ================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('simple', name));

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
