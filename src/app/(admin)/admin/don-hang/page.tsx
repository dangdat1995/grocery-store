export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import OrderListClient from "./OrderListClient";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const MOCK_ORDERS = [
  { id: "1", order_number: "GH-20260401-001", profiles: { full_name: "Nguyễn Văn A", phone: "0901234567" }, total: 185000, payment_status: "unpaid", payment_method: "cod", status: "pending", created_at: "2026-04-01T10:00:00Z" },
  { id: "2", order_number: "GH-20260401-002", profiles: { full_name: "Trần Thị B", phone: "0912345678" }, total: 320000, payment_status: "paid", payment_method: "vnpay", status: "confirmed", created_at: "2026-04-01T09:30:00Z" },
  { id: "3", order_number: "GH-20260401-003", profiles: { full_name: "Lê Văn C", phone: "0923456789" }, total: 95000, payment_status: "unpaid", payment_method: "cod", status: "delivering", created_at: "2026-04-01T08:00:00Z" },
  { id: "4", order_number: "GH-20260331-001", profiles: { full_name: "Phạm Thị D", phone: "0934567890" }, total: 450000, payment_status: "paid", payment_method: "momo", status: "delivered", created_at: "2026-03-31T15:00:00Z" },
  { id: "5", order_number: "GH-20260331-002", profiles: { full_name: "Hoàng Văn E", phone: "0945678901" }, total: 78000, payment_status: "failed", payment_method: "vnpay", status: "cancelled", created_at: "2026-03-31T12:00:00Z" },
  { id: "6", order_number: "GH-20260330-001", profiles: { full_name: "Ngô Thị F", phone: "0956789012" }, total: 210000, payment_status: "paid", payment_method: "bank_transfer", status: "preparing", created_at: "2026-03-30T14:00:00Z" },
  { id: "7", order_number: "GH-20260330-002", profiles: { full_name: "Đỗ Văn G", phone: "0967890123" }, total: 560000, payment_status: "paid", payment_method: "momo", status: "packed", created_at: "2026-03-30T11:00:00Z" },
  { id: "8", order_number: "GH-20260329-001", profiles: { full_name: "Vũ Thị H", phone: "0978901234" }, total: 125000, payment_status: "refunded", payment_method: "vnpay", status: "returned", created_at: "2026-03-29T09:00:00Z" },
  { id: "9", order_number: "GH-20260329-002", profiles: { full_name: "Bùi Văn I", phone: "0989012345" }, total: 380000, payment_status: "paid", payment_method: "cod", status: "waiting_pickup", created_at: "2026-03-29T16:30:00Z" },
  { id: "10", order_number: "GH-20260328-001", profiles: { full_name: "Lý Thị K", phone: "0990123456" }, total: 275000, payment_status: "refunded", payment_method: "vnpay", status: "refunded", created_at: "2026-03-28T10:00:00Z" },
];

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  if (isDemo) {
    orders = MOCK_ORDERS;
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("orders")
        .select("*, profiles(full_name, phone)")
        .order("created_at", { ascending: false });
      orders = data || [];
    } catch {
      orders = [];
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <OrderListClient orders={orders} />
    </div>
  );
}
