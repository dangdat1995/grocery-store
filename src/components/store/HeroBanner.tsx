"use client";

import Link from "next/link";
import { ShoppingCart, Sparkles, MapPin, ChevronDown, Check, Truck, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useBranchStore } from "@/stores/branch-store";

interface HeroBannerProps {
  settings: {
    hero_bg_from: string;
    hero_bg_via: string;
    hero_bg_to: string;
    hero_badge_text: string;
    hero_slogan: string;
    hero_slogan_2: string;
    hero_description: string;
    hero_feature_1?: string;
    hero_feature_2?: string;
    hero_feature_3?: string;
    hero_feature_4?: string;
  };
  branches: any[];
}

export default function HeroBanner({ settings, branches }: HeroBannerProps) {
  const { selectedBranch, setBranches, selectBranch } = useBranchStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Init store with server-fetched branches
  useEffect(() => {
    if (branches.length > 0) setBranches(branches);
  }, [branches]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${settings.hero_bg_from}, ${settings.hero_bg_via}, ${settings.hero_bg_to})`,
      }}
    >
      <div className="absolute inset-0 hero-pattern" />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 relative">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-0.5 text-white text-[11px] backdrop-blur-sm border border-white/10">
                <Sparkles className="w-3 h-3" />
                {settings.hero_badge_text}
              </span>

              {/* Branch selector */}
              {branches.length > 0 && (
                <div ref={ref} className="relative">
                  <button
                    onClick={() => setOpen(!open)}
                    className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-0.5 text-white text-[11px] backdrop-blur-sm border border-white/10 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[140px]">{selectedBranch?.name || "Chọn chi nhánh"}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>

                  {open && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border z-50 min-w-[240px] py-1 animate-fade-in-up">
                      <p className="px-3 py-1.5 text-[10px] text-gray-400 font-semibold uppercase">Chọn chi nhánh mua hàng</p>
                      {branches.map((b: any) => (
                        <button
                          key={b.id}
                          onClick={() => { selectBranch(b); setOpen(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-green-50 transition-colors ${
                            selectedBranch?.id === b.id ? "text-green-700 bg-green-50 font-semibold" : "text-gray-700"
                          }`}
                        >
                          <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{b.name}</p>
                            <p className="text-[10px] text-gray-400">{b.address}, {b.district}</p>
                          </div>
                          {selectedBranch?.id === b.id && <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight mb-1">
              {settings.hero_slogan}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-100">
                {settings.hero_slogan_2}
              </span>
            </h2>
            <p className="text-xs text-white/60 mb-3 max-w-md hidden sm:block">
              {settings.hero_description}
            </p>
            <Link href="/san-pham">
              <Button className="bg-white text-green-700 hover:bg-green-50 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all h-9 px-5 text-xs">
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                Mua sắm ngay
              </Button>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2 opacity-70">
            <span className="text-4xl animate-float">🥬</span>
            <span className="text-3xl animate-float" style={{ animationDelay: "0.5s" }}>🍊</span>
            <span className="text-4xl animate-float" style={{ animationDelay: "1s" }}>🥩</span>
          </div>
        </div>

        {/* Features bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {[
            { icon: Truck, text: settings.hero_feature_1 || "Miễn phí ship 5km" },
            { icon: Zap, text: settings.hero_feature_2 || "Giao trong 2 giờ" },
            { icon: MapPin, text: settings.hero_feature_3 || "Phủ sóng 20km" },
            { icon: Shield, text: settings.hero_feature_4 || "Thanh toán linh hoạt" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white/10">
              <f.icon className="w-3.5 h-3.5 text-white/80 shrink-0" />
              <span className="text-white/90 text-[11px] font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
