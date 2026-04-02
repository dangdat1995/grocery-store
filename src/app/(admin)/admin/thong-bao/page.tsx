"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isDemo } from "@/lib/demo";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import {
  Bell,
  Send,
  Plus,
  Trash2,
  Search,
  Package,
  Megaphone,
  CalendarDays,
  Info,
  Users,
  User,
  Globe,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  user_id?: string;
  is_global: boolean;
  is_read: boolean;
  created_at: string;
}

const TYPE_OPTIONS = [
  { value: "order", label: "Đơn hàng", icon: Package, color: "text-green-600 bg-green-50" },
  { value: "promo", label: "Khuyến mãi", icon: Megaphone, color: "text-orange-600 bg-orange-50" },
  { value: "event", label: "Sự kiện", icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
  { value: "system", label: "Hệ thống", icon: Info, color: "text-gray-600 bg-gray-100" },
  { value: "info", label: "Thông tin", icon: Info, color: "text-purple-600 bg-purple-50" },
];

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "promo",
    title: "Flash Sale cuoi tuan!",
    message: "Giam 30% tat ca rau cu qua. Chi ap dung 2 ngay cuoi tuan nay!",
    link: "/san-pham",
    is_global: true,
    is_read: false,
    created_at: "2026-04-01T09:00:00Z",
  },
  {
    id: "n2",
    type: "event",
    title: "Khai truong chi nhanh Q.7",
    message: "Mung khai truong chi nhanh moi tai Q.7. Tang voucher 50K cho 100 khach dau tien!",
    link: "/chi-nhanh",
    is_global: true,
    is_read: false,
    created_at: "2026-03-30T08:00:00Z",
  },
  {
    id: "n3",
    type: "order",
    title: "Don hang da xac nhan",
    message: "Don hang GH-20260401-001 da duoc xac nhan.",
    link: "/don-hang/demo-1",
    user_id: "user-1",
    is_global: false,
    is_read: true,
    created_at: "2026-03-29T14:30:00Z",
  },
  {
    id: "n4",
    type: "system",
    title: "Bao tri he thong",
    message: "He thong se bao tri vao 2:00 AM ngay 05/04/2026. Vui long thong cam.",
    is_global: true,
    is_read: true,
    created_at: "2026-03-28T10:00:00Z",
  },
];

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);

  // Form
  const [form, setForm] = useState({
    type: "promo",
    title: "",
    message: "",
    link: "",
    is_global: true,
  });

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    if (isDemo) {
      setNotifications(DEMO_NOTIFICATIONS);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/notifications/admin");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      toast.error("Lỗi tải thông báo");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
    const onAiAction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === "create_notification" && detail.item) {
        setNotifications((prev) => [detail.item, ...prev]);
        toast.success("AI vừa gửi thông báo mới!");
      } else if (detail?.action === "create_notification") {
        loadNotifications();
      }
    };
    window.addEventListener("ai-action-done", onAiAction);
    return () => window.removeEventListener("ai-action-done", onAiAction);
  }, [loadNotifications]);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    if (isDemo) {
      const newNotif: Notification = {
        id: Date.now().toString(),
        ...form,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      toast.success("Demo: Đã tạo thông báo");
      setShowForm(false);
      setForm({ type: "promo", title: "", message: "", link: "", is_global: true });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Đã gửi thông báo");
      setShowForm(false);
      setForm({ type: "promo", title: "", message: "", link: "", is_global: true });
      loadNotifications();
    } catch {
      toast.error("Lỗi gửi thông báo");
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Demo: Đã xoá thông báo");
      return;
    }
    try {
      const res = await fetch("/api/notifications/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Đã xoá thông báo");
    } catch {
      toast.error("Lỗi xoá");
    }
  };

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, typeFilter, search]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length };
    notifications.forEach((n) => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" /> Thông báo
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gửi thông báo cho khách hàng về đơn hàng, sự kiện, khuyến mãi
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          {showForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showForm ? "Đóng" : "Tạo thông báo"}
        </Button>
      </div>

      {isDemo && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <strong>Demo:</strong> Dữ liệu mẫu. Kết nối Supabase để quản lý thông báo thực.
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <Card className="mb-5 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4" /> Tạo thông báo mới
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Type selector */}
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Loại thông báo</Label>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      form.type === opt.value
                        ? "ring-2 ring-green-500 ring-offset-1 " + opt.color
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <opt.icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Đối tượng</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm((f) => ({ ...f, is_global: true }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.is_global
                      ? "bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-1"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> Tất cả khách hàng
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, is_global: false }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !form.is_global
                      ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Cá nhân (theo đơn)
                </button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Tiêu đề</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="VD: Flash Sale cuối tuần!"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Nội dung</Label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Mô tả chi tiết thông báo..."
                rows={3}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Link (tuỳ chọn)</Label>
              <Input
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="/san-pham hoặc /su-kien/..."
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Huỷ
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
                className="bg-green-600 hover:bg-green-700"
              >
                {sending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                Gửi thông báo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm thông báo..."
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả ({typeCounts.all || 0})
          </button>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                typeFilter === opt.value ? opt.color + " ring-1 ring-offset-1 ring-gray-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <opt.icon className="w-3 h-3" />
              {opt.label} ({typeCounts[opt.value] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Chưa có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const opt = TYPE_OPTIONS.find((t) => t.value === notif.type) || TYPE_OPTIONS[4];
            const Icon = opt.icon;
            return (
              <Card key={notif.id} className="p-0 overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className={`w-9 h-9 rounded-lg ${opt.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notif.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                      <span>{formatDate(notif.created_at)}</span>
                      {notif.is_global ? (
                        <span className="flex items-center gap-0.5 text-green-600">
                          <Users className="w-3 h-3" /> Tất cả
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-blue-600">
                          <User className="w-3 h-3" /> Cá nhân
                        </span>
                      )}
                      {notif.link && (
                        <span className="text-gray-400 truncate max-w-[150px]">{notif.link}</span>
                      )}
                      {notif.is_read && (
                        <span className="flex items-center gap-0.5 text-gray-400">
                          <CheckCircle className="w-3 h-3" /> Đã đọc
                        </span>
                      )}
                    </div>
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
