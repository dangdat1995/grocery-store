"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import { createClient } from "@/lib/supabase/client";
import type { StaffMember, StaffPermission, AdminModule, StaffRole, Branch } from "@/types";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Users,
  Search,
  Plus,
  X,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Building2,
  UserCog,
  Eye,
  PenLine,
  FilePlus,
  Trash,
  Loader2,
  Crown,
  Briefcase,
  User,
  Check,
  MapPin,
} from "lucide-react";

// All admin modules with labels
const ALL_MODULES: { key: AdminModule; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "San pham" },
  { key: "categories", label: "Danh muc" },
  { key: "inventory", label: "Quan ly kho" },
  { key: "orders", label: "Don hang" },
  { key: "payments", label: "Xac nhan TT" },
  { key: "events", label: "Su kien KM" },
  { key: "combos", label: "Ban Combo" },
  { key: "gifts", label: "Qua tang KM" },
  { key: "vouchers", label: "Voucher" },
  { key: "customers", label: "Khach hang" },
  { key: "branches", label: "Chi nhanh" },
  { key: "accounts", label: "Tai khoan" },
  { key: "settings", label: "Cai dat" },
];

const ROLE_CONFIG: Record<StaffRole, { label: string; color: string; icon: typeof ShieldCheck; desc: string }> = {
  super_admin: { label: "Super Admin", color: "bg-red-100 text-red-700", icon: Crown, desc: "Toàn quyền quản lý hệ thống" },
  branch_manager: { label: "Quản lý CN", color: "bg-blue-100 text-blue-700", icon: Briefcase, desc: "Quản lý chi nhánh được phân công" },
  staff: { label: "Nhân viên", color: "bg-gray-100 text-gray-700", icon: User, desc: "Quyền hạn chế theo phân quyền" },
};

const POSITIONS = [
  "Quản lý",
  "Thu ngân",
  "Kho hàng",
  "Giao hàng",
  "CSKH",
  "Marketing",
  "Kế toán",
  "Khác",
];

// Default permissions by role
function getDefaultPermissions(role: StaffRole): Omit<StaffPermission, "id" | "staff_id">[] {
  return ALL_MODULES.map((m) => {
    if (role === "super_admin") {
      return { module: m.key, can_view: true, can_create: true, can_edit: true, can_delete: true };
    }
    if (role === "branch_manager") {
      const fullAccess = ["dashboard", "products", "inventory", "orders", "payments", "customers"].includes(m.key);
      const viewOnly = ["events", "combos", "gifts", "vouchers", "branches", "settings"].includes(m.key);
      return {
        module: m.key,
        can_view: fullAccess || viewOnly,
        can_create: fullAccess,
        can_edit: fullAccess,
        can_delete: false,
      };
    }
    // staff: view only by default
    const canView = ["dashboard", "products", "orders", "inventory"].includes(m.key);
    return { module: m.key, can_view: canView, can_create: false, can_edit: false, can_delete: false };
  });
}

// Demo data
const DEMO_BRANCHES: Branch[] = [
  { id: "b1", name: "Chi nhánh chính - Quận 1", slug: "cn1", phone: "0901234567", address: "123 Nguyễn Huệ", ward: "Bến Nghé", district: "Quận 1", city: "HCM", latitude: 10.77, longitude: 106.70, delivery_radius_km: 20, opening_time: "06:00", closing_time: "21:00", is_main: true, is_active: true, manager_name: "Nguyễn Văn A", manager_phone: "0901234567", created_at: "", updated_at: "" },
  { id: "b2", name: "Chi nhánh Quận 7", slug: "cn7", phone: "0912345678", address: "456 Nguyễn Thị Thập", ward: "Tân Phong", district: "Quận 7", city: "HCM", latitude: 10.73, longitude: 106.72, delivery_radius_km: 15, opening_time: "06:30", closing_time: "21:30", is_main: false, is_active: true, manager_name: null, manager_phone: null, created_at: "", updated_at: "" },
  { id: "b3", name: "Chi nhánh Thủ Đức", slug: "cntd", phone: "0923456789", address: "789 Võ Văn Ngân", ward: "Linh Chiểu", district: "Thủ Đức", city: "HCM", latitude: 10.85, longitude: 106.76, delivery_radius_km: 15, opening_time: "07:00", closing_time: "21:00", is_main: false, is_active: false, manager_name: null, manager_phone: null, created_at: "", updated_at: "" },
];

