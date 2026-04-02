// Fetch store settings for server components
// Uses direct Supabase query in server context

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export interface StoreSettings {
  store_name: string;
  store_phone: string;
  store_email: string;
  store_address: string;
  store_description: string;
  hero_slogan: string;
  hero_slogan_2: string;
  hero_description: string;
  hero_bg_from: string;
  hero_bg_via: string;
  hero_bg_to: string;
  hero_badge_text: string;
  hero_image_url: string;
  store_latitude: string;
  store_longitude: string;
  opening_time: string;
  closing_time: string;
  social_links: string;
  [key: string]: string;
}

const DEFAULTS: StoreSettings = {
  store_name: "Tạp Hoá Online",
  store_phone: "0901234567",
  store_email: "lienhe@taphoaonline.vn",
  store_address: "TP. Hồ Chí Minh",
  store_description: "Cửa hàng tạp hoá online - Giao hàng tận nơi",
  hero_slogan: "Chợ tươi tại nhà",
  hero_slogan_2: "Chỉ cần một chạm",
  hero_description: "Rau củ, trái cây, thịt cá tươi sống mỗi ngày. Đặt hàng dễ dàng, giao nhanh trong 2 giờ.",
  hero_bg_from: "#16a34a",
  hero_bg_via: "#059669",
  hero_bg_to: "#0f766e",
  hero_badge_text: "Miễn phí giao hàng trong 5km",
  hero_image_url: "",
  store_latitude: "10.7769",
  store_longitude: "106.7009",
  opening_time: "06:00",
  closing_time: "21:00",
  social_links: "[]",
};

export async function getStoreSettings(): Promise<StoreSettings> {
  if (isDemo) return DEFAULTS;

  try {
    // Dynamic import to avoid bundling server code in client
    const { createClient } = require("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.from("store_settings").select("key, value");

    const map: Record<string, string> = { ...DEFAULTS };
    data?.forEach((s: any) => {
      if (s.value) map[s.key] = s.value;
    });

    return map as StoreSettings;
  } catch {
    return DEFAULTS;
  }
}

export function parseSocialLinks(json: string): { id: string; platform: string; url: string }[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
