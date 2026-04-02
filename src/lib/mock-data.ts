// Mock data for demo mode (when Supabase is not connected)

export const MOCK_CATEGORIES = [
  { id: "c1", name: "Rau củ quả", slug: "rau-cu-qua", description: "Rau củ tươi mỗi ngày", image_url: null, parent_id: null, sort_order: 1, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "c2", name: "Trái cây", slug: "trai-cay", description: "Trái cây nhập tươi", image_url: null, parent_id: null, sort_order: 2, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "c3", name: "Thịt tươi", slug: "thit-tuoi", description: "Thịt heo, bò, gà tươi", image_url: null, parent_id: null, sort_order: 3, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "c4", name: "Hải sản", slug: "hai-san", description: "Hải sản tươi sống", image_url: null, parent_id: null, sort_order: 4, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "c5", name: "Sữa & Bơ", slug: "sua-va-bo", description: "Sữa tươi, sữa chua, bơ", image_url: null, parent_id: null, sort_order: 5, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "c6", name: "Đồ khô", slug: "do-kho", description: "Gạo, mì, bún, miến", image_url: null, parent_id: null, sort_order: 6, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "c7", name: "Gia vị", slug: "gia-vi", description: "Nước mắm, dầu ăn, gia vị", image_url: null, parent_id: null, sort_order: 7, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "c8", name: "Đồ uống", slug: "do-uong", description: "Nước ngọt, trà, cà phê", image_url: null, parent_id: null, sort_order: 8, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "c9", name: "Bánh kẹo", slug: "banh-keo", description: "Bánh, kẹo, snack", image_url: null, parent_id: null, sort_order: 9, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "c10", name: "Đồ đông lạnh", slug: "do-dong-lanh", description: "Thực phẩm đông lạnh", image_url: null, parent_id: null, sort_order: 10, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
];

export const MOCK_PRODUCTS = [
  // Rau củ quả
  { id: "p1", category_id: "c1", name: "Rau muống", slug: "rau-muong", description: "Rau muống tươi, bó 300g. Rau được thu hoạch trong ngày, đảm bảo tươi xanh.", price: 8000, compare_at_price: 12000, unit: "bo", stock_quantity: 100, sku: "RAU001", is_active: true, is_featured: true, weight_grams: 300, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[0], images: [] },
  { id: "p2", category_id: "c1", name: "Cà chua", slug: "ca-chua", description: "Cà chua Đà Lạt, 500g. Cà chua chín đỏ, ngọt tự nhiên.", price: 25000, compare_at_price: null, unit: "kg", stock_quantity: 80, sku: "RAU002", is_active: true, is_featured: false, weight_grams: 500, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[0], images: [] },
  { id: "p3", category_id: "c1", name: "Khoai tây Đà Lạt", slug: "khoai-tay-da-lat", description: "Khoai tây Đà Lạt sạch, 1kg. Khoai vỏ mỏng, ruột vàng.", price: 35000, compare_at_price: 42000, unit: "kg", stock_quantity: 60, sku: "RAU003", is_active: true, is_featured: true, weight_grams: 1000, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[0], images: [] },
  { id: "p4", category_id: "c1", name: "Bắp cải", slug: "bap-cai", description: "Bắp cải xanh tươi, 1 cái (~800g)", price: 18000, compare_at_price: null, unit: "cai", stock_quantity: 50, sku: "RAU004", is_active: true, is_featured: false, weight_grams: 800, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[0], images: [] },
  // Trái cây
  { id: "p5", category_id: "c2", name: "Chuối già Nam Mỹ", slug: "chuoi-gia-nam-my", description: "Chuối già hương thơm, nải ~1kg", price: 32000, compare_at_price: null, unit: "kg", stock_quantity: 70, sku: "TC001", is_active: true, is_featured: true, weight_grams: 1000, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[1], images: [] },
  { id: "p6", category_id: "c2", name: "Cam sành", slug: "cam-sanh", description: "Cam sành Vĩnh Long ngọt, 1kg (~5-6 trái)", price: 45000, compare_at_price: 55000, unit: "kg", stock_quantity: 55, sku: "TC002", is_active: true, is_featured: true, weight_grams: 1000, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[1], images: [] },
  { id: "p7", category_id: "c2", name: "Xoài cát Hoà Lộc", slug: "xoai-cat-hoa-loc", description: "Xoài cát ngọt lịm, 1kg (~2-3 trái)", price: 75000, compare_at_price: 90000, unit: "kg", stock_quantity: 30, sku: "TC003", is_active: true, is_featured: false, weight_grams: 1000, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[1], images: [] },
  // Thịt tươi
  { id: "p8", category_id: "c3", name: "Thịt ba chỉ heo", slug: "thit-ba-chi-heo", description: "Thịt ba chỉ heo tươi, 500g. Thịt mềm, vân mỡ đều.", price: 85000, compare_at_price: null, unit: "kg", stock_quantity: 40, sku: "TH001", is_active: true, is_featured: true, weight_grams: 500, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[2], images: [] },
  { id: "p9", category_id: "c3", name: "Ức gà phi lê", slug: "uc-ga-phi-le", description: "Ức gà phi lê sạch, 500g. Giàu protein, ít mỡ.", price: 65000, compare_at_price: 75000, unit: "kg", stock_quantity: 45, sku: "TH002", is_active: true, is_featured: false, weight_grams: 500, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[2], images: [] },
  { id: "p10", category_id: "c3", name: "Sườn non bò Úc", slug: "suon-non-bo-uc", description: "Sườn non bò Úc nhập khẩu, 500g", price: 195000, compare_at_price: 230000, unit: "kg", stock_quantity: 20, sku: "TH003", is_active: true, is_featured: true, weight_grams: 500, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[2], images: [] },
  // Hải sản
  { id: "p11", category_id: "c4", name: "Tôm sú", slug: "tom-su", description: "Tôm sú tươi sống, 500g (~15-20 con)", price: 145000, compare_at_price: null, unit: "kg", stock_quantity: 25, sku: "HS001", is_active: true, is_featured: true, weight_grams: 500, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[3], images: [] },
  { id: "p12", category_id: "c4", name: "Cá hồi fillet", slug: "ca-hoi-fillet", description: "Cá hồi Na Uy fillet, 300g", price: 175000, compare_at_price: 199000, unit: "kg", stock_quantity: 15, sku: "HS002", is_active: true, is_featured: false, weight_grams: 300, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[3], images: [] },
  // Sữa & Bơ
  { id: "p13", category_id: "c5", name: "Sữa tươi TH True Milk 1L", slug: "sua-tuoi-th-1l", description: "Sữa tươi tiệt trùng TH True Milk, hộp 1 lít", price: 32000, compare_at_price: null, unit: "hop", stock_quantity: 100, sku: "SB001", is_active: true, is_featured: true, weight_grams: 1050, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[4], images: [] },
  { id: "p14", category_id: "c5", name: "Sữa chua Vinamilk lốc 4", slug: "sua-chua-vinamilk-loc-4", description: "Sữa chua có đường Vinamilk, lốc 4 hộp", price: 28000, compare_at_price: 32000, unit: "goi", stock_quantity: 80, sku: "SB002", is_active: true, is_featured: false, weight_grams: 400, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[4], images: [] },
  // Đồ khô
  { id: "p15", category_id: "c6", name: "Gạo ST25", slug: "gao-st25", description: "Gạo ST25 Sóc Trăng - gạo ngon nhất thế giới, túi 5kg", price: 135000, compare_at_price: 160000, unit: "bich", stock_quantity: 50, sku: "DK001", is_active: true, is_featured: true, weight_grams: 5000, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[5], images: [] },
  { id: "p16", category_id: "c6", name: "Mì Hảo Hảo thùng 30 gói", slug: "mi-hao-hao-thung-30", description: "Mì Hảo Hảo tôm chua cay, thùng 30 gói", price: 105000, compare_at_price: 120000, unit: "hop", stock_quantity: 35, sku: "DK002", is_active: true, is_featured: true, weight_grams: 2250, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[5], images: [] },
  // Gia vị
  { id: "p17", category_id: "c7", name: "Nước mắm Phú Quốc 500ml", slug: "nuoc-mam-phu-quoc-500ml", description: "Nước mắm nhĩ Phú Quốc 40 độ đạm, chai 500ml", price: 55000, compare_at_price: null, unit: "chai", stock_quantity: 60, sku: "GV001", is_active: true, is_featured: false, weight_grams: 550, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[6], images: [] },
  { id: "p18", category_id: "c7", name: "Dầu ăn Tường An 1L", slug: "dau-an-tuong-an-1l", description: "Dầu ăn thực vật Tường An, chai 1 lít", price: 42000, compare_at_price: 48000, unit: "chai", stock_quantity: 70, sku: "GV002", is_active: true, is_featured: false, weight_grams: 920, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[6], images: [] },
  // Đồ uống
  { id: "p19", category_id: "c8", name: "Trà xanh 0 độ 500ml", slug: "tra-xanh-0-do-500ml", description: "Trà xanh không độ, chai 500ml", price: 10000, compare_at_price: null, unit: "chai", stock_quantity: 200, sku: "DU001", is_active: true, is_featured: false, weight_grams: 530, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[7], images: [] },
  { id: "p20", category_id: "c8", name: "Cà phê G7 hộp 18 gói", slug: "ca-phe-g7-hop-18", description: "Cà phê hoà tan G7 3in1, hộp 18 gói x 16g", price: 52000, compare_at_price: 60000, unit: "hop", stock_quantity: 55, sku: "DU002", is_active: true, is_featured: true, weight_grams: 288, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[7], images: [] },
  // Bánh kẹo
  { id: "p21", category_id: "c9", name: "Bánh Oreo hộp 133g", slug: "banh-oreo-hop-133g", description: "Bánh Oreo socola kem vani, hộp 133g", price: 25000, compare_at_price: null, unit: "hop", stock_quantity: 90, sku: "BK001", is_active: true, is_featured: false, weight_grams: 133, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[8], images: [] },
  { id: "p22", category_id: "c9", name: "Kẹo dẻo Haribo 80g", slug: "keo-deo-haribo-80g", description: "Kẹo dẻo trái cây Haribo Goldbears, gói 80g", price: 22000, compare_at_price: 28000, unit: "goi", stock_quantity: 65, sku: "BK002", is_active: true, is_featured: false, weight_grams: 80, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[8], images: [] },
  // Đồ đông lạnh
  { id: "p23", category_id: "c10", name: "Há cảo tôm thịt 500g", slug: "ha-cao-tom-thit-500g", description: "Há cảo tôm thịt đông lạnh, gói 500g (~20 cái)", price: 68000, compare_at_price: 78000, unit: "goi", stock_quantity: 30, sku: "DL001", is_active: true, is_featured: true, weight_grams: 500, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[9], images: [] },
  { id: "p24", category_id: "c10", name: "Xúc xích Đức Việt 500g", slug: "xuc-xich-duc-viet-500g", description: "Xúc xích tiệt trùng Đức Việt, gói 500g", price: 55000, compare_at_price: null, unit: "goi", stock_quantity: 45, sku: "DL002", is_active: true, is_featured: false, weight_grams: 500, created_at: "2024-01-01", updated_at: "2024-01-01", category: MOCK_CATEGORIES[9], images: [] },
];

// Branch-product availability: each branch has different products
// b1 (Q1) = full range, b2 (Q7) = no seafood/frozen, b3 (Thu Duc) = limited range
export const MOCK_BRANCH_PRODUCTS: Record<string, { product_id: string; is_available: boolean; stock_quantity: number; price_override: number | null }[]> = {
  b1: [
    // Q1 main branch — has everything
    ...["p1","p2","p3","p4","p5","p6","p7","p8","p9","p10","p11","p12","p13","p14","p15","p16","p17","p18","p19","p20","p21","p22","p23","p24"].map(id => ({ product_id: id, is_available: true, stock_quantity: 50, price_override: null })),
  ],
  b2: [
    // Q7 — no seafood (p11,p12), no frozen (p23,p24), some price differences
    ...["p1","p2","p3","p5","p6","p8","p9","p13","p14","p15","p16","p17","p18","p19","p20","p21","p22"].map(id => ({ product_id: id, is_available: true, stock_quantity: 30, price_override: null })),
    { product_id: "p4", is_available: true, stock_quantity: 20, price_override: 20000 }, // bắp cải giá khác
    { product_id: "p7", is_available: true, stock_quantity: 10, price_override: 80000 }, // xoài giá khác
    { product_id: "p10", is_available: true, stock_quantity: 5, price_override: 205000 }, // sườn bò giá khác
  ],
  b3: [
    // Thủ Đức — limited: only vegetables, fruits, meat, staples, drinks
    ...["p1","p2","p3","p4","p5","p6","p8","p9","p15","p16","p17","p18","p19","p20"].map(id => ({ product_id: id, is_available: true, stock_quantity: 25, price_override: null })),
    { product_id: "p7", is_available: true, stock_quantity: 8, price_override: 72000 }, // xoài rẻ hơn
    { product_id: "p13", is_available: true, stock_quantity: 40, price_override: 30000 }, // sữa rẻ hơn
  ],
};

export const MOCK_DELIVERY_ZONES = [
  { id: "dz1", name: "Gần (0-5km)", min_distance_km: 0, max_distance_km: 5, fee: 0, is_active: true },
  { id: "dz2", name: "Trung bình (5-10km)", min_distance_km: 5, max_distance_km: 10, fee: 20000, is_active: true },
  { id: "dz3", name: "Xa (10-15km)", min_distance_km: 10, max_distance_km: 15, fee: 35000, is_active: true },
  { id: "dz4", name: "Rất xa (15-20km)", min_distance_km: 15, max_distance_km: 20, fee: 50000, is_active: true },
];
