"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Banknote, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";

interface Props {
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  unpaid: { label: "Chưa thanh toán", color: "text-orange-600 bg-orange-100" },
  paid: { label: "Đã thanh toán", color: "text-green-600 bg-green-100" },
  failed: { label: "Thanh toán thất bại", color: "text-red-600 bg-red-100" },
  refunded: { label: "Đã hoàn tiền", color: "text-blue-600 bg-blue-100" },
};

export default function PaymentConfirmButton({
  orderId,
  orderNumber,
  paymentStatus,
  paymentMethod,
}: Props) {
  const [currentStatus, setCurrentStatus] = useState(paymentStatus);
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const router = useRouter();

  const updatePayment = async (newStatus: string) => {
    if (isDemo) {
      setCurrentStatus(newStatus);
      const label = STATUS_LABELS[newStatus]?.label || newStatus;
      toast.success(`Demo: ${label}`);

      // Khi xác nhận thanh toán trong demo → tự động mở cửa sổ in hoá đơn
      if (newStatus === "paid") {
        toast.info("Đang mở hoá đơn để in...");
        setTimeout(() => {
          window.open(
            `/api/invoices/${orderNumber}?format=thermal`,
            "_blank",
            "width=350,height=600"
          );
        }, 500);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, payment_status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const label = STATUS_LABELS[newStatus]?.label || newStatus;
      toast.success(`Cập nhật: ${label}`);
      setCurrentStatus(newStatus);

      // Khi xác nhận thanh toán → tự động mở cửa sổ in hoá đơn + gửi email
      if (newStatus === "paid") {
        toast.info("Đang mở hoá đơn để in...");
        setTimeout(() => {
          window.open(
            `/api/invoices/${orderNumber}?format=thermal`,
            "_blank",
            "width=350,height=600"
          );
        }, 500);
        // Gửi email xác nhận thanh toán
        fetch("/api/orders/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId, order_number: orderNumber, status: "payment_confirmed" }),
        }).catch(() => {});
      }

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật");
    }
    setLoading(false);
  };

  const handleQuickPrint = () => {
    setPrintLoading(true);
    const w = window.open(
      `/api/invoices/${orderNumber}?format=thermal`,
      "_blank",
      "width=350,height=600"
    );
    if (!w) toast.error("Cho phép popup để in hoá đơn");
    setTimeout(() => setPrintLoading(false), 1000);
  };

  const statusInfo = STATUS_LABELS[currentStatus] || STATUS_LABELS.unpaid;

  return (
    <Card className="gap-0 p-5">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Banknote className="w-5 h-5 text-green-600" />
        Thanh toán
      </h3>
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        <span className="text-sm text-gray-500">
          ({paymentMethod === "cod" ? "COD" : paymentMethod?.toUpperCase()})
        </span>
      </div>

      {currentStatus === "unpaid" && (
        <div className="flex gap-2 flex-wrap">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => updatePayment("paid")}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-1" />
            )}
            {loading ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => updatePayment("failed")}
            disabled={loading}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Thất bại
          </Button>
        </div>
      )}

      {currentStatus === "paid" && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickPrint}
            disabled={printLoading}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            {printLoading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Printer className="w-4 h-4 mr-1" />
            )}
            In hoá đơn
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePayment("refunded")}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Hoàn tiền"}
          </Button>
        </div>
      )}

      {currentStatus === "failed" && (
        <Button
          className="bg-green-600 hover:bg-green-700"
          size="sm"
          onClick={() => updatePayment("paid")}
          disabled={loading}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          {loading ? "..." : "Xác nhận lại"}
        </Button>
      )}

      {currentStatus === "refunded" && (
        <p className="text-sm text-blue-600">Đã hoàn tiền cho khách hàng</p>
      )}
    </Card>
  );
}
