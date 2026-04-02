"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap, Truck, Flame, Percent, Gift, Timer, Star, ShoppingBag } from "lucide-react";

// ── Fallback demo banners ──
const DEMO_BANNERS = [
  {
    id: "1",
    title: "Flash Sale Cuối Tuần",
    subtitle: "Giảm đến 50% rau củ, trái cây tươi sống — chỉ 2 ngày duy nhất!",
    tag: "HOT DEAL",
    link: "/san-pham?sale=true",
    gradient: "from-green-600 via-emerald-500 to-teal-400",
    emoji: "🥬",
    tagColor: "bg-yellow-400 text-yellow-900",
    media_type: "none" as const,
    media_url: "",
    icon: "flame",
    highlight: "50%",
    highlightLabel: "GIẢM ĐẾN",
  },
  {
    id: "2",
    title: "Thịt Tươi Mỗi Ngày",
    subtitle: "Cam kết nhập mới 100% — Giao nhanh 2 giờ, hoàn tiền nếu không tươi",
    tag: "CAM KẾT",
    link: "/san-pham",
    gradient: "from-emerald-600 via-green-500 to-lime-400",
    emoji: "🥩",
    tagColor: "bg-white/20 text-white",
    media_type: "none" as const,
    media_url: "",
    icon: "star",
    highlight: "100%",
    highlightLabel: "TƯƠI MỚI",
  },
  {
    id: "3",
    title: "Free Ship Toàn Thành",
    subtitle: "FREE 0-5km · 20K 5-10km · 35K 10-15km · 50K 15-20km — Giao nhanh 60 phút",
    tag: "FREE SHIP",
    link: "/san-pham",
    gradient: "from-teal-600 via-cyan-500 to-emerald-400",
    emoji: "🚛",
    tagColor: "bg-white/25 text-white",
    media_type: "none" as const,
    media_url: "",
    icon: "truck",
    highlight: "0đ",
    highlightLabel: "PHÍ SHIP TỪ",
  },
  {
    id: "4",
    title: "Combo Siêu Tiết Kiệm",
    subtitle: "Mua combo giảm đến 30% — Đủ bữa cơm gia đình chỉ từ 120k",
    tag: "TIẾT KIỆM",
    link: "#combo",
    gradient: "from-green-700 via-emerald-600 to-teal-500",
    emoji: "🛒",
    tagColor: "bg-yellow-400 text-yellow-900",
    media_type: "none" as const,
    media_url: "",
    icon: "gift",
    highlight: "120k",
    highlightLabel: "CHỈ TỪ",
  },
];

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  link: string;
  gradient: string;
  emoji: string;
  tagColor: string;
  media_type: "none" | "image" | "video";
  media_url: string;
  icon?: string;
  highlight?: string;
  highlightLabel?: string;
}

