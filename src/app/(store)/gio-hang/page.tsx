"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import GiftBanner from "@/components/store/GiftBanner";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } =
    useCartStore();
  const [gifts, setGifts] = useState<any[]>([]);

  useEffect(() => {
    // Load active gift promotions
    const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
    if (isDemo) {
      setGifts([
        { id: "g1", name: "Tặng túi nilon", gift_description: "Tặng 1 túi nilon thân thiện môi trường", condition_type: "any_product", condition_value: null, min_order_amount: 0 },
        { id: "g2", name: "Quà đơn 300k", gift_description: "Tặng 1 bịch khăn giấy cao cấp", condition_type: "min_amount", condition_value: "300000", min_order_amount: 300000 },
      ]);
    }
    // In production, could fetch from API
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Giỏ hàng trống</h1>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          Hãy thêm sản phẩm yêu thích vào giỏ hàng để bắt đầu mua sắm
        </p>
        <Link href="/san-pham">
          <Button className="bg-green-600 hover:bg-green-700 rounded-xl h-12 px-8 font-bold shadow-md">
            <Sparkles className="w-4 h-4 mr-2" />
            Khám phá sản phẩm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold">Giỏ hàng</h1>
          <p className="text-sm text-gray-400">{items.length} sản phẩm</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
          <Trash2 className="w-4 h-4 mr-1" /> Xoá tất cả
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <Card
            key={`${item.product.id}_${item.buyMode || "retail"}`}
            className={`p-4 rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow opacity-0 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {item.product.images && item.product.images.length > 0 ? (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingCart className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/san-pham/${item.product.slug}`}
                  className="font-semibold text-sm hover:text-green-600 line-clamp-1 transition-colors"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-gray-400">
                  /{item.buyMode === "bulk" && item.product.bulk_unit ? item.product.bulk_unit : item.product.unit}
                  {item.buyMode === "bulk" && <span className="ml-1 text-orange-500 font-medium">(nguyên thùng)</span>}
                </p>
                <p className="font-bold text-green-600 text-sm mt-0.5">
                  {formatPrice(item.buyMode === "bulk" && item.product.bulk_price ? item.product.bulk_price : item.product.price)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-xl overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-none"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1, item.buyMode)
                    }
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-bold">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-none"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1, item.buyMode)
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <p className="font-extrabold text-sm w-24 text-right">
                  {formatPrice((item.buyMode === "bulk" && item.product.bulk_price ? item.product.bulk_price : item.product.price) * item.quantity)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  onClick={() => removeItem(item.product.id, item.buyMode)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gift promotions */}
      {gifts.length > 0 && (
        <div className="mt-4">
          <GiftBanner gifts={gifts} cartTotal={getTotal()} />
        </div>
      )}

      {/* Summary */}
      <Card className="rounded-2xl border-0 shadow-md mt-6 p-5 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500">Tạm tính</span>
          <span className="text-2xl font-extrabold text-green-600">
            {formatPrice(getTotal())}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Phí giao hàng sẽ được tính khi thanh toán</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/san-pham" className="flex-1">
            <Button variant="outline" className="w-full rounded-xl h-11">
              <ArrowLeft className="w-4 h-4 mr-2" /> Tiếp tục mua sắm
            </Button>
          </Link>
          <Link href="/thanh-toan" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-11 font-bold shadow-md hover:shadow-lg transition-all" size="lg">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Đặt hàng ({formatPrice(getTotal())})
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
