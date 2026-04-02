"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Gift,
  Search,
  ShoppingBag,
  Tag,
  Sparkles,
} from "lucide-react";

type ConditionType = "any_product" | "min_amount" | "specific_product" | "specific_category";

interface GiftForm {
  id?: string;
  name: string;
  description: string;
  condition_type: ConditionType;
  condition_value: string;
  min_quantity: string;
  min_order_amount: string;
  gift_product_id: string;
  gift_description: string;
  gift_quantity: string;
  gift_image_url: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  usage_limit: string;
}

const EMPTY_FORM: GiftForm = {
  name: "",
  description: "",
  condition_type: "any_product",
  condition_value: "",
  min_quantity: "1",
  min_order_amount: "0",
  gift_product_id: "",
  gift_description: "",
  gift_quantity: "1",
  gift_image_url: "",
  is_active: true,
  start_date: "",
  end_date: "",
  usage_limit: "0",
};

const CONDITION_OPTIONS: { value: ConditionType; label: string; desc: string }[] = [
  { value: "any_product", label: "Mua bất kỳ sản phẩm", desc: "Tặng khi mua bất kỳ sản phẩm nào" },
  { value: "min_amount", label: "Đơn tối thiểu", desc: "Tặng khi đơn hàng đạt số tiền tối thiểu" },
  { value: "specific_product", label: "Mua sản phẩm cụ thể", desc: "Tặng khi mua đúng sản phẩm chỉ định" },
  { value: "specific_category", label: "Mua danh mục cụ thể", desc: "Tặng khi mua sản phẩm thuộc danh mục" },
];

const MOCK_GIFTS = [
  {
    id: "g1",
    name: "Tặng nước mắm khi mua gạo",
    description: "Mua bất kỳ bao gạo nào được tặng 1 chai nước mắm mini",
    condition_type: "specific_product" as ConditionType,
    condition_value: "1",
    condition_product_name: "Gạo ST25 5kg",
    min_quantity: 1,
    min_order_amount: 0,
    gift_product_id: "2",
    gift_product_name: "Nước mắm Phú Quốc 250ml",
    gift_description: "Tặng 1 chai nước mắm Phú Quốc 250ml",
    gift_quantity: 1,
    gift_image_url: "",
    is_active: true,
    start_date: null,
    end_date: null,
    usage_limit: 100,
    used_count: 12,
  },
  {
    id: "g2",
    name: "Quà tặng đơn hàng từ 300k",
    description: "Đơn hàng từ 300.000đ được tặng 1 bịch khăn giấy",
    condition_type: "min_amount" as ConditionType,
    condition_value: "300000",
    condition_product_name: null,
    min_quantity: 1,
    min_order_amount: 300000,
    gift_product_id: "",
    gift_product_name: null,
    gift_description: "Tặng 1 bịch khăn giấy cao cấp",
    gift_quantity: 1,
    gift_image_url: "",
    is_active: true,
    start_date: "2026-04-01",
    end_date: "2026-04-30",
    usage_limit: 50,
    used_count: 5,
  },
  {
    id: "g3",
    name: "Mua sản phẩm bất kì - tặng túi nilon",
    description: "Mỗi đơn hàng được tặng 1 túi nilon thân thiện môi trường",
    condition_type: "any_product" as ConditionType,
    condition_value: "",
    condition_product_name: null,
    min_quantity: 1,
    min_order_amount: 0,
    gift_product_id: "",
    gift_product_name: null,
    gift_description: "Tặng 1 túi nilon thân thiện môi trường",
    gift_quantity: 1,
    gift_image_url: "",
    is_active: true,
    start_date: null,
    end_date: null,
    usage_limit: 0,
    used_count: 87,
  },
];

