"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/constants";
import {
  Search, Package, Clock, CheckCircle, Truck, XCircle,
  ChevronRight, Banknote, CreditCard, Phone, MapPin,
} from "lucide-react";

// ── Tab groups ──
const TABS = [
  { key: "all", label: "Tất cả", statuses: [] as string[], icon: Package },
  { key: "new", label: "Mới", statuses: ["pending"], icon: Clock },
  { key: "doing", label: "Đang xử lý", statuses: ["confirmed", "preparing", "packed"], icon: Package },
  { key: "ship", label: "Giao hàng", statuses: ["waiting_pickup", "delivering"], icon: Truck },
  { key: "done", label: "Xong", statuses: ["delivered"], icon: CheckCircle },
  { key: "cancel", label: "Huỷ/Trả", statuses: ["cancelled", "returned", "refunded"], icon: XCircle },
];

function paymentIcon(method: string) {
  if (method === "cod") return <Banknote className="w-3 h-3" />;
  return <CreditCard className="w-3 h-3" />;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatDate(date);
}

export default function OrderListClient({ orders }: { orders: any[] }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [payFilter, setPayFilter] = useState<"all" | "unpaid" | "paid">("all");

  // ── Counts ──
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    TABS.forEach(t => {
      if (t.key !== "all") c[t.key] = orders.filter(o => t.statuses.includes(o.status)).length;
    });
    return c;
  }, [orders]);

  // ── Filter ──
  const filtered = useMemo(() => {
    let list = [...orders];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.order_number?.toLowerCase().includes(q) ||
        o.profiles?.full_name?.toLowerCase().includes(q) ||
        o.profiles?.phone?.includes(q)
      );
    }

    if (tab !== "all") {
      const t = TABS.find(t => t.key === tab);
      if (t) list = list.filter(o => t.statuses.includes(o.status));
    }

    if (payFilter === "unpaid") list = list.filter(o => o.payment_status !== "paid");
    else if (payFilter === "paid") list = list.filter(o => o.payment_status === "paid");

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [orders, search, tab, payFilter]);

  // ── Urgent count (pending + unpaid) ──
  const urgentCount = orders.filter(o => o.status === "pending" && o.payment_status !== "paid").length;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" /> Đơn hàng
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
            {orders.length} đơn
            {urgentCount > 0 && <span className="text-orange-600 font-medium"> · {urgentCount} cần xử lý</span>}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1.5 mb-3 sm:mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(t => {
          const Icon = t.icon;
          const count = counts[t.key] || 0;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium shrink-0 transition-all ${
                active ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              <span className={`text-[10px] ${active ? "text-gray-400" : "text-gray-400"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Search + pay filter ── */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Tìm mã đơn, tên, SĐT..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-lg text-sm" />
        </div>
        <div className="flex gap-1 shrink-0">
          {([
            { key: "all", label: "Tất cả" },
            { key: "unpaid", label: "Chưa TT" },
            { key: "paid", label: "Đã TT" },
          ] as const).map(p => (
            <button key={p.key} onClick={() => setPayFilter(p.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                payFilter === p.key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Order list ── */}
      <div className="space-y-1.5 sm:space-y-2">
        {filtered.map(order => {
          const st = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
          const isPending = order.status === "pending";
          const isUnpaid = order.payment_status !== "paid";

          return (
            <Link key={order.id} href={`/admin/don-hang/${order.id}`}
              className={`block rounded-xl border transition-all hover:shadow-sm ${
                isPending && isUnpaid ? "bg-yellow-50 border-yellow-200" :
                isPending ? "bg-blue-50 border-blue-200" :
                "bg-white border-gray-200"
              }`}>
              <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2.5 sm:py-3">

                {/* Status badge */}
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold shrink-0 ${st?.color || "bg-gray-100"}`}>
                  {st?.label || order.status}
                </span>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{order.profiles?.full_name || "Khách"}</p>
                    <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 hidden sm:inline">{order.order_number}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-0.5 text-[10px] sm:text-xs text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 sm:w-3 h-2.5 sm:h-3" /> {timeAgo(order.created_at)}
                    </span>
                    {order.profiles?.phone && (
                      <span className="flex items-center gap-0.5 hidden sm:flex">
                        <Phone className="w-3 h-3" /> {order.profiles.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment + total */}
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-800">{formatPrice(order.total)}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {paymentIcon(order.payment_method)}
                    <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                      {order.payment_status === "paid" ? "Đã TT" :
                       order.payment_status === "refunded" ? "Hoàn tiền" :
                       order.payment_status === "failed" ? "Lỗi TT" : "Chưa TT"}
                    </Badge>
                  </div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0 hidden sm:block" />
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Không có đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