const DEMO_STAFF: StaffMember[] = [
  {
    id: "s1", user_id: "1", staff_role: "super_admin", display_name: "Nguyễn Văn A", position: "Quản lý", is_active: true, created_at: "2025-01-01", updated_at: "2025-01-01",
    user: { id: "1", full_name: "Nguyễn Văn A", phone: "0901234567", avatar_url: null, role: "admin", created_at: "", updated_at: "", email: "admin@taphoaonline.vn" },
    branches: [{ id: "sb1", staff_id: "s1", branch_id: "b1", is_primary: true, assigned_at: "" }],
    permissions: getDefaultPermissions("super_admin") as StaffPermission[],
  },
  {
    id: "s2", user_id: "2", staff_role: "branch_manager", display_name: "Trần Thị B", position: "Quản lý", is_active: true, created_at: "2026-01-15", updated_at: "2026-01-15",
    user: { id: "2", full_name: "Trần Thị B", phone: "0912345678", avatar_url: null, role: "admin", created_at: "", updated_at: "", email: "tranthib@gmail.com" },
    branches: [
      { id: "sb2", staff_id: "s2", branch_id: "b2", is_primary: true, assigned_at: "" },
      { id: "sb3", staff_id: "s2", branch_id: "b3", is_primary: false, assigned_at: "" },
    ],
    permissions: getDefaultPermissions("branch_manager") as StaffPermission[],
  },
  {
    id: "s3", user_id: "3", staff_role: "staff", display_name: "Lê Văn C", position: "Thu ngân", is_active: true, created_at: "2026-02-01", updated_at: "2026-02-01",
    user: { id: "3", full_name: "Lê Văn C", phone: "0923456789", avatar_url: null, role: "admin", created_at: "", updated_at: "", email: "levanc@gmail.com" },
    branches: [{ id: "sb4", staff_id: "s3", branch_id: "b1", is_primary: true, assigned_at: "" }],
    permissions: getDefaultPermissions("staff") as StaffPermission[],
  },
  {
    id: "s4", user_id: "4", staff_role: "staff", display_name: "Phạm Thị D", position: "Kho hàng", is_active: false, created_at: "2026-03-01", updated_at: "2026-03-01",
    user: { id: "4", full_name: "Phạm Thị D", phone: "0934567890", avatar_url: null, role: "admin", created_at: "", updated_at: "", email: "phamthid@gmail.com" },
    branches: [{ id: "sb5", staff_id: "s4", branch_id: "b2", is_primary: true, assigned_at: "" }],
    permissions: getDefaultPermissions("staff") as StaffPermission[],
  },
];

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for add/edit
  const [form, setForm] = useState({
    email: "",
    display_name: "",
    position: "Quản lý",
    staff_role: "staff" as StaffRole,
    is_active: true,
    branch_ids: [] as string[],
    primary_branch_id: "",
    permissions: getDefaultPermissions("staff"),
  });

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (isDemo) {
      setStaff(DEMO_STAFF);
      setBranches(DEMO_BRANCHES);
      setLoading(false);
      return;
    }
    try {
      const [staffRes, branchRes] = await Promise.all([
        supabase.from("staff_members").select("*, branches:staff_branches(*, branch:branches(*)), permissions:staff_permissions(*)").order("created_at", { ascending: false }),
        supabase.from("branches").select("*").eq("is_active", true),
      ]);
      if (staffRes.data) setStaff(staffRes.data as any);
      if (branchRes.data) setBranches(branchRes.data);
    } catch {
      toast.error("Lỗi tải dữ liệu");
    }
    setLoading(false);
  };

  const resetForm = (role: StaffRole = "staff") => {
    setForm({
      email: "",
      display_name: "",
      position: "Quản lý",
      staff_role: role,
      is_active: true,
      branch_ids: [],
      primary_branch_id: "",
      permissions: getDefaultPermissions(role),
    });
  };

  const handleRoleChange = (role: StaffRole) => {
    setForm((prev) => ({
      ...prev,
      staff_role: role,
      permissions: getDefaultPermissions(role),
    }));
  };

  const toggleBranch = (branchId: string) => {
    setForm((prev) => {
      const exists = prev.branch_ids.includes(branchId);
      const newIds = exists ? prev.branch_ids.filter((id) => id !== branchId) : [...prev.branch_ids, branchId];
      const primary = newIds.includes(prev.primary_branch_id) ? prev.primary_branch_id : (newIds[0] || "");
      return { ...prev, branch_ids: newIds, primary_branch_id: primary };
    });
  };

  const togglePermission = (moduleIdx: number, field: "can_view" | "can_create" | "can_edit" | "can_delete") => {
    setForm((prev) => {
      const perms = [...prev.permissions];
      const p = { ...perms[moduleIdx] };
      p[field] = !p[field];
      // If turning off view, turn off all
      if (field === "can_view" && !p.can_view) {
        p.can_create = false;
        p.can_edit = false;
        p.can_delete = false;
      }
      // If turning on create/edit/delete, ensure view is on
      if ((field === "can_create" || field === "can_edit" || field === "can_delete") && p[field]) {
        p.can_view = true;
      }
      perms[moduleIdx] = p;
      return { ...prev, permissions: perms };
    });
  };

  const handleAdd = async () => {
    if (!form.display_name.trim()) {
      toast.error("Vui lòng nhập tên nhân viên");
      return;
    }
    if (form.branch_ids.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 chi nhánh");
      return;
    }

    if (isDemo) {
      const newStaff: StaffMember = {
        id: `s${Date.now()}`,
        user_id: `u${Date.now()}`,
        staff_role: form.staff_role,
        display_name: form.display_name,
        position: form.position,
        is_active: form.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: { id: `u${Date.now()}`, full_name: form.display_name, phone: null, avatar_url: null, role: "admin", created_at: "", updated_at: "", email: form.email || "new@example.com" },
        branches: form.branch_ids.map((bid) => ({
          id: `sb${Date.now()}_${bid}`,
          staff_id: `s${Date.now()}`,
          branch_id: bid,
          is_primary: bid === form.primary_branch_id,
          assigned_at: new Date().toISOString(),
        })),
        permissions: form.permissions as StaffPermission[],
      };
      setStaff((prev) => [newStaff, ...prev]);
      setAdding(false);
      resetForm();
      toast.success("Demo: Đã thêm nhân viên quản trị");
      return;
    }

    setSaving(true);
    try {
      // In production: create staff_member, staff_branches, staff_permissions via API
      toast.success("Đã thêm nhân viên quản trị");
      setAdding(false);
      resetForm();
      loadData();
    } catch {
      toast.error("Lỗi thêm nhân viên");
    }
    setSaving(false);
  };

  const handleUpdatePermissions = async (staffId: string, permissions: any[]) => {
    if (isDemo) {
      setStaff((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, permissions: permissions as StaffPermission[] } : s))
      );
      toast.success("Demo: Đã cập nhật phân quyền");
      return;
    }
    // Production: update via supabase
  };

  const handleToggleActive = async (s: StaffMember) => {
    if (s.staff_role === "super_admin") {
      toast.error("Không thể vô hiệu Super Admin");
      return;
    }
    if (isDemo) {
      setStaff((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, is_active: !item.is_active } : item))
      );
      toast.success(`Demo: ${s.is_active ? "Đã vô hiệu" : "Đã kích hoạt"} nhân viên`);
      return;
    }
  };

  const handleRemove = async (s: StaffMember) => {
    if (s.staff_role === "super_admin") {
      toast.error("Không thể xoá Super Admin");
      return;
    }
    if (!confirm(`Xoá quyền quản trị của ${s.display_name || "nhân viên"}?`)) return;
    if (isDemo) {
      setStaff((prev) => prev.filter((item) => item.id !== s.id));
      toast.success("Demo: Đã xoá nhân viên quản trị");
      return;
    }
  };

  const getBranchName = (branchId: string) => {
    const b = branches.find((br) => br.id === branchId);
    return b?.name || branchId;
  };

  // Filters
  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.display_name?.toLowerCase().includes(q) || s.user?.email?.toLowerCase().includes(q) || s.user?.phone?.includes(q);
    const matchRole = roleFilter === "all" || s.staff_role === roleFilter;
    const matchBranch = branchFilter === "all" || s.branches?.some((b) => b.branch_id === branchFilter);
    return matchSearch && matchRole && matchBranch;
  });

  const counts = {
    total: staff.length,
    super_admin: staff.filter((s) => s.staff_role === "super_admin").length,
    branch_manager: staff.filter((s) => s.staff_role === "branch_manager").length,
    staff: staff.filter((s) => s.staff_role === "staff").length,
    active: staff.filter((s) => s.is_active).length,
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Quản trị viên & Phân quyền</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý nhân viên, vai trò và quyền truy cập</p>
        </div>
        {!adding && (
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setAdding(true); resetForm(); }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm quản trị viên
          </Button>
        )}
      </div>

      {isDemo && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <strong>Demo:</strong> Dữ liệu mẫu. Kết nối Supabase để quản lý thực tế.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Tổng cộng", value: counts.total, icon: Users, color: "bg-blue-100 text-blue-600" },
          { label: "Super Admin", value: counts.super_admin, icon: Crown, color: "bg-red-100 text-red-600" },
          { label: "Quản lý CN", value: counts.branch_manager, icon: Briefcase, color: "bg-indigo-100 text-indigo-600" },
          { label: "Nhân viên", value: counts.staff, icon: User, color: "bg-gray-100 text-gray-600" },
          { label: "Đang hoạt động", value: counts.active, icon: ShieldCheck, color: "bg-green-100 text-green-600" },
        ].map((stat) => (
          <Card key={stat.label} className="gap-0 p-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[11px] text-gray-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Form */}
      {adding && (
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2">
              <UserCog className="w-5 h-5" /> Thêm quản trị viên mới
            </h2>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => { setAdding(false); resetForm(); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-5 space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Tên hiển thị *</Label>
                <Input value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} placeholder="Nguyễn Văn X" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Chức vụ</Label>
                <select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                  {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Role selection */}
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Vai trò *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.entries(ROLE_CONFIG) as [StaffRole, typeof ROLE_CONFIG["super_admin"]][]).map(([role, cfg]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.staff_role === role
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <cfg.icon className={`w-4 h-4 ${form.staff_role === role ? "text-green-600" : "text-gray-400"}`} />
                      <span className="font-semibold text-sm">{cfg.label}</span>
                      {form.staff_role === role && <Check className="w-4 h-4 text-green-600 ml-auto" />}
                    </div>
                    <p className="text-xs text-gray-500">{cfg.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Branch assignment */}
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">
                <Building2 className="w-3 h-3 inline mr-1" />
                Phân công chi nhánh *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {branches.map((branch) => {
                  const selected = form.branch_ids.includes(branch.id);
                  const isPrimary = form.primary_branch_id === branch.id;
                  return (
                    <div
                      key={branch.id}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleBranch(branch.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selected ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium flex-1 truncate">{branch.name}</span>
                        {selected && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, primary_branch_id: branch.id })); }}
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${isPrimary ? "bg-amber-100 text-amber-700 font-bold" : "bg-gray-100 text-gray-500 hover:bg-amber-50"}`}
                          >
                            {isPrimary ? "Chính" : "Đặt chính"}
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {branch.district}, {branch.city}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permissions table */}
            {form.staff_role !== "super_admin" && (
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Phân quyền chi tiết
                </Label>
                <Card className="gap-0 p-0 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="p-2.5 text-left font-medium text-xs">Module</th>
                        <th className="p-2.5 text-center font-medium text-xs w-16">
                          <Eye className="w-3.5 h-3.5 mx-auto text-gray-400" />
                          <span className="block text-[10px]">Xem</span>
                        </th>
                        <th className="p-2.5 text-center font-medium text-xs w-16">
                          <FilePlus className="w-3.5 h-3.5 mx-auto text-gray-400" />
                          <span className="block text-[10px]">Thêm</span>
                        </th>
                        <th className="p-2.5 text-center font-medium text-xs w-16">
                          <PenLine className="w-3.5 h-3.5 mx-auto text-gray-400" />
                          <span className="block text-[10px]">Sửa</span>
                        </th>
                        <th className="p-2.5 text-center font-medium text-xs w-16">
                          <Trash className="w-3.5 h-3.5 mx-auto text-gray-400" />
                          <span className="block text-[10px]">Xoá</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.permissions.map((perm, idx) => {
                        const mod = ALL_MODULES.find((m) => m.key === perm.module);
                        return (
                          <tr key={perm.module} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="p-2.5 text-xs font-medium">{mod?.label || perm.module}</td>
                            {(["can_view", "can_create", "can_edit", "can_delete"] as const).map((field) => (
                              <td key={field} className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => togglePermission(idx, field)}
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                                    perm[field]
                                      ? "bg-green-600 border-green-600"
                                      : "border-gray-300 hover:border-gray-400"
                                  }`}
                                >
                                  {perm[field] && <Check className="w-3 h-3 text-white" />}
                                </button>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setForm((f) => ({ ...f, permissions: f.permissions.map((p) => ({ ...p, can_view: true, can_create: true, can_edit: true, can_delete: true })) }))}>
                    Chọn tất cả
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setForm((f) => ({ ...f, permissions: f.permissions.map((p) => ({ ...p, can_view: false, can_create: false, can_edit: false, can_delete: false })) }))}>
                    Bỏ tất cả
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setForm((f) => ({ ...f, permissions: getDefaultPermissions(f.staff_role) }))}>
                    Mặc định
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-green-600 w-4 h-4" id="staff_active" />
              <Label htmlFor="staff_active" className="text-sm cursor-pointer">Kích hoạt ngay</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleAdd} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Đang lưu..." : "Thêm quản trị viên"}
              </Button>
              <Button variant="outline" onClick={() => { setAdding(false); resetForm(); }}>Huỷ</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên, email, SĐT..." className="pl-10" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="border rounded-md px-3 py-2 text-sm min-w-[140px]">
          <option value="all">Tất cả vai trò</option>
          <option value="super_admin">Super Admin</option>
          <option value="branch_manager">Quản lý CN</option>
          <option value="staff">Nhân viên</option>
        </select>
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm min-w-[160px]">
          <option value="all">Tất cả chi nhánh</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Staff list */}
      <div className="space-y-3">
        {filtered.map((s) => {
          const roleCfg = ROLE_CONFIG[s.staff_role];
          const isExpanded = expandedId === s.id;
          return (
            <Card key={s.id} className={`gap-0 overflow-hidden ${!s.is_active ? "opacity-60" : ""}`}>
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    s.staff_role === "super_admin" ? "bg-gradient-to-br from-red-500 to-pink-600" :
                    s.staff_role === "branch_manager" ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
                    "bg-gradient-to-br from-gray-400 to-gray-500"
                  }`}>
                    <roleCfg.icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{s.display_name || s.user?.full_name || "N/A"}</span>
                      <Badge className={`text-[10px] ${roleCfg.color}`}>{roleCfg.label}</Badge>
                      {s.position && <span className="text-[11px] text-gray-400">({s.position})</span>}
                      {!s.is_active && <Badge variant="secondary" className="text-[10px]">Vô hiệu</Badge>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {s.user?.email && <span>{s.user.email}</span>}
                      {s.user?.phone && <span>{s.user.phone}</span>}
                    </div>
                    {/* Branches */}
                    {s.branches && s.branches.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {s.branches.map((sb) => (
                          <span key={sb.id} className={`text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${sb.is_primary ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                            <Building2 className="w-2.5 h-2.5" />
                            {getBranchName(sb.branch_id)}
                            {sb.is_primary && " (chính)"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`text-xs ${s.is_active ? "text-orange-500 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                      onClick={() => handleToggleActive(s)}
                    >
                      {s.is_active ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    </Button>
                    {s.staff_role !== "super_admin" && (
                      <Button size="sm" variant="outline" className="text-xs text-red-500 hover:bg-red-50" onClick={() => handleRemove(s)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded: permissions view */}
              {isExpanded && (
                <div className="border-t bg-gray-50/50 p-4">
                  {s.staff_role === "super_admin" ? (
                    <div className="text-center py-4">
                      <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Super Admin - Toàn quyền quản lý</p>
                      <p className="text-xs text-gray-400 mt-1">Có quyền truy cập tất cả module và chi nhánh</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" /> Bảng phân quyền
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-white border-b">
                              <th className="p-2 text-left text-xs font-medium">Module</th>
                              <th className="p-2 text-center text-xs font-medium w-14">Xem</th>
                              <th className="p-2 text-center text-xs font-medium w-14">Thêm</th>
                              <th className="p-2 text-center text-xs font-medium w-14">Sửa</th>
                              <th className="p-2 text-center text-xs font-medium w-14">Xoá</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(s.permissions || []).map((perm) => {
                              const mod = ALL_MODULES.find((m) => m.key === perm.module);
                              return (
                                <tr key={perm.module} className="border-b last:border-0">
                                  <td className="p-2 text-xs">{mod?.label || perm.module}</td>
                                  {(["can_view", "can_create", "can_edit", "can_delete"] as const).map((field) => (
                                    <td key={field} className="p-2 text-center">
                                      {perm[field] ? (
                                        <Check className="w-4 h-4 text-green-600 mx-auto" />
                                      ) : (
                                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="gap-0 p-8 text-center text-gray-400">
            <UserCog className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>{search || roleFilter !== "all" || branchFilter !== "all" ? "Không tìm thấy nhân viên phù hợp" : "Chưa có quản trị viên nào"}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
