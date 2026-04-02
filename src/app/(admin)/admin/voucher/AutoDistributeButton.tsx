"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift, Loader2, Users, Crown, Info, Copy, Send } from "lucide-react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";

interface Props {
  voucherId: string;
  voucherCode: string;
}

export default function AutoDistributeButton({ voucherId, voucherCode }: Props) {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const distribute = async (mode: string, minTier?: string) => {
    if (isDemo) {
      const label = mode === "event_auto" ? "tất cả khách hàng" : `khách hạng ${minTier} trở lên`;
      toast.success(`Demo: Đã phát voucher ${voucherCode} cho ${label}`);
      setShowOptions(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vouchers/auto-distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, voucher_id: voucherId, min_tier: minTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Đã phát cho ${data.distributed} khách hàng (bỏ qua ${data.skipped} trùng)`);
    } catch (err: any) {
      toast.error(err.message || "Lỗi phát voucher");
    }
    setLoading(false);
    setShowOptions(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    toast.success(`Đã sao chép mã: ${voucherCode}`);
  };

  if (!showOptions) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowOptions(true)}
        className="text-purple-600 border-purple-200 hover:bg-purple-50"
      >
        <Gift className="w-3.5 h-3.5 mr-1" /> Phát voucher
      </Button>
    );
  }

  return (
    <div className="min-w-[280px] space-y-2">
      {/* Info tip */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-[11px] text-purple-700">
        <p className="font-semibold flex items-center gap-1 mb-1.5">
          <Info className="w-3 h-3" /> Cách phát voucher
        </p>
        <ul className="space-y-1 text-purple-600">
          <li className="flex items-start gap-1">
            <Copy className="w-3 h-3 mt-0.5 shrink-0" />
            <span><b>Sao chép mã</b> — gửi cho khách qua Zalo, SMS</span>
          </li>
          <li className="flex items-start gap-1">
            <Users className="w-3 h-3 mt-0.5 shrink-0" />
            <span><b>Phát tự động</b> — gửi thông báo tới tất cả khách hàng</span>
          </li>
          <li className="flex items-start gap-1">
            <Crown className="w-3 h-3 mt-0.5 shrink-0" />
            <span><b>Theo hạng</b> — chỉ gửi cho khách Đồng/Bạc/Vàng trở lên</span>
          </li>
        </ul>
      </div>

      {/* Copy code */}
      <Button
        size="sm"
        variant="outline"
        onClick={copyCode}
        className="w-full text-green-600 border-green-200 hover:bg-green-50 text-xs justify-start"
      >
        <Copy className="w-3 h-3 mr-1.5" />
        Sao chép mã: <span className="font-mono font-bold ml-1">{voucherCode}</span>
      </Button>

      {/* Auto distribute options */}
      <div className="flex gap-1 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => distribute("event_auto")}
          disabled={loading}
          className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
        >
          {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
          Tất cả KH
        </Button>
        {["bronze", "silver", "gold"].map((tier) => (
          <Button
            key={tier}
            size="sm"
            variant="outline"
            onClick={() => distribute("loyalty_reward", tier)}
            disabled={loading}
            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 text-xs"
          >
            <Crown className="w-3 h-3 mr-1" />
            {tier === "bronze" ? "Đồng+" : tier === "silver" ? "Bạc+" : "Vàng+"}
          </Button>
        ))}
      </div>

      <Button size="sm" variant="ghost" onClick={() => setShowOptions(false)} className="text-xs text-gray-400 w-full">
        Đóng
      </Button>
    </div>
  );
}
