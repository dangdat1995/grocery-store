"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

const FONT_MAP: Record<string, string> = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  nunito: "'Nunito', sans-serif",
  "open-sans": "'Open Sans', sans-serif",
  "be-vietnam": "'Be Vietnam Pro', sans-serif",
};

const RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
};

export default function DynamicStyles() {
  const { settings, load, loaded } = useSettingsStore();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loaded) return;

    const root = document.documentElement;

    // Font
    const font = FONT_MAP[settings.font_family] || FONT_MAP.inter;
    root.style.setProperty("--store-font", font);
    document.body.style.fontFamily = font;

    // Border radius
    const radius = RADIUS_MAP[settings.border_radius] || RADIUS_MAP.lg;
    root.style.setProperty("--store-radius", radius);

    // Primary color
    if (settings.primary_color) {
      root.style.setProperty("--store-primary", settings.primary_color);
    }
  }, [settings, loaded]);

  // Announcement bar
  if (!loaded || !settings.announcement_bar) return null;

  return (
    <div
      className="text-center text-xs sm:text-sm py-1.5 px-4 font-medium"
      style={{
        backgroundColor: settings.announcement_bg || "#059669",
        color: settings.announcement_text_color || "#ffffff",
      }}
    >
      {settings.announcement_bar}
    </div>
  );
}
