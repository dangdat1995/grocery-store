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
  Plus,
  Trash2,
  Loader2,
  Navigation,
  Truck,

  Coins,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import { BANK_INFO, DELIVERY_TIERS } from "@/lib/constants";
import { SocialIcon, SOCIAL_COLORS } from "@/lib/social-icons";

// ===== Setting group definitions =====
const STORE_INFO_FIELDS = [
  { key: "store_name", label: "Tên cửa hàng", placeholder: "Tạp Hoá Online", icon: Store },
  { key: "store_phone", label: "Số điện thoại", placeholder: "0901234567", icon: Phone },
  { key: "store_email", label: "Email", placeholder: "lienhe@taphoaonline.vn", icon: Mail },
  { key: "store_address", label: "Địa chỉ", placeholder: "TP. Hồ Chí Minh", icon: MapPin },
  { key: "store_description", label: "Mô tả", placeholder: "Cửa hàng tạp hoá online..." },
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
  { key: "og_image_url", label: "Ảnh chia sẻ (OG Image)", placeholder: "https://...", icon: Globe },
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

// Demo defaults
const DEMO_DEFAULTS: Record<string, string> = {
  store_name: "Tạp Hoá Online",
  store_phone: "0901234567",
  store_email: "lienhe@taphoaonline.vn",
  store_description: "Cửa hàng tạp hoá online - Giao hàng tận nơi",
  store_address: "TP. Hồ Chí Minh",
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
  { name: "Facebook", prefix: "https://facebook.com/", placeholder: "https://facebook.com/taphoaonline" },
  { name: "Zalo", prefix: "https://zalo.me/", placeholder: "https://zalo.me/0901234567" },
  { name: "Instagram", prefix: "https://instagram.com/", placeholder: "https://instagram.com/taphoaonline" },
  { name: "TikTok", prefix: "https://tiktok.com/@", placeholder: "https://tiktok.com/@taphoaonline" },
  { name: "YouTube", prefix: "https://youtube.com/@", placeholder: "https://youtube.com/@taphoaonline" },
  { name: "Twitter/X", prefix: "https://x.com/", placeholder: "https://x.com/taphoaonline" },
  { name: "Shopee", prefix: "https://shopee.vn/", placeholder: "https://shopee.vn/taphoaonline" },
  { name: "Lazada", prefix: "https://lazada.vn/shop/", placeholder: "https://lazada.vn/shop/taphoaonline" },
  { name: "Telegram", prefix: "https://t.me/", placeholder: "https://t.me/taphoaonline" },
  { name: "Website", prefix: "https://", placeholder: "https://taphoaonline.vn" },
  { name: "Khác", prefix: "", placeholder: "https://..." },
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
    // Find first platform not yet added
    const usedPlatforms = socialLinks.map((l) => l.platform);
    const next = SOCIAL_PLATFORMS.find((p) => !usedPlatforms.includes(p.name));
    setSocialLinks((prev) => [
      ...prev,
      { id: Date.now().toString(), platform: next?.name || "Facebook", url: "" },
    ]);
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const updateSocialLink = (id: string, field: "platform" | "url", value: string) => {
    setSocialLinks((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (field === "platform") {
          const config = SOCIAL_PLATFORMS.find((p) => p.name === value);
          // Auto-fill prefix if url is empty or was a previous platform prefix
          const oldConfig = SOCIAL_PLATFORMS.find((p) => p.name === l.platform);
          const wasEmpty = !l.url || l.url === oldConfig?.prefix;
          return { ...l, platform: value, url: wasEmpty && config?.prefix ? config.prefix : l.url };
        }
        return { ...l, [field]: value };
      })
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

        {/* Location & Delivery */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 flex items-center gap-3">
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
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Ngân hàng (Chuyển khoản)</h2>
          </div>
          <div className="p-5">{renderFields(BANK_FIELDS)}</div>
        </Card>

        {/* Loyalty & Points */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-4 flex items-center gap-3">
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

        {/* SEO & Analytics */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">SEO & Analytics</h2>
          </div>
          <div className="p-5">{renderFields(SEO_FIELDS)}</div>
        </Card>

        {/* Social Media - Dynamic */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-white">Mạng xã hội</h2>
          </div>
          <div className="p-5 space-y-3">
            {socialLinks.map((link) => {
              const config = SOCIAL_PLATFORMS.find((p) => p.name === link.platform) || SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];
              const brandColor = SOCIAL_COLORS[link.platform] || "#6b7280";
              return (
                <div key={link.id} className="border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-2">
                    {/* Platform icon (SVG brand logo) */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: brandColor + "12" }}
                    >
                      <SocialIcon platform={link.platform} size={18} />
                    </div>

                    {/* Platform selector */}
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(link.id, "platform", e.target.value)}
                      className="w-28 shrink-0 border border-gray-200 rounded-lg h-9 px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>

                    {/* URL input */}
                    <Input
                      value={link.url}
                      onChange={(e) => updateSocialLink(link.id, "url", e.target.value)}
                      placeholder={config.placeholder}
                      className="flex-1"
                    />

                    {/* Delete */}
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

                  {/* Hint */}
                  {config.prefix && (
                    <p className="text-[10px] text-gray-400 mt-1.5 ml-11">
                      Định dạng: <span className="font-mono text-gray-500">{config.prefix}</span><span className="text-green-600">tên-trang</span>
                    </p>
                  )}
                </div>
              );
            })}

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
