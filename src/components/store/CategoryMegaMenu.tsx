"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ChevronRight,
  Flame,
  Sparkles,
  Gift,
  Tag,
  PackagePlus,
} from "lucide-react";

interface CategoryMegaMenuProps {
  categories: { id: string; slug: string; name: string; icon?: string | null }[];
  combos: { id: string; name: string; combo_price: number; original_price: number }[];
  gifts: { id: string; gift_description: string; condition_type: string; condition_value?: string | null; min_order_amount?: number }[];
  hasSale: boolean;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  "rau-cu-qua": "🥬", "trai-cay": "🍊", "thit-tuoi": "🥩", "hai-san": "🦐",
  "sua-va-bo": "🥛", "do-kho": "🍜", "gia-vi": "🧂", "do-uong": "☕",
  "banh-keo": "🍪", "do-dong-lanh": "🧊",
};

export default function CategoryMegaMenu({ categories, combos, gifts, hasSale }: CategoryMegaMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 relative">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${open ? "bg-green-600" : "bg-gray-100 group-hover:bg-green-50"}`}>
            {open ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
            )}
          </div>
          <span className="font-bold text-sm text-gray-700 group-hover:text-green-600 transition-colors">
            Danh mục & Khuyến mãi
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasSale && (
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3" /> Sale
            </span>
          )}
          {combos.length > 0 && (
            <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <PackagePlus className="w-3 h-3" /> {combos.length} Combo
            </span>
          )}
          {gifts.length > 0 && (
            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Gift className="w-3 h-3" /> Quà tặng
            </span>
          )}
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} />
        </div>
      </button>

      {/* Collapsible content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[800px] opacity-100 mb-4" : "max-h-0 opacity-0"}`}>
        <div className="bg-white rounded-2xl border shadow-lg p-4 space-y-5">

          {/* Categories grid */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Danh mục sản phẩm</h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/danh-muc/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="text-center p-2.5 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all group"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {cat.icon || CATEGORY_EMOJIS[cat.slug] || "🛍️"}
                  </div>
                  <p className="font-medium text-[11px] text-gray-700 group-hover:text-green-600 leading-tight">{cat.name}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Promotions row */}
          {(hasSale || combos.length > 0 || gifts.length > 0) && (
            <div className="border-t pt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Khuyến mãi & Ưu đãi</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* Sale section */}
                {hasSale && (
                  <a
                    href="#khuyen-mai"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-red-600">Khuyến mãi hot</p>
                      <p className="text-[11px] text-gray-500">Giá tốt nhất hôm nay</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                {/* Combos */}
                {combos.length > 0 && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-bold text-sm text-purple-600">Combo tiết kiệm</p>
                    </div>
                    <div className="space-y-1.5">
                      {combos.slice(0, 3).map((combo) => {
                        const save = combo.original_price > 0
                          ? Math.round((1 - combo.combo_price / combo.original_price) * 100)
                          : 0;
                        return (
                          <div key={combo.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-700 font-medium truncate">{combo.name}</span>
                            {save > 0 && (
                              <span className="text-red-500 font-bold shrink-0 ml-2">-{save}%</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Gifts */}
                {gifts.length > 0 && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Gift className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-bold text-sm text-green-600">Quà tặng</p>
                    </div>
                    <div className="space-y-1.5">
                      {gifts.slice(0, 3).map((g) => (
                        <div key={g.id} className="flex items-center gap-1.5 text-xs">
                          <Tag className="w-3 h-3 text-green-500 shrink-0" />
                          <span className="text-gray-700 truncate">{g.gift_description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick link */}
          <div className="border-t pt-3 flex items-center justify-center">
            <Link
              href="/san-pham"
              onClick={() => setOpen(false)}
              className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 group"
            >
              Xem tất cả sản phẩm <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
