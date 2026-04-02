"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";

interface Props {
  customerId: string;
  customerName: string;
}

export default function VoucherSender({ customerId, customerName }: Props) {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setVouchers([
        { id: "v1", code: "GIAM10", description: "Giảm 10%", discount_type: "percent", discount_value: 10 },
        { id: "v2", code: "GIAM50K", description: "Giảm 50.000đ", discount_type: "fixed", discount_value: 50000 },
        { id: "v3", code: "FREESHIP", description: "Miễn phí ship", discount_type: "free_ship", discount_value: 0 },
      ]);
      return;
    }
    fetch("/api/vouchers/active")
      .then((r) => r.json())
      .then((data) => setVouchers(data.vouchers || []))
      .catch(() => {});
  }, []);

  const sendVoucher = async () => {
    if (!selectedVoucher) {
      toast.error("Vui lòng chọn voucher");
      return;
    }

    if (isDemo) {
      const v = vouchers.find((v) => v.id === selectedVoucher);
      toast.success(`Demo: Đã gửi voucher ${v?.code} cho ${customerName}`);
      setSelectedVoucher("");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vouchers/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher_id: selectedVoucher,
          user_id: customerId,
          reason: "manual",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Đã gửi voucher cho ${customerName}`);
      setSelectedVoucher("");
    } catch (err: any) {
      toast.error(err.message || "Lỗi gửi voucher");
    }
    setLoading(false);
  };

  return (
    <Card className="gap-0 p-5">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Gift className="w-4 h-4 text-green-600" /> Gửi voucher
      </h3>
      <div className="flex gap-2">
        <select
          value={selectedVoucher}
          onChange={(e) => setSelectedVoucher(e.target.value)}
          className="flex-1 border border-gray-200 rounded-md h-9 px-3 text-sm"
        >
          <option value="">-- Chọn voucher --</option>
          {vouchers.map((v) => (
            <option key={v.id} value={v.id}>
              {v.code} - {v.description || (v.discount_type === "percent" ? `Giảm ${v.discount_value}%` : v.discount_type === "free_ship" ? "Miễn phí ship" : `Giảm ${v.discount_value}đ`)}
            </option>
          ))}
        </select>
        <Button onClick={sendVoucher} disabled={loading || !selectedVoucher} className="bg-green-600 hover:bg-green-700" size="sm">
          {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
          Gửi
        </Button>
      </div>
    </Card>
  );
}
