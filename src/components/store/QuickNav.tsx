"use client";

import Link from "next/link";
import { Flame, Sparkles, Gift, ShoppingBag, ChevronRight } from "lucide-react";

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
  return (
    <section className="bg-white border-b sticky top-[57px] md:top-[97px] z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center gap-1.5 py-1.5 overflow-x-auto scrollbar-hide">
          {/* Sale */}
          {saleCount > 0 && (
            <a href="#khuyen-mai" className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-[11px] font-bold">
              <Flame className="w-3 h-3" /> Sale
            </a>
          )}

          {/* Combo */}
          {comboCount > 0 && (
            <a href="#combo" className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors text-[11px] font-bold">
              <Sparkles className="w-3 h-3" /> Combo
            </a>
          )}

          {/* Quà tặng */}
          {giftCount > 0 && (
            <a href="#qua-tang" className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-[11px] font-bold">
              <Gift className="w-3 h-3" /> Quà
            </a>
          )}

          <div className="shrink-0 w-px h-4 bg-gray-200 mx-0.5" />

          {/* Categories */}
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/danh-muc/${cat.slug}`}
              className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-gray-600 hover:text-green-700"
            >
              <span className="text-sm leading-none">{cat.icon || CATEGORY_EMOJIS[cat.slug] || "🛍️"}</span>
              <span className="font-medium text-[11px] whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}

          <Link
            href="/san-pham"
            className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-green-100 transition-all text-gray-500 hover:text-green-700"
          >
            <ShoppingBag className="w-3 h-3" />
            <span className="font-medium text-[11px]">Tất cả</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
