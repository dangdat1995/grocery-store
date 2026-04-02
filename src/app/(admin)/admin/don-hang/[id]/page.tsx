export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/constants";
import OrderStatusUpdater from "./OrderStatusUpdater";
import PaymentConfirmButton from "./PaymentConfirmButton";
import InvoiceSection from "./InvoiceSection";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, StickyNote, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const MOCK_ORDERS: Record<string, any> = {
  "1": {
    id: "1", order_number: "GH-20260401-001", status: "pending", payment_method: "cod", payment_status: "unpaid",
    subtotal: 185000, delivery_fee: 20000, discount: 0, total: 205000,
    delivery_address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
    note: "Giao buổi chiều, gọi trước khi giao", created_at: "2026-04-01T10:00:00Z",
    profiles: { full_name: "Nguyễn Văn A", phone: "0901234567" },
    items: [
      { id: "i1", product_name: "Gạo ST25", product_price: 135000, quantity: 1, subtotal: 135000 },
      { id: "i2", product_name: "Rau muống", product_price: 8000, quantity: 2, subtotal: 16000 },
      { id: "i3", product_name: "Cà chua", product_price: 25000, quantity: 1, subtotal: 25000 },
      { id: "i4", product_name: "Trà xanh 0 độ", product_price: 10000, quantity: 1, subtotal: 10000 },
    ],
  },
  "2": {
    id: "2", order_number: "GH-20260401-002", status: "confirmed", payment_method: "vnpay", payment_status: "paid",
    subtotal: 300000, delivery_fee: 20000, discount: 0, total: 320000,
    delivery_address: "456 Lê Lợi, Quận 1, Hồ Chí Minh", note: null, created_at: "2026-04-01T09:30:00Z",
    profiles: { full_name: "Trần Thị B", phone: "0912345678" },
    items: [
      { id: "i5", product_name: "Thịt ba chỉ heo", product_price: 85000, quantity: 2, subtotal: 170000 },
      { id: "i6", product_name: "Sữa tươi TH 1L", product_price: 32000, quantity: 2, subtotal: 64000 },
      { id: "i7", product_name: "Cam sành", product_price: 45000, quantity: 1, subtotal: 45000 },
    ],
  },
  "3": {
    id: "3", order_number: "GH-20260401-003", status: "delivering", payment_method: "cod", payment_status: "unpaid",
    subtotal: 75000, delivery_fee: 20000, discount: 0, total: 95000,
    delivery_address: "789 Điện Biên Phủ, Quận 3, Hồ Chí Minh", note: null, created_at: "2026-04-01T08:00:00Z",
    profiles: { full_name: "Lê Văn C", phone: "0923456789" },
    items: [
      { id: "i8", product_name: "Chuối già Nam Mỹ", product_price: 32000, quantity: 1, subtotal: 32000 },
      { id: "i9", product_name: "Xoài cát Hoà Lộc", product_price: 75000, quantity: 1, subtotal: 75000 },
    ],
  },
  "4": {
    id: "4", order_number: "GH-20260331-001", status: "delivered", payment_method: "momo", payment_status: "paid",
    subtotal: 420000, delivery_fee: 30000, discount: 0, total: 450000,
    delivery_address: "12 Trần Hưng Đạo, Quận 5, Hồ Chí Minh", note: null, created_at: "2026-03-31T15:00:00Z",
    profiles: { full_name: "Phạm Thị D", phone: "0934567890" },
    items: [
      { id: "i10", product_name: "Sườn non bò Úc", product_price: 195000, quantity: 1, subtotal: 195000 },
      { id: "i11", product_name: "Cá hồi fillet", product_price: 175000, quantity: 1, subtotal: 175000 },
      { id: "i12", product_name: "Tôm sú", product_price: 145000, quantity: 1, subtotal: 145000 },
    ],
  },
  "5": {
    id: "5", order_number: "GH-20260331-002", status: "cancelled", payment_method: "vnpay", payment_status: "failed",
    subtotal: 78000, delivery_fee: 0, discount: 0, total: 78000,
    delivery_address: "99 Nguyễn Thị Minh Khai, Quận 1, Hồ Chí Minh", note: null, created_at: "2026-03-31T12:00:00Z",
    profiles: { full_name: "Hoàng Văn E", phone: "0945678901" },
    items: [
      { id: "i13", product_name: "Há cảo tôm thịt 500g", product_price: 68000, quantity: 1, subtotal: 68000 },
      { id: "i14", product_name: "Trà xanh 0 độ", product_price: 10000, quantity: 1, subtotal: 10000 },
    ],
  },
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  let order: any = null;

  if (isDemo) {
    order = MOCK_ORDERS[id];
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*), profiles(full_name, phone)")
      .eq("id", id)
      .single();
    order = data;
  }

  if (!order) notFound();

  const st = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
  const pm = (PAYMENT_METHODS as any)[order.payment_method];

  return (
    <div className="max-w-2xl mx-auto px-0 sm:px-0">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/don-hang">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">{order.order_number}</h1>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${st?.color}`}>{st?.label}</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {formatDate(order.created_at)}
          </p>
        </div>
        <p className="text-xl font-bold text-green-600">{formatPrice(order.total)}</p>
      </div>

      <div className="space-y-3">
        {/* ── Khách + giao hàng ── */}
        <Card className="gap-0 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">{order.profiles?.full_name || "Khách"}</p>
              {order.profiles?.phone && (
                <a href={`tel:${order.profiles.phone}`} className="flex items-center gap-1 text-blue-600 text-xs hover:underline">
                  <Phone className="w-3 h-3" /> {order.profiles.phone}
                </a>
              )}
            </div>
            {order.delivery_address && (
              <p className="flex items-start gap-1.5 text-gray-500 text-xs">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {order.delivery_address}
              </p>
            )}
            {order.note && (
              <p className="flex items-start gap-1.5 text-orange-600 text-xs bg-orange-50 rounded-lg px-2.5 py-1.5">
                <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {order.note}
              </p>
            )}
            <div className="flex items-center gap-1.5 pt-1">
              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{pm?.label || order.payment_method}</span>
              <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="text-[10px] ml-1">
                {order.payment_status === "paid" ? "Đã thanh toán" :
                 order.payment_status === "refunded" ? "Hoàn tiền" :
                 order.payment_status === "failed" ? "Lỗi" : "Chưa thanh toán"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* ── Sản phẩm ── */}
        <Card className="gap-0 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Sản phẩm ({order.items?.length || 0})</p>
          <div className="space-y-1.5">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                  <p className="text-[11px] text-gray-400">{formatPrice(item.product_price)} x {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700 shrink-0">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t mt-2 pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Tạm tính</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Phí ship</span>
              <span>{order.delivery_fee === 0 ? "Miễn phí" : formatPrice(order.delivery_fee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Giảm giá</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>Tổng</span>
              <span className="text-green-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </Card>

        {/* ── Actions ── */}
        <PaymentConfirmButton orderId={order.id} orderNumber={order.order_number} paymentStatus={order.payment_status} paymentMethod={order.payment_method} />
        <OrderStatusUpdater orderId={order.id} orderNumber={order.order_number} currentStatus={order.status} currentShippingCode={order.shipping_code} currentCarrier={order.shipping_carrier} userId={order.user_id} orderTotal={order.total} />
        <InvoiceSection orderId={order.id} orderNumber={order.order_number} />
      </div>
    </div>
  );
}
