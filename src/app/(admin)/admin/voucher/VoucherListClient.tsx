"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDate } from "@/lib/format";
import { DISCOUNT_TYPES } from "@/lib/constants";
import AutoDistributeButton from "./AutoDistributeButton";
import {
  Search,
  Ticket,
  CheckCircle,
  PauseCircle,
  XCircle,
  Truck,
  Percent,
  Banknote,
} from "lucide-react";

function getVoucherStatus(v: any) {
  const now = new Date();
  if (now > new Date(v.end_date)) return { key: "expired", label: "Hết hạn", color: "bg-gray-100 text-gray-800" };
  if (v.usage_limit > 0 && v.used_count >= v.usage_limit) return { key: "used_up", label: "Đã dùng hết", color: "bg-red-100 text-red-800" };
  if (!v.is_active) return { key: "paused", label: "Tạm dừng", color: "bg-yellow-100 text-yellow-800" };
  return { key: "active", label: "Hoạt động", color: "bg-green-100 text-green-800" };
}

const STATUS_FILTERS = [
  { key: "all", label: "Tất cả", icon: Ticket, color: "bg-gray-100 text-gray-700 hover:bg-gray-200", activeColor: "bg-gray-800 text-white" },
  { key: "active", label: "Hoạt động", icon: CheckCircle, color: "bg-green-50 text-green-700 hover:bg-green-100", activeColor: "bg-green-500 text-white" },
  { key: "paused", label: "Tạm dừng", icon: PauseCircle, color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100", activeColor: "bg-yellow-500 text-white" },
  { key: "used_up", label: "Đã dùng hết", icon: XCircle, color: "bg-red-50 text-red-700 hover:bg-red-100", activeColor: "bg-red-500 text-white" },
  { key: "expired", label: "Hết hạn", icon: XCircle, color: "bg-gray-50 text-gray-600 hover:bg-gray-100", activeColor: "bg-gray-600 text-white" },
];

const TYPE_FILTERS = [
  { key: "all", label: "Tất cả loại" },
  { key: "percent", label: "Giảm %", icon: Percent },
  { key: "fixed", label: "Giảm tiền", icon: Banknote },
  { key: "free_ship", label: "Free ship", icon: Truck },
];

interface Props {
  vouchers: any[];
}

export default function VoucherListClient({ vouchers }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: vouchers.length };
    vouchers.forEach((v) => {
      const st = getVoucherStatus(v);
      counts[st.key] = (counts[st.key] || 0) + 1;
    });
    return counts;
  }, [vouchers]);

  const filtered = useMemo(() => {
    let result = [...vouchers];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.code?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q)
      );
    }

    // Status
    if (statusFilter !== "all") {
      result = result.filter((v) => getVoucherStatus(v).key === statusFilter);
    }

    // Type
    if (typeFilter !== "all") {
      result = result.filter((v) => v.discount_type === typeFilter);
    }

    return result;
  }, [vouchers, search, statusFilter, typeFilter]);

  return (
    <>
      {/* Status tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.key;
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive ? f.activeColor : f.color
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-white/20" : "bg-black/5"}`}>
                {statusCounts[f.key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + type filter */}
      <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã voucher, mô tả..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                typeFilter === f.key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">{filtered.length}/{vouchers.length} voucher</span>
      </div>

      {/* Table */}
      <Card className="gap-0 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3 font-medium">Mã</th>
                <th className="p-3 font-medium">Giảm giá</th>
                <th className="p-3 font-medium">Đơn tối thiểu</th>
                <th className="p-3 font-medium">Đã dùng</th>
                <th className="p-3 font-medium">Thời hạn</th>
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium">Phát voucher</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v: any) => {
                const status = getVoucherStatus(v);
                const typeInfo = DISCOUNT_TYPES[v.discount_type as keyof typeof DISCOUNT_TYPES];
                return (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">
                      <span className="font-mono font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {v.code}
                      </span>
                      {v.description && (
                        <p className="text-[10px] text-gray-400 mt-1 max-w-[160px] truncate">{v.description}</p>
                      )}
                    </td>
                    <td className="p-3">
                      {v.discount_type === "percent"
                        ? `${v.discount_value}%`
                        : v.discount_type === "free_ship"
                        ? "Miễn phí ship"
                        : formatPrice(v.discount_value)}
                      {v.max_discount && (
                        <span className="text-xs text-gray-400 ml-1">
                          (tối đa {formatPrice(v.max_discount)})
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {v.min_order_amount > 0 ? formatPrice(v.min_order_amount) : "Không"}
                    </td>
                    <td className="p-3">
                      <span className={v.usage_limit > 0 && v.used_count >= v.usage_limit ? "text-red-600 font-bold" : ""}>
                        {v.used_count}
                      </span>
                      /{v.usage_limit || "∞"}
                    </td>
                    <td className="p-3 text-xs">
                      <p>{formatDate(v.start_date)}</p>
                      <p className="text-gray-400">→ {formatDate(v.end_date)}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-3">
                      {status.key === "active" && (
                        <AutoDistributeButton voucherId={v.id} voucherCode={v.code} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">
                  {search || statusFilter !== "all" || typeFilter !== "all"
                    ? "Không tìm thấy voucher phù hợp"
                    : "Chưa có voucher nào"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
