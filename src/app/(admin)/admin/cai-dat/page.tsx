"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Landmark,
  Clock,
  Save,
  Globe,
  MessageCircle,
  Palette,
  Type,
  Image as ImageIcon,
  Plus,
  Trash2,
  Loader2,
  Navigation,
  Truck,
  Monitor,
  Video,
  LayoutGrid,
  Columns3,
  Megaphone,
  Moon,
  Eye,
  ShoppingBag,
  Star,
  Tag,
  Zap,
  Coins,
  Crown,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import { BANK_INFO, DELIVERY_TIERS } from "@/lib/constants";

// ===== Setting group definitions =====
const STORE_INFO_FIELDS = [
  { key: "store_name", label: "Tên cửa hàng", placeholder: "Tạp Hoá Online", icon: Store },
  { key: "store_phone", label: "Số điện thoại", placeholder: "0901234567", icon: Phone },
  { key: "store_email", label: "Email", placeholder: "lienhe@taphoaonline.vn", icon: Mail },
  { key: "store_address", label: "Địa chỉ", placeholder: "TP. Hồ Chí Minh", icon: MapPin },
  { key: "store_description", label: "Mô tả", placeholder: "Cửa hàng tạp hoá online..." },
];

const APPEARANCE_FIELDS = [
  { key: "hero_slogan", label: "Slogan chính (dòng 1)", placeholder: "Chợ tươi tại nhà", icon: Type },
  { key: "hero_slogan_2", label: "Slogan phụ (dòng 2)", placeholder: "Chỉ cần một chạm", icon: Type },
  { key: "hero_description", label: "Mô tả hero", placeholder: "Rau củ, trái cây, thịt cá tươi sống mỗi ngày..." },
  { key: "hero_bg_from", label: "Màu gradient (từ)", placeholder: "#16a34a", icon: Palette },
  { key: "hero_bg_via", label: "Màu gradient (qua)", placeholder: "#059669", icon: Palette },
  { key: "hero_bg_to", label: "Màu gradient (đến)", placeholder: "#0f766e", icon: Palette },
  { key: "hero_badge_text", label: "Badge text", placeholder: "Miễn phí giao hàng trong 5km" },
  { key: "hero_image_url", label: "Hình nền hero (URL)", placeholder: "https://...", icon: ImageIcon },
];

const BANK_FIELDS = [
  { key: "bank_name", label: "Ngân hàng", placeholder: "Vietcombank", icon: Landmark },
  { key: "bank_bin", label: "Mã BIN (VietQR)", placeholder: "970436" },
  { key: "bank_account_number", label: "Số tài khoản", placeholder: "1234567890" },
  { key: "bank_account_name", label: "Chủ tài khoản", placeholder: "TAP HOA ONLINE" },
  { key: "bank_branch", label: "Chi nhánh", placeholder: "Chi nhánh HCM" },
];

const SEO_FIELDS = [
  { key: "seo_title", label: "Tiêu đề SEO", placeholder: "Tạp Hoá Online - Giao hàng tận nơi" },
  { key: "seo_description", label: "Mô tả SEO", placeholder: "Cửa hàng tạp hoá online, giao hàng nhanh trong 2 giờ..." },
  { key: "seo_keywords", label: "Từ khoá SEO", placeholder: "tạp hoá online, rau củ tươi, giao hàng nhanh..." },
  { key: "og_image_url", label: "Ảnh chia sẻ (OG Image)", placeholder: "https://...", icon: ImageIcon },
  { key: "google_analytics_id", label: "Google Analytics ID", placeholder: "G-XXXXXXXXXX" },
  { key: "facebook_pixel_id", label: "Facebook Pixel ID", placeholder: "123456789012345" },
];

const LOCATION_FIELDS = [
  { key: "store_latitude", label: "Vĩ độ (Latitude)", placeholder: "10.7769", icon: Navigation },
  { key: "store_longitude", label: "Kinh độ (Longitude)", placeholder: "106.7009", icon: Navigation },
  { key: "max_delivery_radius_km", label: "Bán kính giao hàng (km)", placeholder: "20", icon: Truck },
  { key: "opening_time", label: "Giờ mở cửa", placeholder: "06:00", icon: Clock },
  { key: "closing_time", label: "Giờ đóng cửa", placeholder: "21:00", icon: Clock },
];

