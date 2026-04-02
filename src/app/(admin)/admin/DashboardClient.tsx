"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/constants";
import {
  ShoppingCart, TrendingUp, Package, Users, Eye,
  ArrowUpRight, ArrowDownRight, Clock, AlertTriangle,
  ChevronRight, Banknote, CreditCard, Warehouse,
} from "lucide-react";

interface DashboardData {
  totalProducts: number;
  totalCustomers: number;
  today: { orders: number; revenue: number };
  yesterday: { orders: number; revenue: number };
  thisWeek: { orders: number; revenue: number };
  thisMonth: { orders: number; revenue: number };
  pendingOrders: number;
  unpaidOrders: number;
  recentOrders: {
    id: string; order_number: string; total: number;
    status: string; payment_status: string; payment_method: string;
    created_at: string; customer_name: string;
  }[];
  lowStock: { id: string; name: string; stock: number }[];
  visitsByDay: { date: string; visits: number }[];
  todayVisits: number;
}

type Period = "today" | "week" | "month";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}p trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h trước`;
  const days = Math.floor(hrs / 24);
  return `${days}d trước`;
}

function Growth({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(pct)}%
    </span>
  );
}

export default function DashboardClient({ data, isDemo }: { data: DashboardData; isDemo: boolean }) {
  const [period, setPeriod] = useState<Period>("today");

  const periodData = period === "today" ? data.today : period === "week" ? data.thisWeek : data.thisMonth;
  const periodLabel = period === "today" ? "Hôm nay" : period === "week" ? "Tuần này" : "Tháng này";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Dashboard</h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Tổng quan cửa hàng</p>
        </div>
        {isDemo && (
          <span className="text-[10px] bg-yellow-100 text-yellow-700 font-medium px-2 py-1 rounded-lg">Demo</span>
        )}
      </div>

      {/* Alert bar */}
      {(data.pendingOrders > 0 || data.unpaidOrders > 0 || data.lowStock.length > 0) && (
        <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {data.pendingOrders > 0 && (
            <Link href="/admin/don-hang" className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium shrink-0 hover:bg-orange-100 transition-colors">
              <Clock className="w-3.5 h-3.5" />
              {data.pendingOrders} chờ xử lý
            </Link>
          )}
          {data.unpaidOrders > 0 && (
            <Link href="/admin/don-hang" className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium shrink-0 hover:bg-red-100 transition-colors">
              <Banknote className="w-3.5 h-3.5" />
              {data.unpaidOrders} chưa TT
            </Link>
          )}
          {data.lowStock.length > 0 && (
            <Link href="/admin/kho" className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium shrink-0 hover:bg-amber-100 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />
              {data.lowStock.length} sắp hết
            </Link>
          )}
        </div>
      )}

      {/* Period toggle + Revenue card */}
      <Card className="gap-0 p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex gap-1">
            {([
              { key: "today" as Period, label: "Hôm nay" },
              { key: "week" as Period, label: "Tuần" },
              { key: "month" as Period, label: "Tháng" },
            ]).map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                  period === p.key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 hidden sm:block">{periodLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Revenue */}
          <div>
            <p className="text-[11px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Doanh thu</p>
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatPrice(periodData.revenue)}</p>
              {period === "today" && <Growth current={data.today.revenue} previous={data.yesterday.revenue} />}
            </div>
          </div>
          {/* Orders */}
          <div>
            <p className="text-[11px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Đơn hàng</p>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <p className="text-xl sm:text-2xl font-bold">{periodData.orders}</p>
              {period === "today" && <Growth current={data.today.orders} previous={data.yesterday.orders} />}
            </div>
            {periodData.orders > 0 && (
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                TB {formatPrice(Math.round(periodData.revenue / periodData.orders))}/đơn
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
        {[
          { label: "Sản phẩm", value: data.totalProducts, icon: Package, color: "text-purple-600 bg-purple-50", href: "/admin/san-pham" },
          { label: "Khách hàng", value: data.totalCustomers, icon: Users, color: "text-blue-600 bg-blue-50", href: "/admin/khach-hang" },
          { label: "Truy cập", value: data.todayVisits, icon: Eye, color: "text-cyan-600 bg-cyan-50", href: "/admin/phan-tich" },
          { label: "Kho hàng", value: `${data.lowStock.length} cảnh báo`, icon: Warehouse, color: "text-amber-600 bg-amber-50", href: "/admin/kho" },
        ].map(s => (
          <Link key={s.label} href={s.href} className="block">
            <Card className="gap-0 p-2.5 sm:p-3 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 truncate">{s.label}</p>
                  <p className="text-xs sm:text-sm font-bold truncate">{s.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Visit chart */}
      {data.visitsByDay.length > 0 && (
        <Card className="gap-0 p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase mb-2.5 sm:mb-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-600" /> Lượt truy cập 7 ngày
          </p>
          <div className="flex items-end gap-1 sm:gap-1.5 h-16 sm:h-20">
            {data.visitsByDay.slice(-7).map(d => {
              const max = Math.max(...data.visitsByDay.slice(-7).map(x => x.visits), 1);
              const pct = (d.visits / max) * 100;
              const isToday = d.date === new Date().toISOString().split("T")[0];
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 sm:gap-1">
                  <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium">{d.visits}</span>
                  <div
                    className={`w-full rounded-t-md min-h-[4px] transition-all ${isToday ? "bg-cyan-500" : "bg-cyan-200"}`}
                    style={{ height: `${Math.max(pct, 5)}%` }}
                  />
                  <span className="text-[8px] sm:text-[9px] text-gray-400">{d.date.slice(8)}/{d.date.slice(5, 7)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Bottom: Recent orders + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Recent orders — full width on mobile, 2 cols on lg */}
        <div className="lg:col-span-2">
          <Card className="gap-0 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-blue-600" /> Đơn gần đây
              </p>
              <Link href="/admin/don-hang" className="text-[11px] text-green-600 hover:underline">Xem tất cả</Link>
            </div>

            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Chưa có đơn hàng</p>
            ) : (
              <div className="space-y-0.5 sm:space-y-1">
                {data.recentOrders.map(order => {
                  const st = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
                  const isPending = order.status === "pending";
                  const isUnpaid = order.payment_status !== "paid";
                  return (
                    <Link key={order.id} href={`/admin/don-hang/${order.id}`}
                      className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-lg transition-all hover:shadow-sm ${
                        isPending && isUnpaid ? "bg-yellow-50" : isPending ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold shrink-0 ${st?.color || "bg-gray-100"}`}>
                        {st?.label || order.status}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{order.customer_name}</p>
                          <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 hidden sm:inline">{order.order_number}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {timeAgo(order.created_at)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            {order.payment_method === "cod" ? <Banknote className="w-2.5 h-2.5" /> : <CreditCard className="w-2.5 h-2.5" />}
                            {order.payment_status === "paid" ? "Đã TT" : "Chưa TT"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 shrink-0">{formatPrice(order.total)}</p>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0 hidden sm:block" />
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar: Low stock + Month summary — stack on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
          {/* Low stock */}
          <Card className="gap-0 p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase mb-2.5 sm:mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Sắp hết hàng
            </p>
            {data.lowStock.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-400 text-center py-3 sm:py-4">Kho ổn</p>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {data.lowStock.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-700 truncate flex-1">{p.name}</span>
                    <span className={`font-bold shrink-0 ml-2 ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                      {p.stock === 0 ? "Hết" : `${p.stock}`}
                    </span>
                  </div>
                ))}
                <Link href="/admin/kho" className="block text-center text-[10px] sm:text-[11px] text-green-600 hover:underline pt-1">
                  Quản lý kho →
                </Link>
              </div>
            )}
          </Card>

          {/* Month summary */}
          <Card className="gap-0 p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase mb-2.5 sm:mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" /> Tháng này
            </p>
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Doanh thu</span>
                <span className="font-bold text-green-600">{formatPrice(data.thisMonth.revenue)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Đơn hàng</span>
                <span className="font-bold">{data.thisMonth.orders}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Giá trị TB</span>
                <span className="font-medium">
                  {data.thisMonth.orders > 0 ? formatPrice(Math.round(data.thisMonth.revenue / data.thisMonth.orders)) : "—"}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <Link href="/admin/phan-tich" className="block text-center text-[10px] sm:text-[11px] text-green-600 hover:underline">
                  Phân tích chi tiết →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