export default function GiftPromotionPage() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GiftForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (isDemo) {
      setGifts(MOCK_GIFTS);
      setProducts(MOCK_PRODUCTS.slice(0, 10));
      setCategories(MOCK_CATEGORIES as any);
      setLoading(false);
      return;
    }
    Promise.all([
      supabase.from("gift_promotions").select("*, gift_product:products(name, price)").order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, price").eq("is_active", true).order("name"),
      supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order"),
    ]).then(([{ data: giftsData }, { data: prodsData }, { data: catsData }]) => {
      setGifts(giftsData || []);
      setProducts(prodsData || []);
      setCategories(catsData || []);
      setLoading(false);
    });
  }, []);

  const editGift = (g: any) => {
    setForm({
      id: g.id,
      name: g.name,
      description: g.description || "",
      condition_type: g.condition_type,
      condition_value: g.condition_value || "",
      min_quantity: String(g.min_quantity || 1),
      min_order_amount: String(g.min_order_amount || 0),
      gift_product_id: g.gift_product_id || "",
      gift_description: g.gift_description,
      gift_quantity: String(g.gift_quantity || 1),
      gift_image_url: g.gift_image_url || "",
      is_active: g.is_active,
      start_date: g.start_date ? g.start_date.slice(0, 10) : "",
      end_date: g.end_date ? g.end_date.slice(0, 10) : "",
      usage_limit: String(g.usage_limit || 0),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.gift_description) {
      toast.error("Vui lòng nhập tên và mô tả quà tặng");
      return;
    }

    if (isDemo) {
      const newGift = {
        id: form.id || `g${Date.now()}`,
        ...form,
        min_quantity: Number(form.min_quantity),
        min_order_amount: Number(form.min_order_amount),
        gift_quantity: Number(form.gift_quantity),
        usage_limit: Number(form.usage_limit),
        used_count: 0,
        condition_product_name: form.condition_type === "specific_product" ? products.find((p: any) => p.id === form.condition_value)?.name : null,
        gift_product_name: form.gift_product_id ? products.find((p: any) => p.id === form.gift_product_id)?.name : null,
      };
      if (form.id) {
        setGifts((prev) => prev.map((g) => (g.id === form.id ? { ...g, ...newGift } : g)));
      } else {
        setGifts((prev) => [newGift, ...prev]);
      }
      toast.success(form.id ? "Demo: Đã cập nhật" : "Demo: Đã tạo quà tặng KM");
      setForm(EMPTY_FORM);
      setShowForm(false);
      return;
    }

    setSaving(true);
    const data = {
      name: form.name,
      description: form.description || null,
      condition_type: form.condition_type,
      condition_value: form.condition_value || null,
      min_quantity: Number(form.min_quantity) || 1,
      min_order_amount: Number(form.min_order_amount) || 0,
      gift_product_id: form.gift_product_id || null,
      gift_description: form.gift_description,
      gift_quantity: Number(form.gift_quantity) || 1,
      gift_image_url: form.gift_image_url || null,
      is_active: form.is_active,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      usage_limit: Number(form.usage_limit) || 0,
    };

    if (form.id) {
      const { error } = await supabase.from("gift_promotions").update({ ...data, updated_at: new Date().toISOString() }).eq("id", form.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("gift_promotions").insert(data);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }

    toast.success(form.id ? "Đã cập nhật" : "Đã tạo quà tặng KM");
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    window.location.reload();
  };

  const deleteGift = async (id: string) => {
    if (!confirm("Xoá chương trình quà tặng này?")) return;
    if (isDemo) { setGifts((prev) => prev.filter((g) => g.id !== id)); toast.success("Demo: Đã xoá"); return; }
    await supabase.from("gift_promotions").delete().eq("id", id);
    setGifts((prev) => prev.filter((g) => g.id !== id));
    toast.success("Đã xoá");
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Quà tặng khuyến mãi</h1>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">Tặng quà khi khách mua sản phẩm</p>
        </div>
        <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setShowForm(!showForm); }} className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
          <Plus className="w-4 h-4 mr-1 sm:mr-2" /> Tạo KM
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="gap-0 p-3 sm:p-5 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <h3 className="font-bold text-sm sm:text-base">{form.id ? "Sửa chương trình" : "Tạo chương trình quà tặng"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Tên chương trình *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="VD: Tặng nước mắm khi mua gạo" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Mô tả</Label>
              <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Chi tiết chương trình..." className="mt-1" />
            </div>
          </div>

          {/* Condition */}
          <div className="border rounded-lg p-4 bg-blue-50/50 space-y-3">
            <p className="font-semibold text-sm text-blue-700 flex items-center gap-1.5">
              <Tag className="w-4 h-4" /> Điều kiện nhận quà
            </p>
            <div>
              <Label className="text-xs text-gray-500">Loại điều kiện</Label>
              <select
                value={form.condition_type}
                onChange={(e) => setForm((p) => ({ ...p, condition_type: e.target.value as ConditionType, condition_value: "" }))}
                className="mt-1 w-full border rounded-md h-9 px-3 text-sm"
              >
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                ))}
              </select>
            </div>

            {form.condition_type === "min_amount" && (
              <div>
                <Label className="text-xs text-gray-500">Đơn tối thiểu (VND)</Label>
                <Input type="number" value={form.min_order_amount} onChange={(e) => setForm((p) => ({ ...p, min_order_amount: e.target.value, condition_value: e.target.value }))} placeholder="300000" className="mt-1" />
              </div>
            )}

            {form.condition_type === "specific_product" && (
              <div>
                <Label className="text-xs text-gray-500">Sản phẩm kích hoạt</Label>
                <select
                  value={form.condition_value}
                  onChange={(e) => setForm((p) => ({ ...p, condition_value: e.target.value }))}
                  className="mt-1 w-full border rounded-md h-9 px-3 text-sm"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>
                  ))}
                </select>
              </div>
            )}

            {form.condition_type === "specific_category" && (
              <div>
                <Label className="text-xs text-gray-500">Danh mục kích hoạt</Label>
                <select
                  value={form.condition_value}
                  onChange={(e) => setForm((p) => ({ ...p, condition_value: e.target.value }))}
                  className="mt-1 w-full border rounded-md h-9 px-3 text-sm"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {(form.condition_type === "specific_product" || form.condition_type === "specific_category") && (
              <div>
                <Label className="text-xs text-gray-500">Số lượng tối thiểu phải mua</Label>
                <Input type="number" value={form.min_quantity} onChange={(e) => setForm((p) => ({ ...p, min_quantity: e.target.value }))} placeholder="1" className="mt-1 w-32" />
              </div>
            )}
          </div>

          {/* Gift */}
          <div className="border rounded-lg p-4 bg-green-50/50 space-y-3">
            <p className="font-semibold text-sm text-green-700 flex items-center gap-1.5">
              <Gift className="w-4 h-4" /> Quà tặng
            </p>
            <div>
              <Label className="text-xs text-gray-500">Mô tả quà tặng *</Label>
              <Input value={form.gift_description} onChange={(e) => setForm((p) => ({ ...p, gift_description: e.target.value }))} placeholder="VD: Tặng 1 chai nước mắm 250ml" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Sản phẩm quà tặng (tuỳ chọn)</Label>
                <select
                  value={form.gift_product_id}
                  onChange={(e) => setForm((p) => ({ ...p, gift_product_id: e.target.value }))}
                  className="mt-1 w-full border rounded-md h-9 px-3 text-sm"
                >
                  <option value="">-- Quà tặng tự do (không liên kết SP) --</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Số lượng tặng</Label>
                <Input type="number" value={form.gift_quantity} onChange={(e) => setForm((p) => ({ ...p, gift_quantity: e.target.value }))} placeholder="1" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">URL hình quà tặng</Label>
              <Input value={form.gift_image_url} onChange={(e) => setForm((p) => ({ ...p, gift_image_url: e.target.value }))} placeholder="https://..." className="mt-1" />
            </div>
          </div>

          {/* Time & limits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Ngày bắt đầu</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Ngày kết thúc</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Giới hạn số lượt (0=không giới hạn)</Label>
              <Input type="number" value={form.usage_limit} onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))} placeholder="0" className="mt-1" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="accent-green-600" />
                Đang hoạt động
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              {form.id ? "Cập nhật" : "Tạo chương trình"}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Huỷ</Button>
          </div>
        </Card>
      )}

      {/* Gift list */}
      <div className="space-y-3">
        {gifts.map((g) => {
          const condOpt = CONDITION_OPTIONS.find((o) => o.value === g.condition_type);
          return (
            <Card key={g.id} className="gap-0 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold">{g.name}</h3>
                    <Badge className={g.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                      {g.is_active ? "Đang chạy" : "Tạm dừng"}
                    </Badge>
                    {g.usage_limit > 0 && (
                      <span className="text-[10px] text-gray-400">{g.used_count}/{g.usage_limit} lượt</span>
                    )}
                  </div>

                  {g.description && <p className="text-xs text-gray-500 mt-1">{g.description}</p>}

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px] font-medium">
                      {condOpt?.label || g.condition_type}
                      {g.condition_type === "min_amount" && `: ${formatPrice(Number(g.condition_value || g.min_order_amount))}`}
                      {g.condition_type === "specific_product" && g.condition_product_name && `: ${g.condition_product_name}`}
                    </span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[11px] font-medium flex items-center gap-1">
                      <Gift className="w-3 h-3" /> {g.gift_description}
                    </span>
                  </div>

                  {(g.start_date || g.end_date) && (
                    <p className="text-[10px] text-gray-400 mt-2">
                      {g.start_date && `Từ ${g.start_date}`} {g.end_date && `→ ${g.end_date}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => editGift(g)} className="text-xs">Sửa</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteGift(g.id)} className="text-xs text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
        {gifts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có chương trình quà tặng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
