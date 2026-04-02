// Core types for the grocery store
// Replace with `npx supabase gen types typescript` when connected

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "packed"
  | "waiting_pickup"
  | "delivering"
  | "delivered"
  | "returned"
  | "refunded"
  | "cancelled";

export type PaymentMethod = "cod" | "vnpay" | "momo" | "bank_transfer";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";
export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  total_orders?: number;
  total_spent?: number;
  points_balance?: number;
  loyalty_tier?: string;
  last_order_at?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  unit: string;
  stock_quantity: number;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  weight_grams: number | null;
  bulk_unit: string | null; // e.g. 'thùng', 'lốc'
  bulk_quantity: number | null; // items per case
  bulk_price: number | null; // price per case
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  ward: string;
  district: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  min_distance_km: number;
  max_distance_km: number;
  fee: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  address_id: string | null;
  delivery_zone_id: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_distance_km: number | null;
  note: string | null;
  estimated_delivery_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  buyMode?: "retail" | "bulk"; // lẻ hoặc thùng
}

// Events (Sự kiện khuyến mãi)
export type DiscountType = "percent" | "fixed" | "free_ship";

export interface EventMedia {
  type: "image" | "video";
  url: string;
  alt?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  media: EventMedia[];
  created_at: string;
  updated_at: string;
  products?: EventProduct[];
}

export interface EventProduct {
  id: string;
  event_id: string;
  product_id: string;
  sale_price: number | null;
  product?: Product;
}

// Vouchers (Mã giảm giá)
export interface Voucher {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number;
  usage_limit: number;
  used_count: number;
  per_user_limit: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoucherUsage {
  id: string;
  voucher_id: string;
  user_id: string;
  order_id: string | null;
  discount_amount: number;
  used_at: string;
}

// Store Settings
export interface StoreSetting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

// Branches (Chi nhánh)
export interface Branch {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string;
  ward: string | null;
  district: string | null;
  city: string;
  latitude: number;
  longitude: number;
  delivery_radius_km: number;
  opening_time: string;
  closing_time: string;
  is_main: boolean;
  is_active: boolean;
  manager_name: string | null;
  manager_phone: string | null;
  created_at: string;
  updated_at: string;
}

// Invoices (Hoá đơn)
export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  buyer_name: string;
  buyer_phone: string | null;
  buyer_address: string | null;
  buyer_tax_code: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  tax_amount: number;
  total: number;
  note: string | null;
  issued_at: string;
  created_at: string;
  order?: Order;
}

// Combos (Bán combo)
export interface Combo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  combo_price: number;
  original_price: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  items?: ComboItem[];
}

export interface ComboItem {
  id: string;
  combo_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

// Gift Promotions (Quà tặng khuyến mãi)
export type GiftConditionType = "any_product" | "min_amount" | "specific_product" | "specific_category";

export interface GiftPromotion {
  id: string;
  name: string;
  description: string | null;
  condition_type: GiftConditionType;
  condition_value: string | null;  // product_id, category_id, or min amount
  min_quantity: number;            // min qty of trigger product
  min_order_amount: number;        // min order total
  gift_product_id: string | null;
  gift_description: string;        // e.g. "Tặng 1 chai nước mắm"
  gift_quantity: number;
  gift_image_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number;
  used_count: number;
  created_at: string;
  updated_at: string;
  gift_product?: Product;
}

// Loyalty Points (Tích điểm)
export type PointsTransactionType = "earn" | "redeem" | "bonus" | "expire" | "adjust";

export interface PointsTransaction {
  id: string;
  user_id: string;
  type: PointsTransactionType;
  points: number; // positive for earn, negative for redeem
  balance_after: number;
  order_id: string | null;
  description: string;
  created_at: string;
}

// Staff & Permissions (Quản trị viên & Phân quyền)
export type StaffRole = "super_admin" | "branch_manager" | "staff";

export type AdminModule =
  | "dashboard"
  | "products"
  | "categories"
  | "inventory"
  | "orders"
  | "payments"
  | "events"
  | "combos"
  | "gifts"
  | "vouchers"
  | "customers"
  | "branches"
  | "accounts"
  | "settings";

export interface StaffMember {
  id: string;
  user_id: string;
  staff_role: StaffRole;
  display_name: string | null;
  position: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  user?: Profile & { email?: string };
  branches?: StaffBranch[];
  permissions?: StaffPermission[];
}

export interface StaffBranch {
  id: string;
  staff_id: string;
  branch_id: string;
  is_primary: boolean;
  assigned_at: string;
  branch?: Branch;
}

export interface StaffPermission {
  id: string;
  staff_id: string;
  module: AdminModule;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}
