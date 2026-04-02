"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  PackagePlus,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Gift,
} from "lucide-react";

interface ComboForm {
  id?: string;
  name: string;
  description: string;
  image_url: string;
  combo_price: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  items: { product_id: string; product_name: string; quantity: number; price: number }[];
}

const EMPTY_FORM: ComboForm = {
  name: "",
  description: "",
  image_url: "",
  combo_price: "",
  is_active: true,
  start_date: "",
  end_date: "",
  items: [],
};

const MOCK_COMBOS = [
  {
    id: "c1",
    name: "Combo Bếp Nhà - Bữa cơm gia đình",
    description: "Gạo + Nước mắm + Rau muống + Thịt heo - đủ cho 1 bữa cơm",
    image_url: "",
    combo_price: 120000,
    original_price: 155000,
    is_active: true,
    start_date: null,
    end_date: null,
    items: [
      { product_id: "1", product_name: "Gạo ST25 5kg", quantity: 1, price: 65000 },
      { product_id: "2", product_name: "Nước mắm Phú Quốc 500ml", quantity: 1, price: 45000 },
      { product_id: "3", product_name: "Rau muống tươi", quantity: 1, price: 15000 },
      { product_id: "4", product_name: "Thịt ba chỉ heo (500g)", quantity: 1, price: 30000 },
    ],
  },
  {
    id: "c2",
    name: "Combo Đồ uống mùa hè",
    description: "Sữa tươi + Nước cam + Trà xanh",
    image_url: "",
    combo_price: 85000,
    original_price: 110000,
    is_active: true,
    start_date: "2026-04-01",
    end_date: "2026-06-30",
    items: [
      { product_id: "5", product_name: "Sữa tươi TH 1L", quantity: 2, price: 32000 },
      { product_id: "6", product_name: "Nước cam ép 1L", quantity: 1, price: 28000 },
      { product_id: "7", product_name: "Trà xanh đóng chai", quantity: 2, price: 9000 },
    ],
  },
];

