export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CheckCircle, Clock, Package, Truck, MapPin, ArrowLeft, Phone, CreditCard, FileText, Download, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/constants";
import type { Metadata } from "next";
import OrderTimeline from "./OrderTimeline";
import DeliveryMap from "./DeliveryMap";
import BankTransferInfo from "@/components/store/BankTransferInfo";
import InvoiceButtons from "@/components/admin/InvoiceButtons";
import { STORE_LAT, STORE_LNG } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Theo dõi đơn hàng" };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  let order: any = null;

  if (isDemo) {
    // Demo order data
    order = {
      id: "demo-1",
      order_number: id.startsWith("GH-") ? id : "GH-20260401-001",
      status: "delivering",
      payment_method: "cod",
      payment_status: "unpaid",
      subtotal: 185000,
      delivery_fee: 20000,
      discount: 0,
      total: 205000,
      delivery_address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
      delivery_lat: 10.7736,
      delivery_lng: 106.7042,
      delivery_distance_km: 3.2,
      note: "Giao buổi chiều, gọi trước khi giao",
      created_at: "2026-04-01T10:30:00Z",
      confirmed_at: "2026-04-01T10:35:00Z",
      preparing_at: "2026-04-01T11:00:00Z",
      shipping_at: "2026-04-01T13:30:00Z",
      shipping_code: "GHN-ABC123456",
      shipping_carrier: "ghn",
      items: [
        { id: "i1", product_name: "Gạo ST25", product_price: 135000, quantity: 1, subtotal: 135000 },
        { id: "i2", product_name: "Rau muống", product_price: 8000, quantity: 2, subtotal: 16000 },
        { id: "i3", product_name: "Cà chua", product_price: 25000, quantity: 1, subtotal: 25000 },
        { id: "i4", product_name: "Trà xanh 0 độ", product_price: 10000, quantity: 1, subtotal: 10000 },
      ],
    };
  } else {
    const supabase = await createClient();
    let { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("order_number", id)
      .single();

    if (!data) {
      const result = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", id)
        .single();
      data = result.data;
    }
    order = data;
  }

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/san-pham" className="inline-flex items-center text-sm text-gray-400 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Tiếp tục mua sắm
      </Link>

      {/* Order header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
          Theo dõi đơn hàng
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="font-mono bg-green-50 text-green-700 px-2.5 py-0.5 rounded-lg font-bold">
            {order.order_number}
          </span>
          <span>Đặt ngày {formatDate(order.created_at)}</span>
        </div>
      </div>

      {/* Timeline */}
      <OrderTimeline
        status={order.status}
        shippingCode={order.shipping_code}
        shippingCarrier={order.shipping_carrier}
        timestamps={{
          created_at: order.created_at,
          confirmed_at: order.confirmed_at,
          preparing_at: order.preparing_at,
          shipping_at: order.shipping_at,
          delivered_at: order.delivered_at,
        }}
      />

      {/* Delivery Map */}
      <DeliveryMap
        storeLat={STORE_LAT}
        storeLng={STORE_LNG}
        customerLat={order.delivery_lat || null}
        customerLng={order.delivery_lng || null}
        deliveryAddress={order.delivery_address || ""}
        distanceKm={order.delivery_distance_km || null}
        status={order.status}
      />

      {/* Order Items */}
      <Card className="gap-0 p-0 rounded-2xl overflow-hidden border-0 shadow-md mb-4 animate-fade-in-up">
        <div className="p-5">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Sản phẩm đã đặt
          </h3>
          <div className="space-y-0">
            {order.items?.map((item: any, i: number) => (
              <div key={item.id} className={`flex justify-between py-3 ${i < order.items.length - 1 ? "border-b border-gray-100" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg shrink-0">
                    🛒
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.product_name}</p>
                    <p className="text-gray-400 text-xs">
                      {formatPrice(item.product_price)} x {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-sm">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-5 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Tạm tính</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Phí giao hàng</span>
            <span>{order.delivery_fee === 0 ? "Miễn phí" : formatPrice(order.delivery_fee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Giảm giá</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-lg pt-2 border-t border-gray-200">
            <span>Tổng cộng</span>
            <span className="text-green-600">{formatPrice(order.total)}</span>
          </div>
        </div>
      </Card>

      {/* Delivery Info */}
      <Card className="gap-0 rounded-2xl border-0 shadow-md p-5 animate-fade-in-up">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Thông tin giao hàng
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-gray-700">{order.delivery_address}</p>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
            <p className="text-gray-700">
              {order.payment_method === "cod" ? "Thanh toán khi nhận hàng (COD)" : order.payment_method?.toUpperCase()}
              {order.payment_status === "paid" && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Đã thanh toán</span>
              )}
            </p>
          </div>
          {order.note && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-gray-700">{order.note}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Bank Transfer Info */}
      {order.payment_method === "bank_transfer" && order.payment_status !== "paid" && (
        <div className="mt-4 animate-fade-in-up">
          <BankTransferInfo
            orderNumber={order.order_number}
            amount={order.total}
          />
        </div>
      )}

      {/* Invoice */}
      <Card className="gap-0 rounded-2xl border-0 shadow-md p-5 mt-4 animate-fade-in-up">
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          Hoá đơn
        </h3>
        <InvoiceButtons orderId={order.order_number || order.id} />
      </Card>

      {/* Help */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400 mb-2">Cần hỗ trợ?</p>
        <a href="tel:0901234567">
          <Button variant="outline" size="sm" className="rounded-xl">
            <Phone className="w-4 h-4 mr-1.5" /> Gọi hotline 0901234567
          </Button>
        </a>
      </div>
    </div>
  );
}
