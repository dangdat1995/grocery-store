"use client";

import { Gift, Sparkles } from "lucide-react";

interface GiftBannerProps {
  gifts: {
    id: string;
    name: string;
    gift_description: string;
    condition_type: string;
    condition_value: string | null;
    min_order_amount: number;
  }[];
  cartTotal?: number;
}

export default function GiftBanner({ gifts, cartTotal = 0 }: GiftBannerProps) {
  if (!gifts || gifts.length === 0) return null;

  // Filter applicable gifts
  const applicable = gifts.filter((g) => {
    if (g.condition_type === "any_product") return true;
    if (g.condition_type === "min_amount") {
      const minAmount = Number(g.condition_value || g.min_order_amount || 0);
      return cartTotal >= minAmount;
    }
    return true; // Show all, specific product/category handled at checkout
  });

  // Gifts user is close to qualifying for
  const almostQualified = gifts.filter((g) => {
    if (g.condition_type === "min_amount") {
      const minAmount = Number(g.condition_value || g.min_order_amount || 0);
      return cartTotal > 0 && cartTotal < minAmount && cartTotal >= minAmount * 0.5;
    }
    return false;
  });

  if (applicable.length === 0 && almostQualified.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Applicable gifts */}
      {applicable.map((g) => (
        <div key={g.id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm">
          <Gift className="w-4 h-4 text-green-600 shrink-0" />
          <span className="text-green-700 font-medium">{g.gift_description}</span>
          <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
        </div>
      ))}

      {/* Almost qualified */}
      {almostQualified.map((g) => {
        const minAmount = Number(g.condition_value || g.min_order_amount || 0);
        const remaining = minAmount - cartTotal;
        return (
          <div key={`almost-${g.id}`} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-sm">
            <Gift className="w-4 h-4 text-yellow-600 shrink-0" />
            <span className="text-yellow-700">
              Mua thêm <strong>{new Intl.NumberFormat("vi-VN").format(remaining)}đ</strong> để nhận: <strong>{g.gift_description}</strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}
