export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/constants";
import { ArrowLeft, Crown, ShoppingCart, Ticket, Calendar, Coins } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VoucherSender from "./VoucherSender";
import CustomerAccountActions from "./CustomerAccountActions";
import PointsManager from "./PointsManager";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

interface Props {
  params: Promise<{ id: string }>;
}

const TIER_INFO: Record<string, { label: string; color: string; icon: string; next?: string; nextAt?: string }> = {
  new: { label: "Mới", color: "bg-gray-100 text-gray-600", icon: "🌱", next: "Đồng", nextAt: "3 đơn hoặc 1.000.000đ" },
  bronze: { label: "Đồng", color: "bg-amber-100 text-amber-700", icon: "🥉", next: "Bạc", nextAt: "10 đơn hoặc 5.000.000đ" },
  silver: { label: "Bạc", color: "bg-slate-200 text-slate-700", icon: "🥈", next: "Vàng", nextAt: "20 đơn hoặc 10.000.000đ" },
  gold: { label: "Vàng", color: "bg-yellow-100 text-yellow-700", icon: "🥇", next: "Kim Cương", nextAt: "50 đơn hoặc 20.000.000đ" },
  platinum: { label: "Kim Cương", color: "bg-purple-100 text-purple-700", icon: "💎" },
};

const MOCK_CUSTOMER: Record<string, any> = {
  "1": {
    profile: { id: "1", full_name: "Nguyễn Văn A", phone: "0901234567", created_at: "2026-01-15T10:00:00Z", total_orders: 25, total_spent: 8500000, loyalty_tier: "gold", last_order_at: "2026-04-01T10:00:00Z", note: "Khách quen, hay mua vào cuối tuần", points_balance: 1205 },
    orders: [
      { id: "1", order_number: "GH-20260401-001", total: 205000, status: "pending", payment_status: "unpaid", created_at: "2026-04-01T10:00:00Z" },
      { id: "o2", order_number: "GH-20260328-005", total: 350000, status: "delivered", payment_status: "paid", created_at: "2026-03-28T14:00:00Z" },
      { id: "o3", order_number: "GH-20260325-003", total: 180000, status: "delivered", payment_status: "paid", created_at: "2026-03-25T09:00:00Z" },
      { id: "o4", order_number: "GH-20260320-002", total: 420000, status: "delivered", payment_status: "paid", created_at: "2026-03-20T11:00:00Z" },
      { id: "o5", order_number: "GH-20260315-001", total: 95000, status: "delivered", payment_status: "paid", created_at: "2026-03-15T08:00:00Z" },
    ],
    vouchers: [
      { code: "KHACHVIP-10", discount_type: "percent", discount_value: 10, used: false },
      { code: "FREESHIP-A", discount_type: "free_ship", discount_value: 0, used: true },
    ],
  },
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  let profile: any = null;
  let orders: any[] = [];
  let vouchers: any[] = [];
  let customerEmail: string | null = null;

  if (isDemo) {
    const mock = MOCK_CUSTOMER[id] || MOCK_CUSTOMER["1"];
    profile = mock.profile;
    orders = mock.orders;
    vouchers = mock.vouchers;
    customerEmail = "nguyenvana@gmail.com";
  } else {
    const supabase = await createClient();
    const { data: p } = await supabase.from("profiles").select("*").eq("id", id).single();
    profile = p;
    if (profile) {
      // Get email from auth
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(id);
        customerEmail = authUser?.user?.email || null;
      } catch {}

      const { data: o } = await supabase
        .from("orders")
        .select("id, order_number, total, status, payment_status, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(20);
      orders = o || [];

      const { data: vd } = await supabase
        .from("voucher_distributions")
        .select("*, vouchers(code, discount_type, discount_value)")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      vouchers = (vd || []).map((d: any) => ({ ...d.vouchers, reason: d.reason }));
    }
  }

  if (!profile) notFound();

  const tier = TIER_INFO[profile.loyalty_tier || "new"] || TIER_INFO.new;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
        <Link href="/admin/khach-hang">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-lg sm:text-xl font-bold">Chi tiết khách hàng</h1>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <Card className="gap-0 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{profile.full_name || "Chưa cập nhật"}</h2>
              <p className="text-sm text-gray-500">{profile.phone || "-"}</p>
              <p className="text-xs text-gray-400 mt-1">Tham gia: {formatDate(profile.created_at)}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${tier.color}`}>
              {tier.icon} {tier.label}
            </span>
          </div>

          {/* Loyalty progress */}
          <div className="mt-4 grid grid-cols-4 gap-3 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <ShoppingCart className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold">{profile.total_orders || 0}</p>
              <p className="text-[10px] text-gray-500">Đơn hàng</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <Crown className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-xl font-bold">{formatPrice(profile.total_spent || 0)}</p>
              <p className="text-[10px] text-gray-500">Tổng chi tiêu</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <Coins className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xl font-bold">{profile.points_balance || 0}</p>
              <p className="text-[10px] text-gray-500">Điểm tích luỹ</p>
            </div>
          </div>

          {tier.next && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              Cần thêm <strong>{tier.nextAt}</strong> để lên hạng <strong>{tier.next}</strong>
            </p>
          )}

          {profile.note && (
            <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <strong>Ghi chú:</strong> {profile.note}
            </div>
          )}
        </Card>

        {/* Account Management */}
        <CustomerAccountActions
          customerId={id}
          fullName={profile.full_name}
          phone={profile.phone}
          email={customerEmail}
          role={profile.role || "customer"}
        />

        {/* Points Manager */}
        <PointsManager customerId={id} customerName={profile.full_name} currentBalance={profile.points_balance || 0} />

        {/* Send Voucher */}
        <VoucherSender customerId={id} customerName={profile.full_name} />

        {/* Vouchers received */}
        {vouchers.length > 0 && (
          <Card className="gap-0 p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-purple-600" /> Voucher đã nhận
            </h3>
            <div className="space-y-2">
              {vouchers.map((v: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <div>
                    <code className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-mono">{v.code}</code>
                    <span className="ml-2 text-xs text-gray-500">
                      {v.discount_type === "percent" ? `Giảm ${v.discount_value}%` : v.discount_type === "free_ship" ? "Miễn phí ship" : `Giảm ${formatPrice(v.discount_value)}`}
                    </span>
                  </div>
                  {v.reason && <span className="text-[10px] text-gray-400">{v.reason}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Order history */}
        <Card className="gap-0 p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-600" /> Lịch sử đơn hàng ({orders.length})
          </h3>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có đơn hàng</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o: any) => {
                const statusInfo = ORDER_STATUSES[o.status as keyof typeof ORDER_STATUSES];
                return (
                  <Link key={o.id} href={`/admin/don-hang/${o.id}`} className="flex items-center justify-between text-sm py-2 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded">
                    <div>
                      <span className="font-mono text-xs">{o.order_number}</span>
                      <p className="text-xs text-gray-400">{formatDate(o.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusInfo?.color || "bg-gray-100"}`}>
                        {statusInfo?.label || o.status}
                      </span>
                      <span className={`text-xs font-medium ${o.payment_status === "paid" ? "text-green-600" : "text-gray-500"}`}>
                        {o.payment_status === "paid" ? "✓" : "○"}
                      </span>
                      <span className="font-bold text-green-600">{formatPrice(o.total)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
