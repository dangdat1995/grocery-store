"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDate } from "@/lib/format";
import {
  Search,
  Video,
  ImageIcon,
  CalendarDays,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

function getEventStatus(start: string, end: string) {
  const now = new Date();
  if (now < new Date(start)) return { key: "upcoming", label: "Sắp diễn ra", color: "bg-blue-100 text-blue-800" };
  if (now > new Date(end)) return { key: "ended", label: "Đã kết thúc", color: "bg-gray-100 text-gray-800" };
  return { key: "active", label: "Đang diễn ra", color: "bg-green-100 text-green-800" };
}

const STATUS_FILTERS = [
  { key: "all", label: "Tất cả", icon: CalendarDays, color: "bg-gray-100 text-gray-700 hover:bg-gray-200", activeColor: "bg-gray-800 text-white" },
  { key: "active", label: "Đang diễn ra", icon: Zap, color: "bg-green-50 text-green-700 hover:bg-green-100", activeColor: "bg-green-500 text-white" },
  { key: "upcoming", label: "Sắp diễn ra", icon: Clock, color: "bg-blue-50 text-blue-700 hover:bg-blue-100", activeColor: "bg-blue-500 text-white" },
  { key: "ended", label: "Đã kết thúc", icon: CheckCircle, color: "bg-gray-50 text-gray-600 hover:bg-gray-100", activeColor: "bg-gray-600 text-white" },
];

const DISCOUNT_FILTERS = [
  { key: "all", label: "Tất cả loại" },
  { key: "percent", label: "Giảm %" },
  { key: "fixed", label: "Giảm tiền" },
];

interface Props {
  events: any[];
}

export default function EventListClient({ events }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [discountFilter, setDiscountFilter] = useState("all");

  // Counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: events.length };
    events.forEach((e) => {
      const st = getEventStatus(e.start_date, e.end_date);
      counts[st.key] = (counts[st.key] || 0) + 1;
    });
    return counts;
  }, [events]);

  const filtered = useMemo(() => {
    let result = [...events];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }

    // Status
    if (statusFilter !== "all") {
      result = result.filter((e) => getEventStatus(e.start_date, e.end_date).key === statusFilter);
    }

    // Discount type
    if (discountFilter !== "all") {
      result = result.filter((e) => e.discount_type === discountFilter);
    }

    return result;
  }, [events, search, statusFilter, discountFilter]);

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

      {/* Search + discount filter */}
      <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên sự kiện..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          {DISCOUNT_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setDiscountFilter(f.key)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                discountFilter === f.key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">{filtered.length}/{events.length} sự kiện</span>
      </div>

      {/* Table */}
      <Card className="gap-0 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3 font-medium">Tên sự kiện</th>
                <th className="p-3 font-medium">Giảm giá</th>
                <th className="p-3 font-medium">Thời gian</th>
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium">SP tham gia</th>
                <th className="p-3 font-medium">Media</th>
                <th className="p-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event: any) => {
                const status = getEventStatus(event.start_date, event.end_date);
                return (
                  <tr key={event.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.description}</p>
                    </td>
                    <td className="p-3">
                      {event.discount_type === "percent"
                        ? `${event.discount_value}%`
                        : formatPrice(event.discount_value)}
                    </td>
                    <td className="p-3 text-xs">
                      <p>{formatDate(event.start_date)}</p>
                      <p className="text-gray-400">→ {formatDate(event.end_date)}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-3">{event.event_products?.[0]?.count || 0} SP</td>
                    <td className="p-3">
                      {(event.media || []).length > 0 ? (
                        <div className="flex items-center gap-1">
                          {(event.media as any[]).filter((m: any) => m.url).slice(0, 2).map((m: any, i: number) => (
                            <div key={i} className="w-10 h-10 rounded border overflow-hidden bg-gray-50">
                              {m.type === "video" ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <Video className="w-4 h-4 text-gray-400" />
                                </div>
                              ) : (
                                <img src={m.url} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                          {(event.media as any[]).filter((m: any) => m.url).length > 2 && (
                            <span className="text-[10px] text-gray-400">+{(event.media as any[]).filter((m: any) => m.url).length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">--</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Link href={`/admin/su-kien/${event.id}`} className="text-green-600 hover:underline text-xs">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">
                  {search || statusFilter !== "all" || discountFilter !== "all"
                    ? "Không tìm thấy sự kiện phù hợp"
                    : "Chưa có sự kiện nào"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
