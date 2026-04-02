"use client";

import { create } from "zustand";

interface StoreSettings {
  store_name: string;
  store_phone: string;
  primary_color: string;
  font_family: string;
  border_radius: string;
  announcement_bar: string;
  announcement_bg: string;
  announcement_text_color: string;
  show_product_rating: string;
  show_stock_badge: string;
  show_sale_badge: string;
  show_quick_add: string;
  product_grid_cols: string;
  seo_title: string;
  seo_description: string;
  [key: string]: string;
}

const DEFAULTS: StoreSettings = {
  store_name: "Tạp Hoá Online",
  store_phone: "0901234567",
  primary_color: "#16a34a",
  font_family: "inter",
  border_radius: "lg",
  announcement_bar: "",
  announcement_bg: "#059669",
  announcement_text_color: "#ffffff",
  show_product_rating: "true",
  show_stock_badge: "true",
  show_sale_badge: "true",
  show_quick_add: "true",
  product_grid_cols: "4",
  seo_title: "",
  seo_description: "",
  // Loyalty
  points_per_1000: "1",
  points_value: "10",
  min_redeem_points: "10",
  max_redeem_percent: "50",
  // Hero features
  hero_feature_1: "Miễn phí ship 5km",
  hero_feature_2: "Giao trong 2 giờ",
  hero_feature_3: "Phủ sóng 20km",
  hero_feature_4: "Thanh toán linh hoạt",
};

interface SettingsStore {
  settings: StoreSettings;
  loaded: boolean;
  load: () => Promise<void>;
  get: (key: string) => string;
  is: (key: string) => boolean;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULTS,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/api/store");
      const data = await res.json();
      if (data.settings) {
        set({ settings: { ...DEFAULTS, ...data.settings }, loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
  get: (key: string) => get().settings[key] || DEFAULTS[key] || "",
  is: (key: string) => get().settings[key] === "true",
}));
