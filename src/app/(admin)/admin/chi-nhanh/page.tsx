"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Phone,
  Clock,
  Navigation,
  Building2,
  Star,
  User,
  Package,
  Crosshair,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import type { Branch } from "@/types";

const DEMO_BRANCHES: Branch[] = [
  {
    id: "b1", name: "Chi nhánh chính - Quận 1", slug: "chi-nhanh-chinh",
    phone: "0901234567", address: "123 Nguyễn Huệ", ward: "Phường Bến Nghé",
    district: "Quận 1", city: "Hồ Chí Minh", latitude: 10.7769, longitude: 106.7009,
    delivery_radius_km: 20, opening_time: "06:00", closing_time: "21:00",
    is_main: true, is_active: true, manager_name: "Nguyễn Văn A", manager_phone: "0901234567",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "b2", name: "Chi nhánh Quận 7", slug: "chi-nhanh-quan-7",
    phone: "0912345678", address: "456 Nguyễn Thị Thập", ward: "Phường Tân Phong",
    district: "Quận 7", city: "Hồ Chí Minh", latitude: 10.7340, longitude: 106.7218,
    delivery_radius_km: 15, opening_time: "06:30", closing_time: "21:30",
    is_main: false, is_active: true, manager_name: "Trần Thị B", manager_phone: "0912345678",
    created_at: "2026-02-01", updated_at: "2026-02-01",
  },
  {
    id: "b3", name: "Chi nhánh Thủ Đức", slug: "chi-nhanh-thu-duc",
    phone: "0923456789", address: "789 Võ Văn Ngân", ward: "Phường Linh Chiểu",
    district: "TP. Thủ Đức", city: "Hồ Chí Minh", latitude: 10.8512, longitude: 106.7592,
    delivery_radius_km: 15, opening_time: "07:00", closing_time: "21:00",
    is_main: false, is_active: false, manager_name: "Lê Văn C", manager_phone: "0923456789",
    created_at: "2026-03-01", updated_at: "2026-03-01",
  },
];

