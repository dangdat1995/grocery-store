"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  KeyRound,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface UserAccount {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "customer" | "admin";
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

const MOCK_USERS: UserAccount[] = [
  { id: "1", email: "admin@taphoaonline.vn", full_name: "Quản trị viên", phone: "0901234567", avatar_url: null, role: "admin", created_at: "2025-01-01T00:00:00Z", order_count: 0, total_spent: 0 },
  { id: "2", email: "nguyenvana@gmail.com", full_name: "Nguyễn Văn A", phone: "0912345678", avatar_url: null, role: "customer", created_at: "2026-01-15T10:00:00Z", order_count: 12, total_spent: 2450000 },
  { id: "3", email: "tranthib@gmail.com", full_name: "Trần Thị B", phone: "0923456789", avatar_url: null, role: "customer", created_at: "2026-02-01T08:30:00Z", order_count: 5, total_spent: 890000 },
  { id: "4", email: "levanc@yahoo.com", full_name: "Lê Văn C", phone: "0934567890", avatar_url: null, role: "customer", created_at: "2026-02-20T14:15:00Z", order_count: 8, total_spent: 1680000 },
  { id: "5", email: "phamthid@gmail.com", full_name: "Phạm Thị D", phone: null, avatar_url: null, role: "customer", created_at: "2026-03-10T09:00:00Z", order_count: 2, total_spent: 350000 },
];

export default function AccountManagementPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (isDemo) {
      setUsers(MOCK_USERS);
      setLoading(false);
      return;
    }

    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profiles) {
        const usersWithStats = await Promise.all(
          profiles.map(async (p) => {
            const { count } = await supabase
              .from("orders")
              .select("id", { count: "exact", head: true })
              .eq("user_id", p.id);
            const { data: totalData } = await supabase
              .from("orders")
              .select("total")
              .eq("user_id", p.id)
              .eq("status", "delivered");
            const total_spent = totalData?.reduce((s, o) => s + (o.total || 0), 0) || 0;
            return { ...p, email: "", order_count: count || 0, total_spent } as UserAccount;
          })
        );
        setUsers(usersWithStats);
      }
    } catch {
      toast.error("Lỗi tải danh sách tài khoản");
    }
    setLoading(false);
  };

  const updateUser = async () => {
    if (!editingUser) return;

    if (isDemo) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? editingUser : u))
      );
      setEditingUser(null);
      toast.success("Demo: Đã cập nhật thông tin");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editingUser.full_name,
        phone: editingUser.phone,
        role: editingUser.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingUser.id);

    if (error) {
      toast.error("Lỗi: " + error.message);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? editingUser : u))
      );
      setEditingUser(null);
      toast.success("Đã cập nhật thông tin tài khoản");
    }
    setSaving(false);
  };

  const sendPasswordReset = async (email: string) => {
    if (isDemo) {
      toast.success(`Demo: Đã gửi email đặt lại mật khẩu tới ${email}`);
      setResetEmail(null);
      return;
    }

    setResetEmail(email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dat-lai-mat-khau`,
    });
    if (error) {
      toast.error("Lỗi: " + error.message);
    } else {
      toast.success(`Đã gửi email đặt lại mật khẩu tới ${email}`);
    }
    setResetEmail(null);
  };

  const toggleRole = async (user: UserAccount) => {
    const newRole = user.role === "admin" ? "customer" : "admin";
    if (!confirm(`Chuyển ${user.full_name || user.email} thành ${newRole === "admin" ? "Quản trị viên" : "Khách hàng"}?`)) return;

    if (isDemo) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      toast.success(`Demo: Đã chuyển quyền → ${newRole === "admin" ? "Quản trị viên" : "Khách hàng"}`);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", user.id);

    if (error) {
      toast.error("Lỗi: " + error.message);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      toast.success(`Đã chuyển quyền → ${newRole === "admin" ? "Quản trị viên" : "Khách hàng"}`);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "customer").length;

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h1 className="text-lg sm:text-xl font-bold">Quản lý tài khoản</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-5">
        <Card className="gap-0 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold">{users.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Tổng TK</p>
          </div>
        </Card>
        <Card className="gap-0 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold">{adminCount}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Admin</p>
          </div>
        </Card>
        <Card className="gap-0 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold">{customerCount}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Khách</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          className="pl-10"
        />
      </div>

      {/* Users list */}
      <Card className="gap-0 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3 font-medium">Tài khoản</th>
                <th className="p-3 font-medium">SĐT</th>
                <th className="p-3 font-medium">Quyền</th>
                <th className="p-3 font-medium">Đơn hàng</th>
                <th className="p-3 font-medium">Tổng chi</th>
                <th className="p-3 font-medium">Ngày tạo</th>
                <th className="p-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <>
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{user.full_name || "Chưa đặt tên"}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      {user.phone ? (
                        <span className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3 text-gray-400" /> {user.phone}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">--</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge
                        className={`text-xs cursor-pointer ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => toggleRole(user)}
                      >
                        {user.role === "admin" ? (
                          <><ShieldCheck className="w-3 h-3 mr-1" /> Admin</>
                        ) : (
                          <><Shield className="w-3 h-3 mr-1" /> Khách</>
                        )}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">{user.order_count || 0}</td>
                    <td className="p-3">
                      {new Intl.NumberFormat("vi-VN").format(user.total_spent || 0)}đ
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                        >
                          {expandedUser === user.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => sendPasswordReset(user.email)}
                          disabled={resetEmail === user.email}
                        >
                          {resetEmail === user.email ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <KeyRound className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedUser === user.id && (
                    <tr key={`${user.id}-edit`} className="border-b bg-gray-50/50">
                      <td colSpan={7} className="p-4">
                        <div className="max-w-lg space-y-3">
                          <p className="font-medium text-sm mb-2">Chỉnh sửa thông tin</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-gray-500">Họ tên</Label>
                              <Input
                                value={editingUser?.id === user.id ? (editingUser.full_name || "") : (user.full_name || "")}
                                onChange={(e) => setEditingUser({ ...(editingUser?.id === user.id ? editingUser : user), full_name: e.target.value })}
                                className="mt-1 h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Số điện thoại</Label>
                              <Input
                                value={editingUser?.id === user.id ? (editingUser.phone || "") : (user.phone || "")}
                                onChange={(e) => setEditingUser({ ...(editingUser?.id === user.id ? editingUser : user), phone: e.target.value })}
                                className="mt-1 h-8 text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-xs"
                              onClick={updateUser}
                              disabled={saving || editingUser?.id !== user.id}
                            >
                              {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                              Lưu thay đổi
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-orange-600 border-orange-200"
                              onClick={() => sendPasswordReset(user.email)}
                              disabled={resetEmail === user.email}
                            >
                              <KeyRound className="w-3 h-3 mr-1" />
                              Gửi email đặt lại mật khẩu
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {search ? "Không tìm thấy tài khoản phù hợp" : "Chưa có tài khoản nào"}
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
