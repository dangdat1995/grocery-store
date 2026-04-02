"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import { Truck, Package, CheckCircle, Loader2, Copy, ChevronDown } from "lucide-react";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "packed", "waiting_pickup", "delivering", "delivered"];
const TERMINAL_STATUSES = ["delivered", "cancelled", "returned", "refunded"];

const CARRIERS = [
  { value: "store", label: "Tự giao" },
  { value: "ghn", label: "Giao Hàng Nhanh" },
  { value: "ghtk", label: "Giao Hàng Tiết Kiệm" },
  { value: "viettel_post", label: "Viettel Post" },
  { value: "jt", label: "J&T Express" },
  { value: "grab", label: "GrabExpress" },
  { value: "be", label: "beDelivery" },
  { value: "ahamove", label: "Ahamove" },
  { value: "custom", label: "Khác" },
];

interface Props {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  currentShippingCode?: string;
  currentCarrier?: string;
  userId?: string;
  orderTotal?: number;
}

export default function OrderStatusUpdater({
  orderId,
  orderNumber,
  currentStatus,
  currentShippingCode,
  currentCarrier,
  userId,
  orderTotal,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [shippingCode, setShippingCode] = useState(currentShippingCode || "");
  const [carrier, setCarrier] = useState(currentCarrier || "store");
  const [showShipping, setShowShipping] = useState(status === "preparing" || status === "packed" || !!currentShippingCode);
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const currentIndex = STATUS_FLOW.indexOf(status);

  const updateStatus = async (newStatus: string) => {
    if (newStatus === "delivering" && carrier !== "store" && !shippingCode.trim()) {
      toast.error("Vui lòng nhập mã vận chuyển");
      setShowShipping(true);
      return;
    }

    if (isDemo) {
      setStatus(newStatus);
      const statusLabel = ORDER_STATUSES[newStatus as keyof typeof ORDER_STATUSES]?.label;
      toast.success(`Demo: Đã cập nhật → ${statusLabel}`);
      if (newStatus === "delivering" && shippingCode) {
        toast.info(`Mã vận chuyển: ${shippingCode}`);
      }
      return;
    }

    setLoading(true);
    const updates: any = { status: newStatus };

    if (newStatus === "confirmed") updates.confirmed_at = new Date().toISOString();
    if (newStatus === "preparing") updates.preparing_at = new Date().toISOString();
    if (newStatus === "delivering") {
      updates.shipping_at = new Date().toISOString();
      if (shippingCode.trim()) updates.shipping_code = shippingCode.trim();
      updates.shipping_carrier = carrier;
    }
    if (newStatus === "delivered") updates.delivered_at = new Date().toISOString();

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (error) {
      toast.error("Lỗi: " + error.message);
      setLoading(false);
      return;
    }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: newStatus,
      note: statusNote || (newStatus === "delivering" && shippingCode ? `Mã vận chuyển: ${shippingCode} (${carrier})` : null),
    });

    try {
      await fetch("/api/orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          order_number: orderNumber,
          status: newStatus,
          shipping_code: shippingCode || undefined,
          carrier,
        }),
      });
    } catch {}

    // Unified loyalty processing: points + tier upgrade + milestone vouchers
    if (newStatus === "delivered" && userId && orderTotal) {
      try {
        const loyaltyRes = await fetch("/api/loyalty/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            order_id: orderId,
            order_number: orderNumber,
            order_total: orderTotal,
          }),
        });
        const { summary } = await loyaltyRes.json();
        if (summary) {
          if (summary.points_earned > 0) {
            toast.success(`+${summary.points_earned} điểm tích luỹ (số dư: ${summary.new_balance})`);
          }
          if (summary.tier_upgraded) {
            toast.success(`🎉 Khách lên hạng ${summary.new_tier === "gold" ? "Vàng" : summary.new_tier === "silver" ? "Bạc" : summary.new_tier === "platinum" ? "Kim Cương" : summary.new_tier === "bronze" ? "Đồng" : summary.new_tier}! Voucher: ${summary.tier_voucher}`);
          }
          if (summary.milestones_awarded?.length > 0) {
            summary.milestones_awarded.forEach((a: any) => {
              toast.success(`Đạt mốc ${new Intl.NumberFormat("vi-VN").format(a.milestone_min_spent)}đ → ${a.voucher_code} (giảm ${a.discount_percent}%)`);
            });
          }
        }
      } catch {}
    }

    const statusLabel = ORDER_STATUSES[newStatus as keyof typeof ORDER_STATUSES]?.label;
    toast.success(`Đã cập nhật: ${statusLabel}`);
    setStatus(newStatus);
    setStatusNote("");
    setLoading(false);
    router.refresh();
  };

  if (TERMINAL_STATUSES.includes(status)) {
    if (currentShippingCode) {
      return (
        <Card className="gap-0 p-5">
          <h3 className="font-semibold mb-2">Thông tin vận chuyển</h3>
          <div className="flex items-center gap-2 text-sm">
            <Truck className="w-4 h-4 text-green-600" />
            <span className="text-gray-500">{CARRIERS.find((c) => c.value === currentCarrier)?.label || currentCarrier}:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-green-700">{currentShippingCode}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(currentShippingCode); toast.success("Đã sao chép"); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      );
    }
    return null;
  }

  const nextStatus = STATUS_FLOW[currentIndex + 1];
  const nextLabel = nextStatus ? ORDER_STATUSES[nextStatus as keyof typeof ORDER_STATUSES]?.label : null;

  // Các trạng thái có thể chuyển tới (ngoài next)
  const availableStatuses = Object.entries(ORDER_STATUSES).filter(
    ([key]) => key !== status && !["pending"].includes(key)
  );

  return (
    <Card className="gap-0 p-5">
      <h3 className="font-semibold mb-3">Cập nhật trạng thái</h3>

      {/* Timeline hiện tại */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_FLOW.map((s, i) => {
          const info = ORDER_STATUSES[s as keyof typeof ORDER_STATUSES];
          const isCurrent = s === status;
          const isPast = i < currentIndex;
          return (
            <div key={s} className="flex items-center shrink-0">
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                isCurrent ? info.color + " ring-2 ring-offset-1 ring-green-500" : isPast ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              }`}>
                {info.label}
              </div>
              {i < STATUS_FLOW.length - 1 && <span className="text-gray-300 mx-0.5 text-xs">→</span>}
            </div>
          );
        })}
      </div>

      {/* Shipping info */}
      {(showShipping || ["preparing", "packed", "waiting_pickup"].includes(status) || nextStatus === "delivering") && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 space-y-2">
          <p className="text-xs font-medium text-blue-700 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Thông tin vận chuyển
          </p>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="border border-blue-200 rounded-md h-8 px-2 text-xs bg-white"
            >
              {CARRIERS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {carrier !== "store" && (
              <Input
                value={shippingCode}
                onChange={(e) => setShippingCode(e.target.value)}
                placeholder="Mã vận đơn..."
                className="h-8 text-xs"
              />
            )}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="mb-3">
        <Input
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          placeholder="Ghi chú trạng thái (tuỳ chọn)..."
          className="text-xs h-8"
        />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        {nextStatus && (
          <Button
            className="bg-green-600 hover:bg-green-700"
            size="sm"
            onClick={() => updateStatus(nextStatus)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : nextStatus === "delivering" ? (
              <Truck className="w-4 h-4 mr-1" />
            ) : nextStatus === "delivered" ? (
              <CheckCircle className="w-4 h-4 mr-1" />
            ) : (
              <Package className="w-4 h-4 mr-1" />
            )}
            {nextLabel}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAllStatuses(!showAllStatuses)}
          className="text-xs"
        >
          <ChevronDown className={`w-3.5 h-3.5 mr-1 transition-transform ${showAllStatuses ? "rotate-180" : ""}`} />
          Thêm lựa chọn
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => updateStatus("cancelled")}
          disabled={loading}
        >
          Huỷ đơn
        </Button>
      </div>

      {/* All statuses expanded */}
      {showAllStatuses && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500 mb-2">Chuyển trạng thái:</p>
          <div className="flex flex-wrap gap-1.5">
            {availableStatuses.map(([key, info]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => updateStatus(key)}
                disabled={loading || key === status}
                className={`text-xs h-7 ${info.color} border-0`}
              >
                {info.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