export default function ComboManagementPage() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ComboForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isDemo) {
      setCombos(MOCK_COMBOS);
      setProducts(MOCK_PRODUCTS.slice(0, 10));
      setLoading(false);
      return;
    }
    Promise.all([
      supabase.from("combos").select("*, items:combo_items(*, product:products(name, price))").order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, price, unit").eq("is_active", true).order("name"),
    ]).then(([{ data: combosData }, { data: prodsData }]) => {
      setCombos((combosData || []).map((c: any) => ({
        ...c,
        items: (c.items || []).map((it: any) => ({
          product_id: it.product_id,
          product_name: it.product?.name || "",
          quantity: it.quantity,
          price: it.product?.price || 0,
        })),
      })));
      setProducts(prodsData || []);
      setLoading(false);
    });
  }, []);

  const originalPrice = form.items.reduce((s, it) => s + it.price * it.quantity, 0);
  const savings = originalPrice - Number(form.combo_price || 0);

  const addProduct = (prod: any) => {
    if (form.items.find((it) => it.product_id === prod.id)) {
      toast.error("Sản phẩm đã có trong combo");
      return;
    }
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: prod.id, product_name: prod.name, quantity: 1, price: prod.price }],
    }));
    setShowProductPicker(false);
    setProductSearch("");
  };

  const removeProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.product_id !== productId),
    }));
  };

  const updateItemQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.product_id === productId ? { ...it, quantity: qty } : it)),
    }));
  };

  const editCombo = (combo: any) => {
    setForm({
      id: combo.id,
      name: combo.name,
      description: combo.description || "",
      image_url: combo.image_url || "",
      combo_price: String(combo.combo_price),
      is_active: combo.is_active,
      start_date: combo.start_date ? combo.start_date.slice(0, 10) : "",
      end_date: combo.end_date ? combo.end_date.slice(0, 10) : "",
      items: combo.items || [],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.combo_price || form.items.length < 2) {
      toast.error("Vui lòng nhập tên, giá combo và ít nhất 2 sản phẩm");
      return;
    }

    if (isDemo) {
      const newCombo = {
        id: form.id || `c${Date.now()}`,
        name: form.name,
        description: form.description,
        image_url: form.image_url,
        combo_price: Number(form.combo_price),
        original_price: originalPrice,
        is_active: form.is_active,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        items: form.items,
      };
      if (form.id) {
        setCombos((prev) => prev.map((c) => (c.id === form.id ? newCombo : c)));
      } else {
        setCombos((prev) => [newCombo, ...prev]);
      }
      toast.success(form.id ? "Demo: Đã cập nhật combo" : "Demo: Đã tạo combo");
      setForm(EMPTY_FORM);
      setShowForm(false);
      return;
    }

    setSaving(true);
    const slug = form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const comboData = {
      name: form.name,
      slug,
      description: form.description || null,
      image_url: form.image_url || null,
      combo_price: Number(form.combo_price),
      original_price: originalPrice,
      is_active: form.is_active,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    let comboId = form.id;
    if (form.id) {
      const { error } = await supabase.from("combos").update({ ...comboData, updated_at: new Date().toISOString() }).eq("id", form.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await supabase.from("combo_items").delete().eq("combo_id", form.id);
    } else {
      const { data, error } = await supabase.from("combos").insert(comboData).select().single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      comboId = data.id;
    }

    await supabase.from("combo_items").insert(
      form.items.map((it) => ({ combo_id: comboId, product_id: it.product_id, quantity: it.quantity }))
    );

    toast.success(form.id ? "Đã cập nhật combo" : "Đã tạo combo");
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    // Reload
    window.location.reload();
  };

  const deleteCombo = async (id: string) => {
    if (!confirm("Xoá combo này?")) return;
    if (isDemo) {
      setCombos((prev) => prev.filter((c) => c.id !== id));
      toast.success("Demo: Đã xoá combo");
      return;
    }
    await supabase.from("combos").delete().eq("id", id);
    setCombos((prev) => prev.filter((c) => c.id !== id));
    toast.success("Đã xoá combo");
  };

  const filteredProducts = products.filter((p: any) =>
    !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Bán Combo</h1>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">Tạo combo sản phẩm với giá ưu đãi</p>
        </div>
        <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setShowForm(!showForm); }} className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
          <Plus className="w-4 h-4 mr-1 sm:mr-2" /> Tạo combo
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="gap-0 p-3 sm:p-5 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <h3 className="font-bold text-base">{form.id ? "Sửa combo" : "Tạo combo mới"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Tên combo *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="VD: Combo Bếp Nhà" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Giá combo (VND) *</Label>
              <Input type="number" value={form.combo_price} onChange={(e) => setForm((p) => ({ ...p, combo_price: e.target.value }))} placeholder="120000" className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Mô tả</Label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Mô tả ngắn gọn..." className="mt-1" />
          </div>

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
              <Label className="text-xs text-gray-500">URL hình ảnh</Label>
              <Input value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} placeholder="https://..." className="mt-1" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="accent-green-600" />
                Đang hoạt động
              </label>
            </div>
          </div>

          {/* Product picker */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-500 font-semibold">Sản phẩm trong combo ({form.items.length})</Label>
              <Button size="sm" variant="outline" onClick={() => setShowProductPicker(!showProductPicker)} className="text-xs">
                <PackagePlus className="w-3 h-3 mr-1" /> Thêm sản phẩm
              </Button>
            </div>

            {showProductPicker && (
              <div className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredProducts.slice(0, 15).map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-green-50 text-xs flex justify-between"
                    >
                      <span>{p.name}</span>
                      <span className="text-green-600 font-medium">{formatPrice(p.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items list */}
            {form.items.length > 0 ? (
              <div className="space-y-2">
                {form.items.map((it) => (
                  <div key={it.product_id} className="flex items-center gap-3 bg-white border rounded-lg px-3 py-2">
                    <span className="flex-1 text-sm font-medium">{it.product_name}</span>
                    <span className="text-xs text-gray-500">{formatPrice(it.price)}</span>
                    <div className="flex items-center border rounded">
                      <button onClick={() => updateItemQty(it.product_id, it.quantity - 1)} className="px-2 py-0.5 text-xs hover:bg-gray-100">-</button>
                      <span className="px-2 text-xs font-bold">{it.quantity}</span>
                      <button onClick={() => updateItemQty(it.product_id, it.quantity + 1)} className="px-2 py-0.5 text-xs hover:bg-gray-100">+</button>
                    </div>
                    <span className="text-xs font-bold w-20 text-right">{formatPrice(it.price * it.quantity)}</span>
                    <button onClick={() => removeProduct(it.product_id)} className="text-red-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-500">Giá gốc: <span className="line-through">{formatPrice(originalPrice)}</span></span>
                  <span className="text-gray-500">Giá combo: <span className="font-bold text-green-600">{formatPrice(Number(form.combo_price || 0))}</span></span>
                  {savings > 0 && <span className="text-red-600 font-bold">Tiết kiệm: {formatPrice(savings)} ({Math.round(savings / originalPrice * 100)}%)</span>}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Chưa có sản phẩm. Nhấn "Thêm sản phẩm" để bắt đầu.</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              {form.id ? "Cập nhật" : "Tạo combo"}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Huỷ</Button>
          </div>
        </Card>
      )}

      {/* Combo list */}
      <div className="space-y-4">
        {combos.map((combo) => (
          <Card key={combo.id} className="gap-0 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold">{combo.name}</h3>
                  <Badge className={combo.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                    {combo.is_active ? "Đang bán" : "Tạm dừng"}
                  </Badge>
                </div>
                {combo.description && <p className="text-xs text-gray-500 mt-1">{combo.description}</p>}

                <div className="flex items-center gap-4 mt-2">
                  <span className="text-lg font-bold text-green-600">{formatPrice(combo.combo_price)}</span>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(combo.original_price)}</span>
                  {combo.original_price > combo.combo_price && (
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      -{Math.round((1 - combo.combo_price / combo.original_price) * 100)}%
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(combo.items || []).map((it: any) => (
                    <span key={it.product_id} className="px-2 py-0.5 bg-gray-100 rounded-full text-[11px]">
                      {it.product_name} x{it.quantity}
                    </span>
                  ))}
                </div>

                {(combo.start_date || combo.end_date) && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    {combo.start_date && `Từ ${combo.start_date}`} {combo.end_date && `→ ${combo.end_date}`}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => editCombo(combo)} className="text-xs">Sửa</Button>
                <Button size="sm" variant="outline" onClick={() => deleteCombo(combo.id)} className="text-xs text-red-500 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {combos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <PackagePlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có combo nào. Nhấn "Tạo combo" để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
