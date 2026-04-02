"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

const CATEGORY_EMOJIS: Record<string, string> = {
  "rau-cu-qua": "🥬", "trai-cay": "🍊", "thit-tuoi": "🥩", "hai-san": "🦐",
  "sua-va-bo": "🥛", "do-kho": "🍜", "gia-vi": "🧂", "do-uong": "☕",
  "banh-keo": "🍪", "do-dong-lanh": "🧊",
};

const AISLE_BG = [
  "bg-green-50 border-green-200",
  "bg-emerald-50 border-emerald-200",
  "bg-teal-50 border-teal-200",
  "bg-green-50/70 border-green-100",
  "bg-emerald-50/70 border-emerald-100",
  "bg-teal-50/70 border-teal-100",
  "bg-green-50 border-green-200",
  "bg-emerald-50 border-emerald-200",
  "bg-teal-50 border-teal-200",
  "bg-green-50/50 border-green-100",
];

interface StoreAislesProps {
  categories: any[];
  products: any[];
}

export default function StoreAisles({ categories, products }: StoreAislesProps) {
  const { addItem } = useCartStore();

  const handleAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`Đã thêm ${product.name}`);
  };

  const aisles = categories
    .map((cat, idx) => {
      const catProducts = products.filter((p: any) => p.category_id === cat.id || p.category?.id === cat.id);
      return { category: cat, products: catProducts, colorIdx: idx };
    })
    .filter((a) => a.products.length > 0);

  if (aisles.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🏪</span>
          <h3 className="text-sm font-extrabold">Quầy hàng</h3>
          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">{aisles.length}</span>
        </div>
        <Link href="/san-pham" className="text-green-600 text-[11px] font-medium flex items-center gap-0.5">
          Tất cả SP <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Horizontal scroll of vertical aisle columns */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {aisles.map((aisle) => {
          const cat = aisle.category;
          const emoji = cat.icon || CATEGORY_EMOJIS[cat.slug] || "🛍️";
          const bg = AISLE_BG[aisle.colorIdx % AISLE_BG.length];

          return (
            <div key={cat.id} className={`shrink-0 w-64 md:w-72 rounded-xl border ${bg} flex flex-col`}>
              {/* Aisle header */}
              <div className="px-2.5 pt-2 pb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg leading-none">{emoji}</span>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">{cat.name}</h4>
                    <p className="text-[9px] text-gray-400">{aisle.products.length} SP</p>
                  </div>
                </div>
                <Link
                  href={`/danh-muc/${cat.slug}`}
                  className="text-[10px] font-medium text-gray-500 hover:text-green-600 flex items-center gap-0.5"
                >
                  Xem <ChevronRight className="w-2.5 h-2.5" />
                </Link>
              </div>

              {/* Vertical scroll product list */}
              <div className="flex-1 max-h-[260px] overflow-y-auto scrollbar-thin px-1.5 pb-1.5 space-y-1">
                {aisle.products.map((product: any) => {
                  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
                  const discountPct = hasDiscount
                    ? Math.round((1 - product.price / product.compare_at_price) * 100)
                    : 0;

                  return (
                    <Link
                      key={product.id}
                      href={`/san-pham/${product.slug}`}
                      className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 hover:shadow-sm transition-all group border border-transparent hover:border-green-200"
                    >
                      {/* Thumbnail */}
                      <div className="w-9 h-9 rounded-md overflow-hidden bg-gray-50 shrink-0 border">
                        {product.images?.length > 0 ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm opacity-30">{emoji}</div>
                        )}
                      </div>

                      {/* Name + price */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-gray-800 truncate group-hover:text-green-600 transition-colors">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[11px] font-bold text-green-600">{formatPrice(product.price)}</span>
                          {hasDiscount && (
                            <span className="text-[9px] text-red-500 font-bold">-{discountPct}%</span>
                          )}
                        </div>
                      </div>

                      {/* Add */}
                      {product.stock_quantity > 0 && (
                        <button
                          onClick={(e) => handleAdd(e, product)}
                          className="w-6 h-6 rounded-md bg-green-100 hover:bg-green-600 text-green-600 hover:text-white flex items-center justify-center transition-colors shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
