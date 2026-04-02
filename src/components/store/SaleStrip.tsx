"use client";

import Link from "next/link";
import { Flame, ShoppingCart, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import type { Product } from "@/types";

export default function SaleStrip({ products }: { products: Product[] }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`Đã thêm ${product.name}`);
  };

  if (!products.length) return null;

  return (
    <section id="khuyen-mai" className="scroll-mt-24 bg-white rounded-xl mx-4 md:mx-auto max-w-7xl">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-extrabold text-green-700">Khuyến mãi hot</h3>
            <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold">{products.length}</span>
          </div>
          <Link href="/san-pham" className="text-green-600 text-[11px] font-medium flex items-center gap-0.5 hover:text-green-700">
            Tất cả <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {products.map((product) => {
            const discountPct = product.compare_at_price
              ? Math.round((1 - product.price / product.compare_at_price) * 100)
              : 0;

            return (
              <Link
                key={product.id}
                href={`/san-pham/${product.slug}`}
                className="shrink-0 w-28 md:w-32 group"
              >
                <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden mb-1.5 border border-green-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🔥</div>
                  )}

                  {discountPct > 0 && (
                    <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      -{discountPct}%
                    </span>
                  )}

                  {product.stock_quantity > 0 && (
                    <button
                      onClick={(e) => handleAdd(e, product)}
                      className="absolute bottom-1 right-1 w-6 h-6 rounded-md bg-green-600 hover:bg-green-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <ShoppingCart className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] font-semibold text-gray-800 line-clamp-1 leading-tight group-hover:text-green-700 transition-colors">
                  {product.name}
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-extrabold text-green-600">{formatPrice(product.price)}</span>
                  {product.compare_at_price && (
                    <span className="text-[9px] text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
