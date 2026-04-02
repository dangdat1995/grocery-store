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
  "bg-orange-50 border-orange-200",
  "bg-red-50 border-red-200",
  "bg-blue-50 border-blue-200",
  "bg-purple-50 border-purple-200",
  "bg-pink-50 border-pink-200",
  "bg-teal-50 border-teal-200",
  "bg-amber-50 border-amber-200",
  "bg-indigo-50 border-indigo-200",
  "bg-cyan-50 border-cyan-200",
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
    <section className="max-w-7xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-3">
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
            <div key={cat.id} className={`shrink-0 w-64 md:w-72 rounded-2xl border ${bg} flex flex-col`}>
              {/* Aisle header */}
              <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none">{emoji}</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{cat.name}</h4>
                    <p className="text-[10px] text-gray-400">{aisle.products.length} sản phẩm</p>
                  </div>
                </div>
                <Link
                  href={`/danh-muc/${cat.slug}`}
                  className="text-[11px] font-medium text-gray-500 hover:text-green-600 flex items-center gap-0.5"
                >
                  Xem <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Vertical scroll product list */}
              <div className="flex-1 max-h-[320px] overflow-y-auto scrollbar-thin px-2 pb-2 space-y-1.5">
                {aisle.products.map((product: any) => {
                  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
                  const discountPct = hasDiscount
                    ? Math.round((1 - product.price / product.compare_at_price) * 100)
                    : 0;

                  return (
                    <Link
                      key={product.id}
                      href={`/san-pham/${product.slug}`}
                      className="flex items-center gap-2.5 bg-white rounded-xl px-2.5 py-2 hover:shadow-sm transition-all group border border-transparent hover:border-green-200"
                    >
                      {/* Thumbnail */}
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-50 shrink-0 border">
                        {product.images?.length > 0 ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg opacity-30">{emoji}</div>
                        )}
                      </div>

                      {/* Name + price */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-green-600 transition-colors">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-green-600">{formatPrice(product.price)}</span>
                          {hasDiscount && (
                            <>
                              <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
                              <span className="text-[10px] text-red-500 font-bold">-{discountPct}%</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Add */}
                      {product.stock_quantity > 0 && (
                        <button
                          onClick={(e) => handleAdd(e, product)}
                          className="w-7 h-7 rounded-lg bg-green-100 hover:bg-green-600 text-green-600 hover:text-white flex items-center justify-center transition-colors shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
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
