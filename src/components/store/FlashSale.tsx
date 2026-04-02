"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ShoppingCart, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import type { Product } from "@/types";

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-0.5">
      {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((val, i) => (
        <span key={i} className="flex items-center">
          <span className="bg-white/20 backdrop-blur-sm text-white font-mono font-extrabold text-xs px-1.5 py-0.5 rounded-md min-w-[28px] text-center">
            {pad(val)}
          </span>
          {i < 2 && <span className="text-white/60 font-bold text-xs mx-0.5">:</span>}
        </span>
      ))}
    </div>
  );
}

function SoldBar({ sold, total }: { sold: number; total: number }) {
  const pct = Math.min(100, Math.round((sold / total) * 100));
  return (
    <div className="mt-1.5">
      <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[9px] text-green-600 mt-0.5 text-center">Đã bán {sold}/{total}</p>
    </div>
  );
}

interface FlashSaleProps {
  products: Product[];
  endTime?: string;
}

export default function FlashSale({ products, endTime }: FlashSaleProps) {
  const addItem = useCartStore((s) => s.addItem);

  const defaultEnd = new Date();
  defaultEnd.setHours(23, 59, 59, 999);
  const end = endTime || defaultEnd.toISOString();

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`Đã thêm ${product.name}`);
  };

  if (!products.length) return null;

  return (
    <section id="flash-sale" className="scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 rounded-xl px-3 py-2 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-white font-extrabold text-xs sm:text-sm tracking-wide uppercase">Flash Sale</span>
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-white/70 text-[10px] sm:text-xs hidden sm:inline">Kết thúc sau</span>
              <CountdownTimer endTime={end} />
            </div>
          </div>
          <Link href="/san-pham?sale=true" className="text-white/80 text-[11px] font-medium flex items-center gap-0.5 hover:text-white">
            Xem tất cả <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Product grid */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
          {products.map((product) => {
            const discountPct = product.compare_at_price
              ? Math.round((1 - product.price / product.compare_at_price) * 100)
              : 0;
            const totalStock = product.stock_quantity + Math.floor(Math.random() * 20 + 5);
            const sold = totalStock - product.stock_quantity;

            return (
              <Link
                key={product.id}
                href={`/san-pham/${product.slug}`}
                className="shrink-0 w-32 md:w-36 group"
              >
                <div className="bg-white rounded-xl border border-green-100 overflow-hidden hover:shadow-lg hover:border-green-300 transition-all">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">⚡</div>
                    )}

                    {discountPct > 0 && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-bl-xl">
                        -{discountPct}%
                      </div>
                    )}

                    <div className="absolute top-1 left-1">
                      <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                    </div>

                    {product.stock_quantity > 0 && (
                      <button
                        onClick={(e) => handleAdd(e, product)}
                        className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="p-2">
                    <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight min-h-[28px] group-hover:text-green-700">
                      {product.name}
                    </p>
                    <div className="mt-1">
                      <span className="text-sm font-extrabold text-green-600">{formatPrice(product.price)}</span>
                      {product.compare_at_price && (
                        <span className="text-[10px] text-gray-400 line-through ml-1">{formatPrice(product.compare_at_price)}</span>
                      )}
                    </div>
                    <SoldBar sold={sold} total={totalStock} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
