// Store info
export const STORE_NAME = "Tạp Hoá Online";
export const STORE_DESCRIPTION =
  "Cửa hàng tạp hoá online - Giao hàng tận nơi trong bán kính 20km";
export const STORE_PHONE = "0901234567";
export const STORE_EMAIL = "lienhe@taphoaonline.vn";

// Store location (default HCM)
export const STORE_LAT = Number(process.env.NEXT_PUBLIC_STORE_LAT) || 10.7769;
export const STORE_LNG = Number(process.env.NEXT_PUBLIC_STORE_LNG) || 106.7009;
export const MAX_DELIVERY_RADIUS_KM = 20;

// Delivery fee tiers (VND)
export const DELIVERY_TIERS = [
  { maxKm: 5, fee: 0, label: "Miễn phí" },
  { maxKm: 10, fee: 20000, label: "20.000đ" },
  { maxKm: 15, fee: 35000, label: "35.000đ" },
  { maxKm: 20, fee: 50000, label: "50.000đ" },
] as const;

// Order statuses
export const ORDER_STATUSES = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "Đang chuẩn bị", color: "bg-purple-100 text-purple-800" },
  packed: { label: "Đã đóng gói", color: "bg-indigo-100 text-indigo-800" },
  waiting_pickup: { label: "Chờ lấy hàng", color: "bg-cyan-100 text-cyan-800" },
  delivering: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  returned: { label: "Hoàn trả", color: "bg-pink-100 text-pink-800" },
  refunded: { label: "Đã hoàn tiền", color: "bg-rose-100 text-rose-800" },
  cancelled: { label: "Đã huỷ", color: "bg-red-100 text-red-800" },
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  cod: { label: "Thanh toán khi nhận hàng (COD)", icon: "Banknote" },
  bank_transfer: { label: "Chuyển khoản ngân hàng", icon: "Landmark" },
  vnpay: { label: "VNPay", icon: "CreditCard" },
  momo: { label: "Ví MoMo", icon: "Wallet" },
} as const;

// Bank transfer info
export const BANK_INFO = {
  bank_name: "Vietcombank",
  bank_bin: "970436",
  account_number: "1234567890",
  account_name: "TAP HOA ONLINE",
  branch: "Chi nhánh Hồ Chí Minh",
} as const;

// Product units (retail)
export const PRODUCT_UNITS = [
  { value: "kg", label: "Kg" },
  { value: "g", label: "Gram" },
  { value: "cai", label: "Cái" },
  { value: "goi", label: "Gói" },
  { value: "chai", label: "Chai" },
  { value: "hop", label: "Hộp" },
  { value: "lon", label: "Lon" },
  { value: "bich", label: "Bịch" },
  { value: "trai", label: "Trái" },
  { value: "bo", label: "Bó" },
  { value: "lit", label: "Lít" },
  { value: "khay", label: "Khay" },
  { value: "vi", label: "Vỉ" },
  { value: "tuoi", label: "Túi" },
] as const;

// Bulk units (wholesale)
export const BULK_UNITS = [
  { value: "thung", label: "Thùng" },
  { value: "loc", label: "Lốc" },
  { value: "bao", label: "Bao" },
  { value: "ket", label: "Két" },
  { value: "hop_lon", label: "Hộp lớn" },
  { value: "can", label: "Can" },
] as const;

// Vietnamese grocery categories
export const DEFAULT_CATEGORIES = [
  { name: "Rau củ quả", slug: "rau-cu-qua" },
  { name: "Trái cây", slug: "trai-cay" },
  { name: "Thịt tươi", slug: "thit-tuoi" },
  { name: "Hải sản", slug: "hai-san" },
  { name: "Sữa & Bơ", slug: "sua-va-bo" },
  { name: "Đồ khô", slug: "do-kho" },
  { name: "Gia vị", slug: "gia-vi" },
  { name: "Đồ uống", slug: "do-uong" },
  { name: "Bánh kẹo", slug: "banh-keo" },
  { name: "Đồ đông lạnh", slug: "do-dong-lanh" },
] as const;