const DELIVERY_FEE_KEYS = [
  { key: "delivery_tier_1_km", label: "Tier 1 max km", placeholder: "5" },
  { key: "delivery_tier_1_fee", label: "Tier 1 phí (VND)", placeholder: "0" },
  { key: "delivery_tier_2_km", label: "Tier 2 max km", placeholder: "10" },
  { key: "delivery_tier_2_fee", label: "Tier 2 phí (VND)", placeholder: "20000" },
  { key: "delivery_tier_3_km", label: "Tier 3 max km", placeholder: "15" },
  { key: "delivery_tier_3_fee", label: "Tier 3 phí (VND)", placeholder: "35000" },
  { key: "delivery_tier_4_km", label: "Tier 4 max km", placeholder: "20" },
  { key: "delivery_tier_4_fee", label: "Tier 4 phí (VND)", placeholder: "50000" },
];

// Loyalty / Points settings
const LOYALTY_POINTS_FIELDS = [
  { key: "points_per_1000", label: "Điểm tích mỗi 1.000đ", placeholder: "1", desc: "Mỗi 1.000đ chi tiêu được bao nhiêu điểm" },
  { key: "points_value", label: "Giá trị 1 điểm (VNĐ)", placeholder: "10", desc: "1 điểm quy đổi bao nhiêu đồng giảm giá" },
  { key: "min_redeem_points", label: "Tối thiểu quy đổi", placeholder: "10", desc: "Số điểm tối thiểu để được dùng" },
  { key: "max_redeem_percent", label: "Tối đa dùng điểm (% đơn)", placeholder: "50", desc: "Giới hạn % đơn hàng được trừ bằng điểm" },
];

const TIER_FIELDS = [
  { tier: "bronze", label: "Đồng 🥉", orderKey: "tier_bronze_min_orders", spentKey: "tier_bronze_min_spent", multKey: "tier_bronze_multiplier", defOrders: "3", defSpent: "1000000", defMult: "1.2" },
  { tier: "silver", label: "Bạc 🥈", orderKey: "tier_silver_min_orders", spentKey: "tier_silver_min_spent", multKey: "tier_silver_multiplier", defOrders: "10", defSpent: "5000000", defMult: "1.5" },
  { tier: "gold", label: "Vàng 🥇", orderKey: "tier_gold_min_orders", spentKey: "tier_gold_min_spent", multKey: "tier_gold_multiplier", defOrders: "20", defSpent: "10000000", defMult: "2" },
  { tier: "platinum", label: "Kim Cương 💎", orderKey: "tier_platinum_min_orders", spentKey: "tier_platinum_min_spent", multKey: "tier_platinum_multiplier", defOrders: "50", defSpent: "20000000", defMult: "3" },
];

// Hero feature bar items
const HERO_FEATURE_FIELDS = [
  { key: "hero_feature_1", label: "Tính năng 1", placeholder: "Miễn phí ship 5km", icon: Truck },
  { key: "hero_feature_2", label: "Tính năng 2", placeholder: "Giao trong 2 giờ", icon: Zap },
  { key: "hero_feature_3", label: "Tính năng 3", placeholder: "Phủ sóng 20km", icon: MapPin },
  { key: "hero_feature_4", label: "Tính năng 4", placeholder: "Thanh toán linh hoạt", icon: Landmark },
];

