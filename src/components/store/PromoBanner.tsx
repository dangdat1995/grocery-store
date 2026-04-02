"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  image_url: string;
  link?: string;
  title?: string;
  subtitle?: string;
}

const DEMO_BANNERS: Banner[] = [
  { id: "b1", image_url: "", link: "/san-pham?sale=true", title: "Flash Sale Cuối Tuần", subtitle: "Giảm đến 50% rau củ, trái cây tươi" },
  { id: "b2", image_url: "", link: "/san-pham", title: "Thịt Tươi Mỗi Ngày", subtitle: "Cam kết nhập mới 100% — Giao trong 2 giờ" },
  { id: "b3", image_url: "", link: "/san-pham", title: "Miễn Phí Giao Hàng", subtitle: "Đơn từ 300k trong bán kính 5km" },
];

const SIDE_BANNERS = [
  { title: "Combo tiết kiệm", subtitle: "Giảm 25%", emoji: "🛒", gradient: "from-orange-500 to-red-500", link: "#combo" },
  { title: "Tích điểm x3", subtitle: "Hạng Kim Cương", emoji: "💎", gradient: "from-purple-500 to-indigo-500", link: "/tai-khoan" },
];

const GRADIENTS = [
  "from-[#E42128] via-red-500 to-orange-500",
  "from-green-600 via-emerald-500 to-teal-500",
  "from-blue-600 via-blue-500 to-cyan-500",
];

const EMOJIS = [
  ["🔥", "💰"], ["🥩", "🥬"], ["🎁", "🚛"],
];

interface PromoBannerProps {
  banners?: Banner[];
}

export default function PromoBanner({ banners }: PromoBannerProps) {
  const items = banners && banners.length > 0 ? banners : DEMO_BANNERS;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % items.length), [items.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next, items.length]);

  const banner = items[current];

  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex gap-3">
        {/* Main carousel */}
        <div
          className="flex-1 relative overflow-hidden rounded-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative h-40 sm:h-52 md:h-64">
            {banner.image_url ? (
              <img src={banner.image_url} alt={banner.title || ""} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[current % GRADIENTS.length]} relative overflow-hidden`}>
                <div className="absolute inset-0 hero-pattern opacity-20" />
                {/* Decorative emojis */}
                <span className="absolute top-4 right-8 text-5xl md:text-7xl opacity-20 animate-float">{EMOJIS[current % EMOJIS.length][0]}</span>
                <span className="absolute bottom-4 right-20 text-4xl md:text-5xl opacity-15 animate-float" style={{ animationDelay: "0.7s" }}>{EMOJIS[current % EMOJIS.length][1]}</span>
                {/* Text */}
                <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 max-w-md">
                  <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold drop-shadow-lg leading-tight">{banner.title}</h3>
                  <p className="text-white/80 text-xs sm:text-sm mt-2 drop-shadow">{banner.subtitle}</p>
                  {banner.link && (
                    <Link href={banner.link} className="mt-3 inline-flex items-center gap-1 bg-white text-gray-800 font-bold text-xs px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors w-fit shadow-md">
                      Xem ngay <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Arrows */}
            {items.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Dots */}
            {items.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {items.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side banners - desktop only */}
        <div className="hidden lg:flex flex-col gap-3 w-56">
          {SIDE_BANNERS.map((sb, i) => (
            <a key={i} href={sb.link} className={`flex-1 bg-gradient-to-br ${sb.gradient} rounded-xl p-4 relative overflow-hidden group hover:shadow-lg transition-shadow`}>
              <div className="absolute top-2 right-2 text-3xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all">{sb.emoji}</div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                <p className="text-white/80 text-[10px] font-medium">{sb.subtitle}</p>
                <p className="text-white font-extrabold text-sm leading-tight">{sb.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
