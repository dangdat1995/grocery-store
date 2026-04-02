"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { ShoppingCart, Sparkles, ChevronRight, Gift } from "lucide-react";
import Link from "next/link";

interface ComboProps {
  combos: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    combo_price: number;
    original_price: number;
    items: { product_id: string; product_name: string; quantity: number; price: number; product?: any }[];
  }[];
  gifts?: {
    id: string;
    gift_description: string;
    condition_type: string;
    condition_value: string | null;
    min_order_amount: number;
  }[];
}

export default function ComboSection({ combos, gifts = [] }: ComboProps) {
  const { addItem } = useCartStore();

  const addComboToCart = (combo: ComboProps["combos"][0]) => {
    combo.items.forEach((item) => {
      if (item.product) {
        for (let i = 0; i < item.quantity; i++) {
          addItem(item.product);
        }
      }
    });
    toast.success(`Đã thêm combo "${combo.name}" vào giỏ hàng`);
  };

  if ((!combos || combos.length === 0) && gifts.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Combo */}
        {combos.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-purple-700">Combo tiết kiệm</h3>
                <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-bold">{combos.length}</span>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {combos.map((combo) => {
                const savingsPercent = combo.original_price > 0
                  ? Math.round((1 - combo.combo_price / combo.original_price) * 100)
                  : 0;

                return (
                  <div key={combo.id} className="shrink-0 w-64 md:w-72 bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-2 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-sm truncate">{combo.name}</h4>
                        {combo.description && (
                          <p className="text-white/70 text-[10px] truncate">{combo.description}</p>
                        )}
                      </div>
                      {savingsPercent > 0 && (
                        <Badge className="bg-yellow-400 text-yellow-900 font-bold text-[10px] ml-2 shrink-0">
                          -{savingsPercent}%
                        </Badge>
                      )}
                    </div>

                    {/* Items */}
                    <div className="px-3 py-2 space-y-1">
                      {combo.items.map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-600 truncate mr-2">
                            {item.product_name}
                            {item.quantity > 1 && <span className="text-gray-400 ml-0.5">x{item.quantity}</span>}
                          </span>
                          <span className="text-gray-400 line-through shrink-0">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price + CTA */}
                    <div className="border-t px-3 py-2 flex items-center justify-between">
                      <div>
                        <span className="text-base font-extrabold text-green-600">{formatPrice(combo.combo_price)}</span>
                        <span className="text-[10px] text-gray-400 line-through ml-1.5">{formatPrice(combo.original_price)}</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 rounded-lg text-[11px] h-7 px-2.5"
                        onClick={() => addComboToCart(combo)}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" /> Mua
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Gifts - inline row */}
        {gifts.length > 0 && (
          <div id="qua-tang" className="scroll-mt-28 flex items-center gap-2 flex-wrap py-2">
            <div className="flex items-center gap-1 shrink-0">
              <Gift className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-bold text-green-700">Quà tặng:</span>
            </div>
            {gifts.map((g: any) => (
              <div
                key={g.id}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium border ${
                  g.condition_type === "any_product"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                <Gift className="w-3 h-3 shrink-0" />
                <span>{g.gift_description}</span>
                {g.condition_type === "min_amount" && (
                  <span className="text-[9px] bg-white px-1.5 py-0.5 rounded-full font-bold border">
                    đơn từ {new Intl.NumberFormat("vi-VN").format(Number(g.condition_value || g.min_order_amount))}đ
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