// Layout settings
const LAYOUT_OPTIONS = {
  product_grid: [
    { value: "2", label: "2 cột" },
    { value: "3", label: "3 cột" },
    { value: "4", label: "4 cột" },
    { value: "5", label: "5 cột" },
  ],
  product_card_style: [
    { value: "minimal", label: "Tối giản" },
    { value: "shadow", label: "Đổ bóng" },
    { value: "border", label: "Viền" },
    { value: "gradient", label: "Gradient" },
  ],
  header_style: [
    { value: "default", label: "Mặc định" },
    { value: "centered", label: "Căn giữa" },
    { value: "sticky", label: "Dính trên" },
    { value: "transparent", label: "Trong suốt" },
  ],
  footer_style: [
    { value: "simple", label: "Đơn giản" },
    { value: "detailed", label: "Chi tiết" },
    { value: "minimal", label: "Tối giản" },
  ],
  category_display: [
    { value: "grid", label: "Lưới" },
    { value: "carousel", label: "Trượt ngang" },
    { value: "list", label: "Danh sách" },
    { value: "sidebar", label: "Thanh bên" },
  ],
  homepage_sections: [
    { value: "hero,categories,featured,sale,combos,new,gifts", label: "Đầy đủ" },
    { value: "hero,categories,featured,sale", label: "Cơ bản" },
    { value: "hero,featured,combos,gifts", label: "Khuyến mãi" },
    { value: "hero,categories,new,sale,combos", label: "Tuỳ chỉnh" },
  ],
  font_family: [
    { value: "inter", label: "Inter (mặc định)" },
    { value: "roboto", label: "Roboto" },
    { value: "nunito", label: "Nunito" },
    { value: "open-sans", label: "Open Sans" },
    { value: "be-vietnam", label: "Be Vietnam Pro" },
  ],
  border_radius: [
    { value: "none", label: "Vuông (0)" },
    { value: "sm", label: "Nhẹ (4px)" },
    { value: "md", label: "Vừa (8px)" },
    { value: "lg", label: "Tròn (12px)" },
    { value: "xl", label: "Rất tròn (16px)" },
    { value: "full", label: "Bo tròn max" },
  ],
};

// Demo defaults
const DEMO_DEFAULTS: Record<string, string> = {
  store_name: "Tạp Hoá Online",
  store_phone: "0901234567",
  store_email: "lienhe@taphoaonline.vn",
  store_description: "Cửa hàng tạp hoá online - Giao hàng tận nơi",
  store_address: "TP. Hồ Chí Minh",
  hero_slogan: "Chợ tươi tại nhà",
  hero_slogan_2: "Chỉ cần một chạm",
  hero_description: "Rau củ, trái cây, thịt cá tươi sống mỗi ngày. Đặt hàng dễ dàng, giao nhanh trong 2 giờ.",
  hero_bg_from: "#16a34a",
  hero_bg_via: "#059669",
  hero_bg_to: "#0f766e",
  hero_badge_text: "Miễn phí giao hàng trong 5km",
  hero_image_url: "",
  bank_name: BANK_INFO.bank_name,
  bank_account_number: BANK_INFO.account_number,
  bank_account_name: BANK_INFO.account_name,
  bank_branch: BANK_INFO.branch,
  store_latitude: "10.7769",
  store_longitude: "106.7009",
  max_delivery_radius_km: "20",
  opening_time: "06:00",
  closing_time: "21:00",
  delivery_tier_1_km: "5",
  delivery_tier_1_fee: "0",
  delivery_tier_2_km: "10",
  delivery_tier_2_fee: "20000",
  delivery_tier_3_km: "15",
  delivery_tier_3_fee: "35000",
  delivery_tier_4_km: "20",
  delivery_tier_4_fee: "50000",
  bg_type: "gradient",
  bg_color: "#ffffff",
  bg_gradient_from: "#f0fdf4",
  bg_gradient_to: "#ecfdf5",
  bg_image_url: "",
  bg_video_url: "",
  bg_overlay_opacity: "0",
  // Layout settings
  product_grid_cols: "4",
  product_card_style: "shadow",
  header_style: "default",
  footer_style: "detailed",
  category_display: "carousel",
  homepage_sections: "hero,categories,featured,sale,combos,new,gifts",
  font_family: "inter",
  border_radius: "lg",
  primary_color: "#16a34a",
  secondary_color: "#059669",
  accent_color: "#f59e0b",
  show_product_rating: "true",
  show_stock_badge: "true",
  show_sale_badge: "true",
  show_quick_add: "true",
  products_per_page: "20",
  enable_dark_mode: "false",
  announcement_bar: "",
  announcement_bg: "#059669",
  announcement_text_color: "#ffffff",
  // Loyalty & Points
  points_per_1000: "1",
  points_value: "10",
  min_redeem_points: "10",
  max_redeem_percent: "50",
  tier_bronze_min_orders: "3",
  tier_bronze_min_spent: "1000000",
  tier_bronze_multiplier: "1.2",
  tier_silver_min_orders: "10",
  tier_silver_min_spent: "5000000",
  tier_silver_multiplier: "1.5",
  tier_gold_min_orders: "20",
  tier_gold_min_spent: "10000000",
  tier_gold_multiplier: "2",
  tier_platinum_min_orders: "50",
  tier_platinum_min_spent: "20000000",
  tier_platinum_multiplier: "3",
  // Hero feature bar
  hero_feature_1: "Miễn phí ship 5km",
  hero_feature_2: "Giao trong 2 giờ",
  hero_feature_3: "Phủ sóng 20km",
  hero_feature_4: "Thanh toán linh hoạt",
  // SEO
  seo_title: "Tạp Hoá Online - Giao hàng tận nơi",
  seo_description: "Cửa hàng tạp hoá online, rau củ tươi sống, giao hàng nhanh trong 2 giờ tại TP.HCM",
  seo_keywords: "tạp hoá online, rau củ tươi, giao hàng nhanh, đặt hàng online",
  og_image_url: "",
  google_analytics_id: "",
  facebook_pixel_id: "",
};