interface HeroZoneProps {
  categories: { id: string; slug: string; name: string; icon?: string | null }[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  "rau-cu-qua": "🥬", "trai-cay": "🍊", "thit-tuoi": "🥩", "hai-san": "🦐",
  "sua-va-bo": "🥛", "do-kho": "🍜", "gia-vi": "🧂", "do-uong": "☕",
  "banh-keo": "🍪", "do-dong-lanh": "🧊",
};

const ICON_MAP: Record<string, typeof Flame> = {
  flame: Flame, truck: Truck, percent: Percent, gift: Gift, timer: Timer, star: Star, zap: Zap, bag: ShoppingBag,
};

export default function HeroZone({ categories }: HeroZoneProps) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [paused, setPaused] = useState(false);
  const [banners, setBanners] = useState<Banner[]>(DEMO_BANNERS);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number, dir: "next" | "prev") => {
    setBanners((b) => {
      setPrev(current);
      setDirection(dir);
      setCurrent(idx);
      setProgressKey((k) => k + 1);
      return b;
    });
  }, [current]);

  const next = useCallback(() => {
    setBanners((b) => {
      setCurrent((c) => {
        const n = (c + 1) % b.length;
        setPrev(c);
        setDirection("next");
        setProgressKey((k) => k + 1);
        return n;
      });
      return b;
    });
  }, []);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  // Load banners from API
  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => {
        if (data.banners?.length > 0) {
          setBanners(data.banners.map((b: any) => ({
            id: b.id,
            title: b.title || "",
            subtitle: b.subtitle || "",
            tag: b.tag || "",
            link: b.link || "/san-pham",
            gradient: b.gradient || "from-green-600 via-emerald-500 to-teal-500",
            emoji: b.emoji || "",
            tagColor: b.tag_color || "bg-white/20 text-white",
            media_type: b.media_type || "none",
            media_url: b.media_url || "",
            icon: b.icon || "",
            highlight: b.highlight || "",
            highlightLabel: b.highlight_label || "",
          })));
        }
      })
      .catch(() => {});
  }, []);

  const banner = banners[current] || banners[0];
  const hasMedia = banner.media_type !== "none" && banner.media_url;
  const IconComp = banner.icon ? ICON_MAP[banner.icon] : null;

  return (
    <section className="max-w-7xl mx-auto px-4 pt-2 pb-1.5 space-y-2">
      {/* ── Banner Carousel ── */}
      <div
        className="relative rounded-2xl overflow-hidden h-44 sm:h-52 md:h-60 lg:h-[280px] group/banner"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Background: media or animated gradient */}
        {hasMedia ? (
          <>
            {banner.media_type === "video" ? (
              <video
                key={banner.media_url}
                src={banner.media_url}
                autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover animate-[fadeIn_0.7s_ease]"
              />
            ) : (
              <img
                key={banner.media_url}
                src={banner.media_url}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover animate-[fadeIn_0.7s_ease]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </>
        ) : (
          <div key={banner.id} className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`}>
            {/* Animated background shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/[0.07] rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
              <div className="absolute right-20 bottom-0 w-60 h-60 bg-white/[0.05] rounded-full animate-[pulse_5s_ease-in-out_1s_infinite]" />
              <div className="absolute left-1/3 -top-10 w-40 h-40 bg-white/[0.04] rounded-full animate-[pulse_6s_ease-in-out_2s_infinite]" />
              {/* Diagonal shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
              {/* Floating particles */}
              <div className="absolute top-[20%] right-[15%] w-2 h-2 bg-white/20 rounded-full animate-[float_3s_ease-in-out_infinite]" />
              <div className="absolute top-[60%] right-[25%] w-1.5 h-1.5 bg-white/15 rounded-full animate-[float_4s_ease-in-out_0.5s_infinite]" />
              <div className="absolute top-[40%] right-[35%] w-1 h-1 bg-white/20 rounded-full animate-[float_3.5s_ease-in-out_1s_infinite]" />
            </div>
            {/* Large emoji background */}
            {banner.emoji && (
              <span className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 text-[100px] sm:text-[120px] md:text-[150px] opacity-[0.12] select-none animate-[fadeInScale_0.8s_ease]">
                {banner.emoji}
              </span>
            )}
          </div>
        )}

        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-8 md:px-10 max-w-2xl animate-[slideUp_0.6s_ease]" key={banner.id}>
          {/* Tag badge */}
          {banner.tag && (
            <span className={`inline-flex items-center gap-1.5 ${banner.tagColor} text-[10px] sm:text-[11px] font-extrabold px-3 py-1 rounded-full w-fit mb-2.5 shadow-lg backdrop-blur-sm animate-[fadeInLeft_0.5s_ease_0.1s_both]`}>
              {IconComp ? <IconComp className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              {banner.tag}
            </span>
          )}

          {/* Highlight number */}
          {banner.highlight && (
            <div className="flex items-end gap-2 mb-1 animate-[fadeInLeft_0.5s_ease_0.2s_both]">
              {banner.highlightLabel && (
                <span className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest pb-1">
                  {banner.highlightLabel}
                </span>
              )}
              <span className="text-white text-4xl sm:text-5xl md:text-6xl font-black leading-none drop-shadow-xl">
                {banner.highlight}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight drop-shadow-lg animate-[fadeInLeft_0.5s_ease_0.3s_both]">
            {banner.title}
          </h2>

          {/* Subtitle */}
          {banner.subtitle && (
            <p className="text-white/75 text-[11px] sm:text-sm mt-1.5 leading-relaxed max-w-md animate-[fadeInLeft_0.5s_ease_0.4s_both]">
              {banner.subtitle}
            </p>
          )}

          {/* CTA Button */}
          {banner.link && (
            <Link
              href={banner.link}
              className="mt-3 sm:mt-4 inline-flex items-center gap-2 bg-white text-green-700 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-green-50 hover:scale-105 transition-all w-fit shadow-xl hover:shadow-2xl animate-[fadeInLeft_0.5s_ease_0.5s_both]"
            >
              Mua ngay <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Navigation arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => goTo((current - 1 + banners.length) % banners.length, "prev")}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/banner:opacity-100 hover:scale-110"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goTo((current + 1) % banners.length, "next")}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/banner:opacity-100 hover:scale-110"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Bottom: dots + progress bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
              {/* Progress bar */}
              <div className="h-[3px] bg-white/10">
                <div
                  key={progressKey}
                  className="h-full bg-white/70 rounded-r-full"
                  style={{ animation: paused ? "none" : "progressBar 5s linear forwards" }}
                />
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-1.5 py-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > current ? "next" : "prev")}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-6 h-2 bg-white shadow-lg"
                        : "w-2 h-2 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Category bar (evenly distributed) ── */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl border px-2 py-1.5">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length + 1, 12)}, minmax(0, 1fr))` }}>
            {categories.slice(0, 11).map((cat) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="flex flex-col items-center gap-0.5 py-1 rounded-lg hover:bg-green-50 transition-colors group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {cat.icon || CATEGORY_EMOJIS[cat.slug] || "🛍️"}
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-600 group-hover:text-green-700 text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
            <Link
              href="/san-pham"
              className="flex flex-col items-center gap-0.5 py-1 rounded-lg hover:bg-green-50 transition-colors group"
            >
              <span className="text-xl">📋</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-green-600 group-hover:text-green-700 text-center leading-tight">
                Tất cả
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(-50%) scale(0.8); }
          to { opacity: 0.12; transform: translateY(-50%) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
