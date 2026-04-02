"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Banknote,
  CreditCard,
  Wallet,
  RefreshCw,
  Eye,
  Filter,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";

const PAYMENT_ICONS: Record<string, any> = {
  cod: Banknote,
  vnpay: CreditCard,
  momo: Wallet,
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "COD",
  vnpay: "VNPay",
  momo: "MoMo",
};

export default function PaymentConfirmPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [filter, setFilter] = useState<"unpaid" | "paid" | "all">("unpaid");
  const [methodFilter, setMethodFilter] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    if (isDemo) {
      const mockOrders = [
        { id: "1", order_number: "GH-20260401-001", profiles: { full_name: "Nguyễn Văn A", phone: "0901234567" }, total: 205000, payment_status: "unpaid", payment_method: "cod", status: "pending", created_at: "2026-04-01T10:00:00Z" },
        { id: "2", order_number: "GH-20260401-002", profiles: { full_name: "Trần Thị B", phone: "0912345678" }, total: 320000, payment_status: "paid", payment_method: "vnpay", status: "confirmed", created_at: "2026-04-01T09:30:00Z" },
        { id: "3", order_number: "GH-20260401-003", profiles: { full_name: "Lê Văn C", phone: "0923456789" }, total: 95000, payment_status: "unpaid", payment_method: "cod", status: "delivering", created_at: "2026-04-01T08:00:00Z" },
      ];
      let filtered = mockOrders;
      if (filter === "unpaid") filtered = filtered.filter((o) => o.payment_status === "unpaid");
      if (filter === "paid") filtered = filtered.filter((o) => o.payment_status === "paid");
      if (methodFilter) filtered = filtered.filter((o) => o.payment_method === methodFilter);
      setOrders(filtered);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (methodFilter) params.set("method", methodFilter);

    try {
      const res = await fetch(`/api/orders/payment?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.error("Lỗi tải dữ liệu");
    }
    setLoading(false);
  }, [filter, methodFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const confirmPayment = async (orderId: string, orderNumber: string) => {
    setConfirming(orderId);
    if (isDemo) {
      toast.success(`Demo: Đã xác nhận thanh toán ${orderNumber}`);
      // Mở cửa sổ in hoá đơn
      window.open(`/api/invoices/${orderNumber}?format=thermal`, "_blank", "width=350,height=600");
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, payment_status: "paid" } : o));
      setConfirming(null);
      return;
    }
    try {
      const res = await fetch("/api/orders/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, payment_status: "paid" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Đã xác nhận thanh toán ${orderNumber}`);
      // Mở cửa sổ in hoá đơn tự động
      window.open(`/api/invoices/${orderNumber}?format=thermal`, "_blank", "width=350,height=600");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Lỗi xác nhận");
    }
    setConfirming(null);
  };

  const markFailed = async (orderId: string, orderNumber: string) => {
    setConfirming(orderId);
    if (isDemo) {
      toast.success(`Demo: Đã đánh dấu thất bại ${orderNumber}`);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, payment_status: "failed" } : o));
      setConfirming(null);
      return;
    }
    try {
      const res = await fetch("/api/orders/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, payment_status: "failed" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Đã đánh dấu thất bại ${orderNumber}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật");
    }
    setConfirming(null);
  };

  const unpaidCount = orders.filter(
    (o) => o.payment_status === "unpaid"
  ).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Xác nhận thanh toán</h1>
          {filter === "unpaid" && unpaidCount > 0 && (
            <p className="text-sm text-orange-600 mt-1">
              {unpaidCount} đơn hàng chờ xác nhận thanh toán
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4 mr-1" /> Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { value: "unpaid", label: "Chưa TT", icon: Clock },
            { value: "paid", label: "Đã TT", icon: CheckCircle },
            { value: "all", label: "Tất cả", icon: Filter },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value as any)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === opt.value
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <opt.icon className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { value: "", label: "Tất cả" },
            { value: "cod", label: "COD" },
            { value: "vnpay", label: "VNPay" },
            { value: "momo", label: "MoMo" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMethodFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                methodFilter === opt.value
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <Card className="gap-0 p-8 text-center text-gray-400">Đang tải...</Card>
      ) : orders.length === 0 ? (
        <Card className="gap-0 p-8 text-center text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
          <p>Không có đơn hàng nào</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const PayIcon = PAYMENT_ICONS[order.payment_method] || Banknote;
            const statusInfo =
              ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
            const isPaid = order.payment_status === "paid";
            const isFailed = order.payment_status === "failed";

            return (
              <Card
                key={order.id}
                className={`gap-0 p-4 ${
                  isPaid
                    ? "border-green-200 bg-green-50/50"
                    : isFailed
                    ? "border-red-200 bg-red-50/50"
                    : "border-orange-200 bg-orange-50/30"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Order info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isPaid
                          ? "bg-green-100 text-green-600"
                          : isFailed
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      <PayIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {order.order_number}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            isPaid
                              ? "bg-green-100 text-green-700"
                              : isFailed
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {isPaid
                            ? "Đã TT"
                            : isFailed
                            ? "Thất bại"
                            : "Chưa TT"}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${statusInfo?.color}`}
                        >
                          {statusInfo?.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {order.profiles?.full_name || "N/A"} ·{" "}
                        {order.profiles?.phone || ""} ·{" "}
                        {PAYMENT_LABELS[order.payment_method] || order.payment_method} ·{" "}
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-green-600">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isPaid && !isFailed && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            confirmPayment(order.id, order.order_number)
                          }
                          disabled={confirming === order.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {confirming === order.id
                            ? "..."
                            : "Xác nhận"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() =>
                            markFailed(order.id, order.order_number)
                          }
                          disabled={confirming === order.id}
                        >
                          Thất bại
                        </Button>
                      </>
                    )}
                    <Link href={`/admin/don-hang/${order.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