// Category icons (emoji) - grouped by type
export const CATEGORY_ICONS = [
  // Thực phẩm tươi
  "🥬", "🍊", "🥩", "🦐", "🥛", "🍜", "🧂", "☕", "🍪", "🧊",
  "🍎", "🥕", "🥚", "🍗", "🐟", "🧀", "🍚", "🫘", "🥜", "🧈",
  "🍞", "🌽", "🥥", "🍇", "🍌", "🥑", "🍋", "🍉", "🧃", "🍺",
  "🥤", "🫖", "🍵", "🍫", "🎂", "🍿", "🧁", "🍬", "🌶️", "🧄",
  // Gia dụng & Nhà cửa
  "🏠", "🛋️", "🪑", "🛏️", "🚿", "🪥", "🧹", "🧺", "🧽", "🪣",
  "🧴", "🧻", "💡", "🔌", "🪫", "🔋", "🕯️", "🪞", "🧲", "🔧",
  // Điện tử & Công nghệ
  "📱", "💻", "🖥️", "⌨️", "🖨️", "📷", "🎧", "🔊", "📺", "🎮",
  "⌚", "💾", "📡", "🔦", "🔌", "🪫", "🎙️", "📻", "🖱️", "💿",
  // Thời trang & Làm đẹp
  "👕", "👗", "👟", "👜", "🧢", "👒", "🕶️", "💄", "💅", "🧴",
  "👶", "🧤", "🧣", "👔", "👠", "🩴", "🎒", "💍", "⏱️", "🌂",
  // Thể thao & Sức khoẻ
  "⚽", "🏋️", "🧘", "🚴", "💊", "🩹", "🌡️", "🧪", "🩺", "💉",
  // Văn phòng phẩm & Giáo dục
  "📚", "✏️", "📓", "📐", "🖊️", "📎", "🗂️", "📌", "🎨", "🖍️",
  // Thú cưng
  "🐕", "🐈", "🐠", "🐹", "🦜", "🐾", "🦴", "🪺",
  // Mua sắm chung
  "🛍️", "🛒", "📦", "🏪", "🎁", "✨", "💧", "🌿", "♻️", "🏷️",
] as const;

// Discount types
export const DISCOUNT_TYPES = {
  percent: { label: "Giảm %", suffix: "%" },
  fixed: { label: "Giảm tiền", suffix: "đ" },
  free_ship: { label: "Miễn phí ship", suffix: "" },
} as const;

// VAT rate
export const VAT_RATE = 0; // 0% mặc định, set 0.08 cho 8% VAT nếu cần

// Loyalty Points System
export const POINTS_PER_1000 = 1; // 1 điểm cho mỗi 1.000đ chi tiêu
export const POINTS_VALUE = 10; // 1 điểm = 10đ khi quy đổi
export const MIN_REDEEM_POINTS = 10; // Tối thiểu 10 điểm để quy đổi
export const MAX_REDEEM_PERCENT = 50; // Tối đa dùng điểm trừ 50% đơn hàng

// Bonus points by tier
export const TIER_POINTS_MULTIPLIER: Record<string, number> = {
  new: 1,
  bronze: 1.2,
  silver: 1.5,
  gold: 2,
  platinum: 3,
} as const;

export const TIER_CONFIG = {
  new: { label: "Mới", icon: "🌱", color: "bg-gray-100 text-gray-600", minOrders: 0, minSpent: 0 },
  bronze: { label: "Đồng", icon: "🥉", color: "bg-amber-100 text-amber-700", minOrders: 3, minSpent: 1000000 },
  silver: { label: "Bạc", icon: "🥈", color: "bg-slate-200 text-slate-700", minOrders: 10, minSpent: 5000000 },
  gold: { label: "Vàng", icon: "🥇", color: "bg-yellow-100 text-yellow-700", minOrders: 20, minSpent: 10000000 },
  platinum: { label: "Kim Cương", icon: "💎", color: "bg-purple-100 text-purple-700", minOrders: 50, minSpent: 20000000 },
} as const;