// Social media link type
interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

const SOCIAL_PLATFORMS = [
  "Facebook",
  "Zalo",
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter/X",
  "Shopee",
  "Lazada",
  "Telegram",
  "Website",
  "Khác",
];

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEMO_DEFAULTS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: "1", platform: "Facebook", url: "" },
    { id: "2", platform: "Zalo", url: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (isDemo) return;
    fetch("/api/store")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          // Parse social links from settings
          const linksStr = data.settings.social_links;
          if (linksStr) {
            try {
              setSocialLinks(JSON.parse(linksStr));
            } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [
      ...prev,
      { id: Date.now().toString(), platform: "Facebook", url: "" },
    ]);
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const updateSocialLink = (id: string, field: "platform" | "url", value: string) => {
    setSocialLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateSetting("store_latitude", pos.coords.latitude.toFixed(6));
        updateSetting("store_longitude", pos.coords.longitude.toFixed(6));
        toast.success("Đã cập nhật vị trí cửa hàng");
        setGettingLocation(false);
      },
      (err) => {
        toast.error("Không lấy được vị trí: " + err.message);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async () => {
    if (isDemo) {
      toast.info("Demo: Kết nối Supabase để lưu cài đặt");
      return;
    }
    setSaving(true);
    try {
      const allSettings = {
        ...settings,
        social_links: JSON.stringify(socialLinks),
      };
      const res = await fetch("/api/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allSettings),
      });
      if (!res.ok) throw new Error();
      toast.success("Đã lưu cài đặt");
    } catch {
      toast.error("Lỗi lưu cài đặt");
    }
    setSaving(false);
  };

  const renderFields = (fields: typeof STORE_INFO_FIELDS) => (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <Label className="text-xs text-gray-500 flex items-center gap-1.5">
            {field.icon && <field.icon className="w-3 h-3" />}
            {field.label}
          </Label>
          {field.key.includes("bg_") ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={settings[field.key] || field.placeholder}
                onChange={(e) => updateSetting(field.key, e.target.value)}
                className="w-10 h-9 rounded border border-gray-200 cursor-pointer"
              />
              <Input
                value={settings[field.key] || ""}
                onChange={(e) => updateSetting(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="flex-1"
              />
            </div>
          ) : (
            <Input
              value={settings[field.key] || ""}
              onChange={(e) => updateSetting(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1"
            />
          )}
        </div>
      ))}
    </div>
  );

  // Preview gradient
  const gradientPreview = `linear-gradient(135deg, ${settings.hero_bg_from || "#16a34a"}, ${settings.hero_bg_via || "#059669"}, ${settings.hero_bg_to || "#0f766e"})`;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Cài đặt cửa hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin, giao diện và cấu hình</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      {isDemo && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <strong>Demo:</strong> Dữ liệu mẫu. Kết nối Supabase để chỉnh sửa và lưu.
        </div>
      )}

      <div className="space-y-6">
        {/* Store Info */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Thông tin cửa hàng</h2>
          </div>
          <div className="p-5">{renderFields(STORE_INFO_FIELDS)}</div>
        </Card>

        {/* Appearance / Hero */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Giao diện & Slogan</h2>
          </div>
          <div className="p-5 space-y-4">
            {renderFields(APPEARANCE_FIELDS)}

            {/* Gradient preview */}
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">Xem trước gradient</Label>
              <div
                className="h-24 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner"
                style={{ background: gradientPreview }}
              >
                <div className="text-center">
                  <div className="text-xl">{settings.hero_slogan || "Chợ tươi tại nhà"}</div>
                  <div className="text-sm opacity-80 mt-0.5">{settings.hero_slogan_2 || "Chỉ cần một chạm"}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Location & Delivery */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Vị trí & Giao hàng</h2>
          </div>
          <div className="p-5 space-y-4">
            {renderFields(LOCATION_FIELDS)}

            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="w-full"
            >
              {gettingLocation ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 mr-2" />
              )}
              {gettingLocation ? "Đang lấy vị trí..." : "Lấy vị trí hiện tại (GPS)"}
            </Button>

            {/* Map preview */}
            {settings.store_latitude && settings.store_longitude && (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    parseFloat(settings.store_longitude) - 0.02
                  }%2C${parseFloat(settings.store_latitude) - 0.015}%2C${
                    parseFloat(settings.store_longitude) + 0.02
                  }%2C${parseFloat(settings.store_latitude) + 0.015}&layer=mapnik&marker=${settings.store_latitude}%2C${settings.store_longitude}`}
                  className="w-full h-48 border-0"
                  loading="lazy"
                />
                <div className="p-2 bg-gray-50 text-xs text-gray-500 text-center">
                  📍 {settings.store_latitude}, {settings.store_longitude}
                </div>
              </div>
            )}

            {/* Delivery fee tiers */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" /> Bảng phí giao hàng
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {DELIVERY_FEE_KEYS.map((field) => (
                  <div key={field.key}>
                    <Label className="text-xs text-gray-400">{field.label}</Label>
                    <Input
                      type="number"
                      value={settings[field.key] || ""}
                      onChange={(e) => updateSetting(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Bank info */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Ngân hàng (Chuyển khoản)</h2>
          </div>
          <div className="p-5">{renderFields(BANK_FIELDS)}</div>
        </Card>

        {/* Loyalty & Points */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Tích điểm & Hạng thành viên</h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Points config */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-600" /> Cấu hình điểm tích luỹ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {LOYALTY_POINTS_FIELDS.map((field) => (
                  <div key={field.key}>
                    <Label className="text-xs text-gray-500">{field.label}</Label>
                    <Input
                      type="number"
                      value={settings[field.key] || ""}
                      onChange={(e) => updateSetting(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="mt-1"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">{field.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier config */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-600" /> Điều kiện lên hạng
              </h3>
              <div className="space-y-3">
                {TIER_FIELDS.map((tf) => (
                  <div key={tf.tier} className="border rounded-xl p-3">
                    <p className="text-sm font-medium mb-2">{tf.label}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[10px] text-gray-400">Số đơn tối thiểu</Label>
                        <Input
                          type="number"
                          value={settings[tf.orderKey] || ""}
                          onChange={(e) => updateSetting(tf.orderKey, e.target.value)}
                          placeholder={tf.defOrders}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Chi tiêu tối thiểu (VNĐ)</Label>
                        <Input
                          type="number"
                          value={settings[tf.spentKey] || ""}
                          onChange={(e) => updateSetting(tf.spentKey, e.target.value)}
                          placeholder={tf.defSpent}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Hệ số tích điểm</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={settings[tf.multKey] || ""}
                          onChange={(e) => updateSetting(tf.multKey, e.target.value)}
                          placeholder={tf.defMult}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Hero Feature Bar */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Thanh tính năng (Hero)</h2>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-xs text-gray-400 mb-2">4 mục hiển thị bên dưới hero banner trên trang chủ</p>
            {HERO_FEATURE_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <field.icon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] text-gray-400">{field.label}</Label>
                  <Input
                    value={settings[field.key] || ""}
                    onChange={(e) => updateSetting(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-0.5"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* SEO & Analytics */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">SEO & Analytics</h2>
          </div>
          <div className="p-5">{renderFields(SEO_FIELDS)}</div>
        </Card>

        {/* Background Settings */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Hình nền trang web</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <Label className="text-xs text-gray-500">Loại hình nền</Label>
              <select
                value={settings.bg_type || "gradient"}
                onChange={(e) => updateSetting("bg_type", e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="color">Màu đơn</option>
                <option value="gradient">Gradient</option>
                <option value="image">Hình ảnh</option>
                <option value="video">Video nền</option>
              </select>
            </div>

            {settings.bg_type === "color" && (
              <div>
                <Label className="text-xs text-gray-500">Màu nền</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.bg_color || "#ffffff"}
                    onChange={(e) => updateSetting("bg_color", e.target.value)}
                    className="w-10 h-9 rounded border cursor-pointer"
                  />
                  <Input
                    value={settings.bg_color || ""}
                    onChange={(e) => updateSetting("bg_color", e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {settings.bg_type === "gradient" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Màu bắt đầu</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={settings.bg_gradient_from || "#f0fdf4"}
                      onChange={(e) => updateSetting("bg_gradient_from", e.target.value)}
                      className="w-10 h-9 rounded border cursor-pointer"
                    />
                    <Input value={settings.bg_gradient_from || ""} onChange={(e) => updateSetting("bg_gradient_from", e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Màu kết thúc</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={settings.bg_gradient_to || "#ecfdf5"}
                      onChange={(e) => updateSetting("bg_gradient_to", e.target.value)}
                      className="w-10 h-9 rounded border cursor-pointer"
                    />
                    <Input value={settings.bg_gradient_to || ""} onChange={(e) => updateSetting("bg_gradient_to", e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>
            )}

            {settings.bg_type === "image" && (
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" /> URL hình nền
                </Label>
                <Input
                  value={settings.bg_image_url || ""}
                  onChange={(e) => updateSetting("bg_image_url", e.target.value)}
                  placeholder="https://... (khuyến nghị 1920x1080)"
                  className="mt-1"
                />
              </div>
            )}

            {settings.bg_type === "video" && (
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Video className="w-3 h-3" /> URL video nền (MP4)
                </Label>
                <Input
                  value={settings.bg_video_url || ""}
                  onChange={(e) => updateSetting("bg_video_url", e.target.value)}
                  placeholder="https://...video.mp4"
                  className="mt-1"
                />
              </div>
            )}

            {(settings.bg_type === "image" || settings.bg_type === "video") && (
              <div>
                <Label className="text-xs text-gray-500">Độ mờ lớp phủ (0 = trong suốt, 100 = đen hoàn toàn)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.bg_overlay_opacity || "0"}
                    onChange={(e) => updateSetting("bg_overlay_opacity", e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-10 text-right">{settings.bg_overlay_opacity || 0}%</span>
                </div>
              </div>
            )}

            {/* Preview */}
            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">Xem trước</Label>
              <div className="h-28 rounded-xl border overflow-hidden relative flex items-center justify-center">
                {settings.bg_type === "color" && (
                  <div className="absolute inset-0" style={{ backgroundColor: settings.bg_color || "#ffffff" }} />
                )}
                {settings.bg_type === "gradient" && (
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${settings.bg_gradient_from || "#f0fdf4"}, ${settings.bg_gradient_to || "#ecfdf5"})` }} />
                )}
                {settings.bg_type === "image" && settings.bg_image_url && (
                  <img src={settings.bg_image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                )}
                {settings.bg_type === "video" && settings.bg_video_url && (
                  <video src={settings.bg_video_url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                )}
                {(settings.bg_type === "image" || settings.bg_type === "video") && (
                  <div className="absolute inset-0 bg-black" style={{ opacity: (parseInt(settings.bg_overlay_opacity || "0")) / 100 }} />
                )}
                <span className="relative z-10 font-bold text-lg drop-shadow-md" style={{ color: settings.bg_type === "color" ? "#333" : settings.bg_type === "gradient" ? "#16a34a" : "#fff" }}>
                  Tạp Hoá Online
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Layout & Design */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Bố cục & Giao diện</h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Color scheme */}
            <div>
              <Label className="text-xs text-gray-500 font-semibold mb-3 block flex items-center gap-1.5">
                <Palette className="w-3 h-3" /> Bảng màu chủ đạo
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-[11px] text-gray-400">Màu chính</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={settings.primary_color || "#16a34a"} onChange={(e) => updateSetting("primary_color", e.target.value)} className="w-10 h-9 rounded border cursor-pointer" />
                    <Input value={settings.primary_color || ""} onChange={(e) => updateSetting("primary_color", e.target.value)} placeholder="#16a34a" className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] text-gray-400">Màu phụ</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={settings.secondary_color || "#059669"} onChange={(e) => updateSetting("secondary_color", e.target.value)} className="w-10 h-9 rounded border cursor-pointer" />
                    <Input value={settings.secondary_color || ""} onChange={(e) => updateSetting("secondary_color", e.target.value)} placeholder="#059669" className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] text-gray-400">Màu nhấn</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={settings.accent_color || "#f59e0b"} onChange={(e) => updateSetting("accent_color", e.target.value)} className="w-10 h-9 rounded border cursor-pointer" />
                    <Input value={settings.accent_color || ""} onChange={(e) => updateSetting("accent_color", e.target.value)} placeholder="#f59e0b" className="flex-1" />
                  </div>
                </div>
              </div>
              {/* Color preview */}
              <div className="mt-3 flex gap-2">
                <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: settings.primary_color || "#16a34a" }} />
                <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: settings.secondary_color || "#059669" }} />
                <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: settings.accent_color || "#f59e0b" }} />
              </div>
            </div>

            {/* Typography & Corners */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] text-gray-400 flex items-center gap-1"><Type className="w-3 h-3" /> Font chữ</Label>
                <select value={settings.font_family || "inter"} onChange={(e) => updateSetting("font_family", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  {LAYOUT_OPTIONS.font_family.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[11px] text-gray-400">Bo góc</Label>
                <select value={settings.border_radius || "lg"} onChange={(e) => updateSetting("border_radius", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  {LAYOUT_OPTIONS.border_radius.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Layout options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] text-gray-400 flex items-center gap-1"><Columns3 className="w-3 h-3" /> Lưới sản phẩm</Label>
                <select value={settings.product_grid_cols || "4"} onChange={(e) => updateSetting("product_grid_cols", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  {LAYOUT_OPTIONS.product_grid.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[11px] text-gray-400">Kiểu thẻ sản phẩm</Label>
                <select value={settings.product_card_style || "shadow"} onChange={(e) => updateSetting("product_card_style", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  {LAYOUT_OPTIONS.product_card_style.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] text-gray-400">Kiểu header</Label>
                <select value={settings.header_style || "default"} onChange={(e) => updateSetting("header_style", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  {LAYOUT_OPTIONS.header_style.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[11px] text-gray-400">Kiểu footer</Label>
                <select value={settings.footer_style || "detailed"} onChange={(e) => updateSetting("footer_style", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  {LAYOUT_OPTIONS.footer_style.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] text-gray-400">Hiển thị danh mục</Label>
                <select value={settings.category_display || "carousel"} onChange={(e) => updateSetting("category_display", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  {LAYOUT_OPTIONS.category_display.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[11px] text-gray-400">Bố cục trang chủ</Label>
                <select value={settings.homepage_sections || "hero,categories,featured,sale,combos,new,gifts"} onChange={(e) => updateSetting("homepage_sections", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  {LAYOUT_OPTIONS.homepage_sections.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-[11px] text-gray-400">Số sản phẩm mỗi trang</Label>
              <Input type="number" value={settings.products_per_page || "20"} onChange={(e) => updateSetting("products_per_page", e.target.value)} placeholder="20" className="mt-1 w-32" />
            </div>
          </div>
        </Card>

        {/* Feature toggles */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Tính năng hiển thị</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { key: "show_product_rating", label: "Hiển thị đánh giá sản phẩm", icon: Star, desc: "Hiện số sao trên thẻ sản phẩm" },
              { key: "show_stock_badge", label: "Hiển thị trạng thái kho", icon: ShoppingBag, desc: "Hiện badge 'Hết hàng', 'Sắp hết'" },
              { key: "show_sale_badge", label: "Hiển thị badge giảm giá", icon: Tag, desc: "Hiện badge '−20%' trên sản phẩm sale" },
              { key: "show_quick_add", label: "Nút thêm nhanh vào giỏ", icon: Zap, desc: "Hiện nút '+' trên thẻ sản phẩm" },
              { key: "enable_dark_mode", label: "Hỗ trợ dark mode", icon: Moon, desc: "Cho phép người dùng chuyển chế độ tối" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[11px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSetting(item.key, settings[item.key] === "true" ? "false" : "true")}
                  className={`w-11 h-6 rounded-full relative transition-colors ${settings[item.key] === "true" ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[item.key] === "true" ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Announcement bar */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Thanh thông báo</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <Label className="text-xs text-gray-500">Nội dung thông báo (để trống = ẩn)</Label>
              <Input value={settings.announcement_bar || ""} onChange={(e) => updateSetting("announcement_bar", e.target.value)} placeholder="Miễn phí giao hàng đơn từ 300k!" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-gray-400">Màu nền</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={settings.announcement_bg || "#059669"} onChange={(e) => updateSetting("announcement_bg", e.target.value)} className="w-10 h-9 rounded border cursor-pointer" />
                  <Input value={settings.announcement_bg || ""} onChange={(e) => updateSetting("announcement_bg", e.target.value)} className="flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-[11px] text-gray-400">Màu chữ</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={settings.announcement_text_color || "#ffffff"} onChange={(e) => updateSetting("announcement_text_color", e.target.value)} className="w-10 h-9 rounded border cursor-pointer" />
                  <Input value={settings.announcement_text_color || ""} onChange={(e) => updateSetting("announcement_text_color", e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
            {/* Preview */}
            {settings.announcement_bar && (
              <div className="rounded-lg py-2 px-4 text-center text-sm font-medium" style={{ backgroundColor: settings.announcement_bg || "#059669", color: settings.announcement_text_color || "#fff" }}>
                {settings.announcement_bar}
              </div>
            )}
          </div>
        </Card>

        {/* Social Media - Dynamic */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Mạng xã hội</h2>
          </div>
          <div className="p-5 space-y-3">
            {socialLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2">
                <select
                  value={link.platform}
                  onChange={(e) => updateSocialLink(link.id, "platform", e.target.value)}
                  className="w-32 shrink-0 border border-gray-200 rounded-md h-9 px-2 text-sm"
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <Input
                  value={link.url}
                  onChange={(e) => updateSocialLink(link.id, "url", e.target.value)}
                  placeholder={`Link ${link.platform}...`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocialLink(link.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 p-0 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSocialLink}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-1" /> Thêm mạng xã hội
            </Button>
          </div>
        </Card>
      </div>

      {/* Save bottom */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
        </Button>
      </div>
    </div>
  );
}
