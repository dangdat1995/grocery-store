-- ================================================
-- Seed Data - Cửa Hàng Tạp Hoá Online
-- ================================================

-- Delivery Zones (Vùng giao hàng)
INSERT INTO delivery_zones (name, min_distance_km, max_distance_km, fee) VALUES
  ('Miễn phí giao hàng', 0, 5, 0),
  ('Vùng 5-10km', 5, 10, 20000),
  ('Vùng 10-15km', 10, 15, 35000),
  ('Vùng 15-20km', 15, 20, 50000);

-- Categories (Danh mục)
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Rau củ quả', 'rau-cu-qua', 1),
  ('Trái cây', 'trai-cay', 2),
  ('Thịt tươi', 'thit-tuoi', 3),
  ('Hải sản', 'hai-san', 4),
  ('Trứng & Sữa', 'trung-va-sua', 5),
  ('Đồ khô', 'do-kho', 6),
  ('Gia vị', 'gia-vi', 7),
  ('Đồ uống', 'do-uong', 8),
  ('Bánh kẹo', 'banh-keo', 9),
  ('Đồ đông lạnh', 'do-dong-lanh', 10);

-- Sample Products (Sản phẩm mẫu)
-- Rau củ quả
INSERT INTO products (name, slug, category_id, price, compare_at_price, unit, stock_quantity, is_active, is_featured) VALUES
  ('Rau muống', 'rau-muong', (SELECT id FROM categories WHERE slug = 'rau-cu-qua'), 15000, NULL, 'bó', 50, true, true),
  ('Cà chua', 'ca-chua', (SELECT id FROM categories WHERE slug = 'rau-cu-qua'), 25000, 30000, 'kg', 30, true, false),
  ('Khoai tây', 'khoai-tay', (SELECT id FROM categories WHERE slug = 'rau-cu-qua'), 20000, NULL, 'kg', 40, true, false),
  ('Bắp cải', 'bap-cai', (SELECT id FROM categories WHERE slug = 'rau-cu-qua'), 18000, NULL, 'kg', 25, true, false),
  ('Hành tây', 'hanh-tay', (SELECT id FROM categories WHERE slug = 'rau-cu-qua'), 22000, NULL, 'kg', 35, true, false);

-- Trái cây
INSERT INTO products (name, slug, category_id, price, compare_at_price, unit, stock_quantity, is_active, is_featured) VALUES
  ('Chuối già', 'chuoi-gia', (SELECT id FROM categories WHERE slug = 'trai-cay'), 20000, NULL, 'nải', 40, true, true),
  ('Dưa hấu', 'dua-hau', (SELECT id FROM categories WHERE slug = 'trai-cay'), 25000, 35000, 'trái', 20, true, true),
  ('Xoài cát', 'xoai-cat', (SELECT id FROM categories WHERE slug = 'trai-cay'), 45000, NULL, 'kg', 30, true, false),
  ('Cam sành', 'cam-sanh', (SELECT id FROM categories WHERE slug = 'trai-cay'), 35000, NULL, 'kg', 25, true, false);

-- Thịt tươi
INSERT INTO products (name, slug, category_id, price, compare_at_price, unit, stock_quantity, is_active, is_featured) VALUES
  ('Thịt ba chỉ heo', 'thit-ba-chi-heo', (SELECT id FROM categories WHERE slug = 'thit-tuoi'), 120000, NULL, 'kg', 20, true, true),
  ('Ức gà', 'uc-ga', (SELECT id FROM categories WHERE slug = 'thit-tuoi'), 85000, 95000, 'kg', 25, true, false),
  ('Sườn non heo', 'suon-non-heo', (SELECT id FROM categories WHERE slug = 'thit-tuoi'), 150000, NULL, 'kg', 15, true, true),
  ('Thịt bò phi lê', 'thit-bo-phi-le', (SELECT id FROM categories WHERE slug = 'thit-tuoi'), 280000, 320000, 'kg', 10, true, false);

-- Hải sản
INSERT INTO products (name, slug, category_id, price, compare_at_price, unit, stock_quantity, is_active, is_featured) VALUES
  ('Cá hồi phi lê', 'ca-hoi-phi-le', (SELECT id FROM categories WHERE slug = 'hai-san'), 250000, NULL, 'kg', 15, true, true),
  ('Tôm sú', 'tom-su', (SELECT id FROM categories WHERE slug = 'hai-san'), 180000, 200000, 'kg', 20, true, false),
  ('Mực ống', 'muc-ong', (SELECT id FROM categories WHERE slug = 'hai-san'), 150000, NULL, 'kg', 15, true, false);

-- Trứng & Sữa
INSERT INTO products (name, slug, category_id, price, compare_at_price, unit, stock_quantity, is_active, is_featured) VALUES
  ('Trứng gà ta (10 quả)', 'trung-ga-ta', (SELECT id FROM categories WHERE slug = 'trung-va-sua'), 35000, NULL, 'hộp', 50, true, true),
  ('Sữa TH True Milk 1L', 'sua-th-true-milk', (SELECT id FROM categories WHERE slug = 'trung-va-sua'), 32000, NULL, 'hộp', 40, true, false),
  ('Phô mai con bò cười', 'pho-mai-con-bo-cuoi', (SELECT id FROM categories WHERE slug = 'trung-va-sua'), 28000, NULL, 'hộp', 30, true, false);

-- Đồ khô & Gia vị
INSERT INTO products (name, slug, category_id, price, compare_at_price, unit, stock_quantity, is_active, is_featured) VALUES
  ('Gạo ST25 5kg', 'gao-st25', (SELECT id FROM categories WHERE slug = 'do-kho'), 85000, 95000, 'bao', 30, true, true),
  ('Nước mắm Phú Quốc', 'nuoc-mam-phu-quoc', (SELECT id FROM categories WHERE slug = 'gia-vi'), 45000, NULL, 'chai', 40, true, false),
  ('Dầu ăn Tường An 1L', 'dau-an-tuong-an', (SELECT id FROM categories WHERE slug = 'gia-vi'), 42000, NULL, 'chai', 35, true, false),
  ('Bột ngọt Ajinomoto', 'bot-ngot-ajinomoto', (SELECT id FROM categories WHERE slug = 'gia-vi'), 15000, NULL, 'gói', 50, true, false);

-- Đồ uống
INSERT INTO products (name, slug, category_id, price, compare_at_price, unit, stock_quantity, is_active, is_featured) VALUES
  ('Coca Cola 330ml', 'coca-cola-330ml', (SELECT id FROM categories WHERE slug = 'do-uong'), 10000, NULL, 'lon', 100, true, false),
  ('Trà xanh 0 độ', 'tra-xanh-0-do', (SELECT id FROM categories WHERE slug = 'do-uong'), 10000, NULL, 'chai', 80, true, false),
  ('Nước suối Lavie 500ml', 'nuoc-suoi-lavie', (SELECT id FROM categories WHERE slug = 'do-uong'), 5000, NULL, 'chai', 100, true, false);
