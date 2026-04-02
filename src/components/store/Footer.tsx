"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, ShoppingCart, Heart, Mail, Building2, Navigation } from "lucide-react";
import { STORE_NAME, STORE_PHONE } from "@/lib/constants";
import { SocialIcon, SOCIAL_COLORS } from "@/lib/social-icons";

interface SocialLink { id: string; platform: string; url: string; }

interface Settings {
  store_name: string; store_phone: string; store_email: string;
  store_address: string; store_description: string;
  opening_time: string; closing_time: string; social_links: string;
}

interface Branch {
  id: string; name: string; address: string; district: string;
  phone: string; latitude: number; longitude: number;
  opening_time: string; closing_time: string; is_main: boolean;
}

const DEFAULTS: Settings = {
  store_name: STORE_NAME, store_phone: STORE_PHONE,
  store_email: "lienhe@taphoaonline.vn", store_address: "TP. Hồ Chí Minh",
  store_description: "Cửa hàng tạp hoá online - Giao hàng tận nơi trong bán kính 20km.",
  opening_time: "06:00", closing_time: "21:00", social_links: "[]",
};

const DEMO_BRANCHES: Branch[] = [
  { id: "b1", name: "Chi nhánh chính - Quận 1", phone: "0901234567", address: "123 Nguyễn Huệ", district: "Quận 1", latitude: 10.7731, longitude: 106.7030, opening_time: "06:00", closing_time: "21:00", is_main: true },
  { id: "b2", name: "Chi nhánh Quận 7", phone: "0912345678", address: "456 Nguyễn Thị Thập", district: "Quận 7", latitude: 10.7340, longitude: 106.7218, opening_time: "06:30", closing_time: "21:30", is_main: false },
  { id: "b3", name: "Chi nhánh Thủ Đức", phone: "0923456789", address: "789 Võ Văn Ngân", district: "TP. Thủ Đức", latitude: 10.8512, longitude: 106.7592, opening_time: "07:00", closing_time: "21:00", is_main: false },
];

export default function Footer() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [branches, setBranches] = useState<Branch[]>(DEMO_BRANCHES);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch("/api/store", { signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          try {
            if (data.settings.social_links) setSocialLinks(JSON.parse(data.settings.social_links));
          } catch {}
        }
      })
      .catch(() => {});

    fetch("/api/branches", { signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.length > 0) setBranches(data);
        else if (data.branches?.length > 0) setBranches(data.branches);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <footer className="bg-[#1a1a2e] text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

          {/* ── Liên hệ ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-3.5 h-3.5 text-white" />
              </div>
              <h4 className="font-bold text-white text-sm">{settings.store_name}</h4>
            </div>
            <div className="space-y-2 text-xs">
              <a href={`tel:${settings.store_phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span className="text-white font-semibold">{settings.store_phone}</span>
              </a>
              {settings.store_email && (
                <a href={`mailto:${settings.store_email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>{settings.store_email}</span>
                </a>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span>{settings.store_address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span>{settings.opening_time} - {settings.closing_time}</span>
              </div>
            </div>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {socialLinks.filter((l) => l.url).map((link) => {
                  const color = SOCIAL_COLORS[link.platform] || "#6b7280";
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] text-gray-300 hover:text-white transition-all hover:scale-105"
                      style={{ backgroundColor: color + "25" }}
                    >
                      <SocialIcon platform={link.platform} size={14} />
                      <span>{link.platform}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Chi nhánh ── */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-green-400" />
                Hệ thống cửa hàng
              </h4>
              <Link href="/chi-nhanh" className="text-green-400 text-[10px] font-medium hover:text-green-300 transition-colors">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {branches.slice(0, 3).map((b) => (
                <div key={b.id} className="bg-white/5 rounded-lg px-2.5 py-2.5 hover:bg-white/8 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs">{b.is_main ? "⭐" : "🏪"}</span>
                    <p className="text-[11px] font-semibold text-white truncate">{b.name}</p>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-gray-500 shrink-0 mt-0.5" />
                      <span className="text-gray-400">{b.address}, {b.district}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                      <a href={`tel:${b.phone}`} className="text-gray-400 hover:text-white">{b.phone}</a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-gray-500 shrink-0" />
                      <span className="text-gray-400">{b.opening_time} - {b.closing_time}</span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-green-400 font-medium hover:text-green-300 transition-colors"
                  >
                    <Navigation className="w-2.5 h-2.5" /> Chỉ đường
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-gray-500">
          <p>&copy; 2026 {settings.store_name}. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-2.5 h-2.5 text-green-500" /> in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
