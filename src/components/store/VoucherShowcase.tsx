"use client";

import { useState, useEffect } from "react";
import { Ticket, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Voucher {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
}

const DEMO_VOUCHERS: Voucher[] = [
  { id: "v1", code: "WELCOME10", description: "Giảm 10% đơn đầu tiên", discount_type: "percent", discount_value: 10, min_order_amount: 200000, max_discount: 50000 },
  { id: "v2", code: "FREESHIP", description: "Miễn phí giao hàng", discount_type: "free_ship", discount_value: 0, min_order_amount: 300000 },
  { id: "v3", code: "SAVE30K", description: "Giảm 30.000đ", discount_type: "fixed", discount_value: 30000, min_order_amount: 500000 },
  { id: "v4", code: "COMBO15", description: "Giảm 15% cho Combo", discount_type: "percent", discount_value: 15, min_order_amount: 0, max_discount: 80000 },
];

export default function VoucherShowcase() {
  const [vouchers, setVouchers] = useState<Voucher[]>(DEMO_VOUCHERS);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vouchers/active")
      .then((r) => r.json())
      .then((data) => {
        if (data.vouchers && data.vouchers.length > 0) {
          setVouchers(data.vouchers.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    toast.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDiscount = (v: Voucher) => {
    if (v.discount_type === "percent") return `-${v.discount_value}%`;
    if (v.discount_type === "free_ship") return "FREE SHIP";
    return `-${(v.discount_value / 1000).toFixed(0)}K`;
  };

  const gradients = [
    "from-red-500 to-orange-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-purple-500 to-pink-500",
  ];

  if (!vouchers.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Ticket className="w-4 h-4 text-[#E42128]" />
        <h3 className="text-sm font-extrabold text-gray-800">Mã giảm giá</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {vouchers.map((v, i) => (
          <div
            key={v.id}
            className="shrink-0 w-56 sm:w-60 rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Top colored section */}
            <div className={`bg-gradient-to-r ${gradients[i % gradients.length]} px-4 py-3 relative`}>
              <div className="absolute inset-0 hero-pattern opacity-10" />
              <div className="relative z-10">
                <p className="text-white font-extrabold text-lg">{formatDiscount(v)}</p>
                <p className="text-white/80 text-[10px]">{v.description}</p>
              </div>
              {/* Cutout circles */}
              <div className="absolute -bottom-2 left-3 w-4 h-4 bg-white rounded-full" />
              <div className="absolute -bottom-2 right-3 w-4 h-4 bg-white rounded-full" />
            </div>
            {/* Bottom section */}
            <div className="bg-white px-4 py-2.5 flex items-center justify-between border-t border-dashed border-gray-200">
              <div>
                <p className="font-mono font-bold text-xs text-gray-800">{v.code}</p>
                {v.min_order_amount > 0 && (
                  <p className="text-[9px] text-gray-400">Đơn từ {(v.min_order_amount / 1000).toFixed(0)}K</p>
                )}
              </div>
              <button
                onClick={() => handleCopy(v.code)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  copied === v.code
                    ? "bg-green-100 text-green-600"
                    : "bg-red-50 text-[#E42128] hover:bg-red-100"
                }`}
              >
                {copied === v.code ? (
                  <><Check className="w-3 h-3" /> Đã lưu</>
                ) : (
                  <><Copy className="w-3 h-3" /> Lưu mã</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
