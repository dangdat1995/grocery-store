"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, formatPrice } from "@/lib/format";
import {
  Search,
  Users,
  Crown,
  ShoppingCart,
  Ticket,
  ArrowUpDown,
} from "lucide-react";

const TIER_INFO: Record<string, { label: string; color: string; icon: string }> = {
  new: { label: "Mới", color: "bg-gray-100 text-gray-600", icon: "🌱" },
  bronze: { label: "Đồng", color: "bg-amber-100 text-amber-700", icon: "🥉" },
  silver: { label: "Bạc", color: "bg-slate-200 text-slate-700", icon: "🥈" },
  gold: { label: "Vàng", color: "bg-yellow-100 text-yellow-700", icon: "🥇" },
  platinum: { label: "Kim Cương", color: "bg-purple-100 text-purple-700", icon: "💎" },
};

type SortField = "total_spent" | "total_orders" | "created_at" | "last_order_at";
type SortDir = "asc" | "desc";

interface Props {
  customers: any[];
}

export default function CustomerListClient({ customers }: Props) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("total_spent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const totalSpent = customers.reduce((s, c) => s + (c.total_spent || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.total_orders || 0), 0);
  const tierCounts = customers.reduce((acc: Record<string, number>, c) => {
    const tier = c.loyalty_tier || "new";
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const filtered = useMemo(() => {
    let result = [...customers];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
      );
    }

    // Tier
    if (tierFilter !== "all") {
      result = result.filter((c) => (c.loyalty_tier || "new") === tierFilter);
    }

    // Activity
    if (activityFilter === "active") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      result = result.filter((c) => c.last_order_at && c.last_order_at >= thirtyDaysAgo);
    } else if (activityFilter === "inactive") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      result = result.filter((c) => !c.last_order_at || c.last_order_at < thirtyDaysAgo);
    } else if (activityFilter === "vip") {
      result = result.filter((c) => (c.total_orders || 0) >= 10);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: number, bVal: number;
      if (sortField === "total_spent") { aVal = a.total_spent || 0; bVal = b.total_spent || 0; }
      else if (sortField === "total_orders") { aVal = a.total_orders || 0; bVal = b.total_orders || 0; }
      else if (sortField === "last_order_at") { aVal = a.last_order_at ? new Date(a.last_order_at).getTime() : 0; bVal = b.last_order_at ? new Date(b.last_order_at).getTime() : 0; }
      else { aVal = new Date(a.created_at).getTime(); bVal = new Date(b.created_at).getTime(); }
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });

    return result;
  }, [customers, search, tierFilter, activityFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5">Khách hàng</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
        <Card className="gap-0 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Tổng KH</p>
              <p className="text-lg font-bold">{customers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="gap-0 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Tổng đơn</p>
              <p className="text-lg font-bold">{totalOrders}</p>
            </div>
          </div>
        </Card>
        <Card className="gap-0 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Crown className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Tổng chi tiêu</p>
              <p className="text-lg font-bold">{formatPrice(totalSpent)}</p>
            </div>
          </div>
        </Card>
        <Card className="gap-0 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Hạng thành viên</p>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(tierCounts).map(([tier, count]) => (
                  <span key={tier} className="text-[9px]">{TIER_INFO[tier]?.icon}{count}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, SĐT..."
            className="pl-10"
          />
        </div>

        {/* Tier filter */}
        <div className="flex gap-1">
          <button
            onClick={() => setTierFilter("all")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tierFilter === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả hạng
          </button>
          {Object.entries(TIER_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setTierFilter(key)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tierFilter === key ? "bg-gray-800 text-white" : `${info.color} hover:opacity-80`
              }`}
            >
              {info.icon} {info.label}
              {tierCounts[key] ? ` (${tierCounts[key]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Activity filter row */}
      <div className="flex gap-1 mb-3 sm:mb-4 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Tất cả" },
          { key: "active", label: "Hoạt động (30 ngày)" },
          { key: "inactive", label: "Không hoạt động" },
          { key: "vip", label: "VIP (≥10 đơn)" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActivityFilter(f.key)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activityFilter === f.key
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500 self-center">{filtered.length}/{customers.length} khách</span>
      </div>

      {/* Customer list */}
      <Card className="gap-0 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3 font-medium">Khách hàng</th>
                <th className="p-3 font-medium">Hạng</th>
                <th className="p-3 font-medium">
                  <button onClick={() => toggleSort("total_orders")} className="flex items-center gap-1 hover:text-green-600">
                    Đơn hàng
                    <ArrowUpDown className={`w-3 h-3 ${sortField === "total_orders" ? "text-green-600" : "text-gray-300"}`} />
                  </button>
                </th>
                <th className="p-3 font-medium text-right">
                  <button onClick={() => toggleSort("total_spent")} className="flex items-center gap-1 hover:text-green-600 ml-auto">
                    Tổng chi tiêu
                    <ArrowUpDown className={`w-3 h-3 ${sortField === "total_spent" ? "text-green-600" : "text-gray-300"}`} />
                  </button>
                </th>
                <th className="p-3 font-medium">
                  <button onClick={() => toggleSort("last_order_at")} className="flex items-center gap-1 hover:text-green-600">
                    Đơn gần nhất
                    <ArrowUpDown className={`w-3 h-3 ${sortField === "last_order_at" ? "text-green-600" : "text-gray-300"}`} />
                  </button>
                </th>
                <th className="p-3 font-medium">
                  <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1 hover:text-green-600">
                    Ngày tham gia
                    <ArrowUpDown className={`w-3 h-3 ${sortField === "created_at" ? "text-green-600" : "text-gray-300"}`} />
                  </button>
                </th>
                <th className="p-3 font-medium">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => {
                const tier = TIER_INFO[c.loyalty_tier || "new"] || TIER_INFO.new;
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium">{c.full_name || "Chưa cập nhật"}</p>
                      <p className="text-xs text-gray-500">{c.phone || "-"}</p>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tier.color}`}>
                        {tier.icon} {tier.label}
                      </span>
                    </td>
                    <td className="p-3 text-center font-medium">{c.total_orders || 0}</td>
                    <td className="p-3 text-right font-bold text-green-600">{formatPrice(c.total_spent || 0)}</td>
                    <td className="p-3 text-xs text-gray-500">{c.last_order_at ? formatDate(c.last_order_at) : "-"}</td>
                    <td className="p-3 text-xs text-gray-500">{formatDate(c.created_at)}</td>
                    <td className="p-3">
                      <Link href={`/admin/khach-hang/${c.id}`} className="text-green-600 hover:underline text-xs">Xem</Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {search || tierFilter !== "all" || activityFilter !== "all"
                      ? "Không tìm thấy khách hàng phù hợp"
                      : "Chưa có khách hàng"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
