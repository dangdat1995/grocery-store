"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, ShoppingCart, Heart, ExternalLink } from "lucide-react";
import { STORE_NAME, STORE_PHONE } from "@/lib/constants";

const SOCIAL_ICONS: Record<string, string> = {
  Facebook: "📘",
  Zalo: "💬",
  Instagram: "📸",
  TikTok: "🎵",
  YouTube: "🎬",
  "Twitter/X": "🐦",
  Shopee: "🛍️",
  Lazada: "🏪",
  Telegram: "✈️",
  Website: "🌐",
  Khác: "🔗",
};

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface Settings {
  store_name: string;
  store_phone: string;
  store_email: string;
  store_address: string;
  store_description: string;
  opening_time: string;
  closing_time: string;
  social_links: string;
}

const DEFAULTS: Settings = {
  store_name: STORE_NAME,
  store_phone: STORE_PHONE,
  store_email: "lienhe@taphoaonline.vn",
  store_address: "TP. Hồ Chí Minh",
  store_description: "Cửa hàng tạp hoá online - Giao hàng tận nơi trong bán kính 20km. Rau củ tươi, thịt cá ngon, đồ khô đầy đủ.",
  opening_time: "06:00",
  closing_time: "21:00",
  social_links: "[]",
};

export default function Footer() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch("/api/store")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          try {
            if (data.settings.social_links) {
              setSocialLinks(JSON.parse(data.settings.social_links));
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 animated-gradient rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-white text-lg">{settings.store_name}</h4>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              {settings.store_description}
            </p>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {socialLinks
                  .filter((l) => l.url)
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 hover:text-white transition-colors"
                    >
                      <span>{SOCIAL_ICONS[link.platform] || "🔗"}</span>
                      {link.platform}
                    </a>
                  ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Liên hệ</h4>
            <div className="space-y-3 text-sm">
              <a href={`tel:${settings.store_phone}`} className="flex items-center gap-2.5 hover:text-green-400 transition-colors">
                <Phone className="w-4 h-4 text-green-500" />{settings.store_phone}
              </a>
              {settings.store_email && (
                <a href={`mailto:${settings.store_email}`} className="flex items-center gap-2.5 hover:text-green-400 transition-colors">
                  <ExternalLink className="w-4 h-4 text-green-500" />{settings.store_email}
                </a>
              )}
              <p className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-green-500" />{settings.store_address}
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-green-500" />{settings.opening_time} - {settings.closing_time} hàng ngày
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Liên kết</h4>
            <div className="space-y-2.5 text-sm">
              <Link href="/san-pham" className="block hover:text-green-400 transition-colors">Tất cả sản phẩm</Link>
              <Link href="/dang-nhap" className="block hover:text-green-400 transition-colors">Đăng nhập</Link>
              <Link href="/gio-hang" className="block hover:text-green-400 transition-colors">Giỏ hàng</Link>
              <Link href="/admin" className="block hover:text-green-400 transition-colors">Quản trị viên</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>&copy; 2026 {settings.store_name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500" /> in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