const emptyBranch = {
  name: "", slug: "", phone: "", address: "", ward: "", district: "",
  city: "Hồ Chí Minh", latitude: 10.7769, longitude: 106.7009,
  delivery_radius_km: 15, opening_time: "06:00", closing_time: "21:00",
  is_main: false, is_active: true, manager_name: "", manager_phone: "",
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<any>(emptyBranch);
  const [loading, setLoading] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);

  const fetchBranches = async () => {
    if (isDemo) {
      setBranches(DEMO_BRANCHES);
      return;
    }
    try {
      const res = await fetch("/api/branches");
      const data = await res.json();
      setBranches(data.branches || []);
    } catch {
      toast.error("Lỗi tải dữ liệu");
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const updateForm = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (isDemo) {
      toast.info("Chế độ Demo: Kết nối Supabase để lưu");
      setAdding(false);
      setEditing(null);
      return;
    }

    if (!form.name || !form.address) {
      toast.error("Vui lòng nhập tên và địa chỉ chi nhánh");
      return;
    }

    setLoading(true);
    try {
      if (editing) {
        const res = await fetch("/api/branches", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing, ...form }),
        });
        if (!res.ok) throw new Error();
        toast.success("Đã cập nhật chi nhánh");
      } else {
        const res = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, slug: generateSlug(form.name) }),
        });
        if (!res.ok) throw new Error();
        toast.success("Đã thêm chi nhánh");
      }
      setEditing(null);
      setAdding(false);
      setForm(emptyBranch);
      fetchBranches();
    } catch {
      toast.error("Lỗi lưu chi nhánh");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) { toast.info("Chế độ Demo"); return; }
    if (!confirm("Xoá chi nhánh này?")) return;

    try {
      const res = await fetch("/api/branches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Đã xoá chi nhánh");
      fetchBranches();
    } catch (err: any) {
      toast.error(err.message || "Lỗi xoá");
    }
  };

  const startEdit = (branch: Branch) => {
    setEditing(branch.id);
    setAdding(false);
    setForm({
      name: branch.name,
      phone: branch.phone || "",
      address: branch.address,
      ward: branch.ward || "",
      district: branch.district || "",
      city: branch.city,
      latitude: branch.latitude,
      longitude: branch.longitude,
      delivery_radius_km: branch.delivery_radius_km,
      opening_time: branch.opening_time,
      closing_time: branch.closing_time,
      is_active: branch.is_active,
      manager_name: branch.manager_name || "",
      manager_phone: branch.manager_phone || "",
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setAdding(false);
    setForm(emptyBranch);
  };

  const locateByGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return;
    }
    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateForm("latitude", pos.coords.latitude);
        updateForm("longitude", pos.coords.longitude);
        setLocatingGPS(false);
        toast.success(`Đã lấy toạ độ: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
      },
      () => {
        setLocatingGPS(false);
        toast.error("Không lấy được vị trí. Cho phép truy cập vị trí.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openGoogleMapsAndGetCoords = () => {
    const lat = form.latitude || 10.7769;
    const lng = form.longitude || 106.7009;
    window.open(`https://www.google.com/maps?q=${lat},${lng}&z=17`, "_blank");
    toast.info("Tìm vị trí trên Google Maps → nhấp chuột phải → sao chép toạ độ → dán vào ô bên dưới");
  };

  const pasteCoords = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const match = text.match(/([\d.-]+)\s*,\s*([\d.-]+)/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          updateForm("latitude", lat);
          updateForm("longitude", lng);
          toast.success(`Đã dán toạ độ: ${lat}, ${lng}`);
        } else {
          toast.error("Toạ độ không hợp lệ");
        }
      } else {
        toast.error("Không tìm thấy toạ độ trong clipboard. Định dạng: lat, lng");
      }
    } catch {
      toast.error("Không truy cập được clipboard");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Chi nhánh</h1>
          <p className="text-sm text-gray-500 mt-1">{branches.length} chi nhánh</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/chi-nhanh/san-pham">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <Package className="w-4 h-4 mr-2" /> Sản phẩm theo CN
            </Button>
          </Link>
          {!adding && !editing && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => { setAdding(true); setForm(emptyBranch); }}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm chi nhánh
            </Button>
          )}
        </div>
      </div>

      {isDemo && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <strong>Demo:</strong> Dữ liệu mẫu 3 chi nhánh. Kết nối Supabase để quản lý.
        </div>
      )}

      {/* Add/Edit Form */}
      {(adding || editing) && (
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {editing ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
            </h2>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={cancelEdit}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">Tên chi nhánh *</Label>
                <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Chi nhánh Quận 3" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Số điện thoại</Label>
                <Input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="0901234567" className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs">Địa chỉ *</Label>
              <Input value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="123 Trần Quốc Thảo" className="mt-1" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Phường/Xã</Label>
                <Input value={form.ward} onChange={(e) => updateForm("ward", e.target.value)} placeholder="Phường 7" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Quận/Huyện</Label>
                <Input value={form.district} onChange={(e) => updateForm("district", e.target.value)} placeholder="Quận 3" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Thành phố</Label>
                <Input value={form.city} onChange={(e) => updateForm("city", e.target.value)} placeholder="Hồ Chí Minh" className="mt-1" />
              </div>
            </div>

            {/* Location picker */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" /> Toạ độ chi nhánh
                </Label>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 rounded-lg"
                    onClick={locateByGPS}
                    disabled={locatingGPS}
                  >
                    {locatingGPS ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Crosshair className="w-3.5 h-3.5 mr-1" />}
                    {locatingGPS ? "Đang định vị..." : "Vị trí hiện tại"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 rounded-lg"
                    onClick={openGoogleMapsAndGetCoords}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> Mở Google Maps
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="text-xs h-8 rounded-lg bg-blue-600 hover:bg-blue-700"
                    onClick={pasteCoords}
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1" /> Dán toạ độ
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Vĩ độ (Lat)</Label>
                  <Input type="number" step="any" value={form.latitude} onChange={(e) => updateForm("latitude", parseFloat(e.target.value) || 0)} className="mt-1 bg-white" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Kinh độ (Lng)</Label>
                  <Input type="number" step="any" value={form.longitude} onChange={(e) => updateForm("longitude", parseFloat(e.target.value) || 0)} className="mt-1 bg-white" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Bán kính giao hàng (km)</Label>
                  <Input type="number" value={form.delivery_radius_km} onChange={(e) => updateForm("delivery_radius_km", parseInt(e.target.value) || 15)} className="mt-1 bg-white" />
                </div>
              </div>

              {form.latitude && form.longitude && (
                <div className="flex items-center gap-2">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.longitude - 0.005},${form.latitude - 0.003},${form.longitude + 0.005},${form.latitude + 0.003}&layer=mapnik&marker=${form.latitude},${form.longitude}`}
                    className="w-full h-32 rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Giờ mở cửa</Label>
                <Input type="time" value={form.opening_time} onChange={(e) => updateForm("opening_time", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Giờ đóng cửa</Label>
                <Input type="time" value={form.closing_time} onChange={(e) => updateForm("closing_time", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Quản lý</Label>
                <Input value={form.manager_name} onChange={(e) => updateForm("manager_name", e.target.value)} placeholder="Tên quản lý" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">SĐT quản lý</Label>
                <Input value={form.manager_phone} onChange={(e) => updateForm("manager_phone", e.target.value)} placeholder="0901234567" className="mt-1" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateForm("is_active", e.target.checked)}
                className="accent-green-600 w-4 h-4"
                id="is_active"
              />
              <Label htmlFor="is_active" className="text-sm cursor-pointer">Đang hoạt động</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm chi nhánh"}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>Huỷ</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Branch List */}
      <div className="space-y-4">
        {branches.map((branch) => (
          <Card
            key={branch.id}
            className={`overflow-hidden ${!branch.is_active ? "opacity-60" : ""} ${
              editing === branch.id ? "ring-2 ring-green-500" : ""
            }`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    branch.is_main
                      ? "bg-gradient-to-br from-amber-400 to-orange-500"
                      : branch.is_active
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gray-300"
                  }`}>
                    {branch.is_main ? (
                      <Star className="w-6 h-6 text-white" />
                    ) : (
                      <Building2 className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base">{branch.name}</h3>
                      {branch.is_main && (
                        <Badge className="bg-amber-100 text-amber-700 text-[10px]">Chính</Badge>
                      )}
                      <Badge variant={branch.is_active ? "default" : "secondary"} className="text-[10px]">
                        {branch.is_active ? "Hoạt động" : "Tạm đóng"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-500">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{branch.address}, {branch.district}, {branch.city}</span>
                      </p>
                      {branch.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {branch.phone}
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {branch.opening_time} - {branch.closing_time}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-gray-400" />
                        Bán kính {branch.delivery_radius_km}km
                      </p>
                      {branch.manager_name && (
                        <p className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {branch.manager_name} {branch.manager_phone ? `(${branch.manager_phone})` : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-gray-400">
                        Toạ độ: {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-3 h-3" /> Xem trên Maps
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0">
                  <Link href={`/admin/chi-nhanh/san-pham?branch=${branch.id}`}>
                    <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Package className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline text-xs">Sản phẩm</span>
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => startEdit(branch)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  {!branch.is_main && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(branch.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {branches.length === 0 && (
          <Card className="p-8 text-center text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Chưa có chi nhánh nào</p>
          </Card>
        )}
      </div>
    </div>
  );
}
