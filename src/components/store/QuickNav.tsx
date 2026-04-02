"use client";

import Link from "next/link";
import { Flame, Sparkles, Gift, ShoppingBag, ChevronRight, Zap, Menu } from "lucide-react";
import { useState } from "react";

const CATEGORY_EMOJIS: Record<string, string> = {
  "rau-cu-qua": "🥬", "trai-cay": "🍊", "thit-tuoi": "🥩", "hai-san": "🦐",
  "sua-va-bo": "🥛", "do-kho": "🍜", "gia-vi": "🧂", "do-uong": "☕",
  "banh-keo": "🍪", "do-dong-lanh": "🧊",
};

interface QuickNavProps {
  categories: { id: string; slug: string; name: string; icon?: string | null }[];
  saleCount: number;
  comboCount: number;
  giftCount: number;
}

export default function QuickNav({ categories, saleCount, comboCount, giftCount }: QuickNavProps) {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="bg-white border-b sticky top-[85px] md:top-[94px] z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
          {/* All categories dropdown toggle */}
          <button
            onClick={() => setShowAll(!showAll)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#E42128] text-white hover:bg-red-700 transition-colors text-xs font-bold"
          >
            <Menu className="w-3.5 h-3.5" />
            Danh mục
            <ChevronRight className={`w-3 h-3 transition-transform ${showAll ? "rotate-90" : ""}`} />
          </button>

          {/* Promo quick links */}
          {saleCount > 0 && (
            <a href="#flash-sale" className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold border border-red-200">
              <Zap className="w-3 h-3" /> Flash Sale
            </a>
          )}
          {comboCount > 0 && (
            <a href="#combo" className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-xs font-bold border border-purple-200">
              <Sparkles className="w-3 h-3" /> Combo
            </a>
          )}
          {giftCount > 0 && (
            <a href="#qua-tang" className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-xs font-bold border border-green-200">
              <Gift className="w-3 h-3" /> Quà tặng
            </a>
          )}

          <div className="shrink-0 w-px h-5 bg-gray-200 mx-1" />

          {/* Category pills */}
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/danh-muc/${cat.slug}`}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[#E42128]"
            >
              <span className="text-base leading-none">{cat.icon || CATEGORY_EMOJIS[cat.slug] || "🛍️"}</span>
              <span className="font-medium text-xs whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}

          <Link href="/san-pham" className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-gray-500 hover:text-[#E42128] hover:bg-gray-100 transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="font-medium text-xs">Tất cả</span>
          </Link>
        </div>

        {/* Expandable category grid */}
        {showAll && (
          <div className="pb-3 border-t mt-1 pt-3 animate-fade-in-up">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/danh-muc/${cat.slug}`}
                  onClick={() => setShowAll(false)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-red-50 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon || CATEGORY_EMOJIS[cat.slug] || "🛍️"}</span>
                  <span className="text-[10px] font-medium text-gray-600 group-hover:text-[#E42128] text-center leading-tight">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
