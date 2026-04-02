"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_UNITS, BULK_UNITS } from "@/lib/constants";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import type { Category } from "@/types";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    price: "",
    compare_at_price: "",
    unit: "kg",
    stock_quantity: "0",
    sku: "",
    weight_grams: "",
    bulk_unit: "",
    bulk_quantity: "",
    bulk_price: "",
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    if (isDemo) {
      setCategories(MOCK_CATEGORIES as any);
      return;
    }
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setCategories(data || []));
  }, []);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemo) {
      toast.info("Demo: Kết nối Supabase để lưu sản phẩm");
      return;
    }

    setLoading(true);
    const slug = generateSlug(form.name);

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: form.name,
        slug,
        category_id: form.category_id || null,
        price: parseInt(form.price),
        compare_at_price: form.compare_at_price ? parseInt(form.compare_at_price) : null,
        unit: form.unit,
        stock_quantity: parseInt(form.stock_quantity),
        sku: form.sku || null,
        weight_grams: form.weight_grams ? parseInt(form.weight_grams) : null,
        bulk_unit: form.bulk_unit || null,
        bulk_quantity: form.bulk_quantity ? parseInt(form.bulk_quantity) : null,
        bulk_price: form.bulk_price ? parseInt(form.bulk_price) : null,
        description: description || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
      })
      .select()
      .single();

    if (error) {
      toast.error("Lỗi: " + error.message);
      setLoading(false);
      return;
    }

    // Save images
    if (product && images.length > 0) {
      const imageInserts = images.map((url, i) => ({
        product_id: product.id,
        url,
        sort_order: i,
        is_primary: i === 0,
      }));
      await supabase.from("product_images").insert(imageInserts);
    }

    toast.success("Thêm sản phẩm thành công!");
    router.push("/admin/san-pham");
    setLoading(false);
  };

  const updateForm = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/san-pham">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
          </Button>
        </Link>
        <h1 className="text-lg sm:text-xl font-bold">Thêm sản phẩm</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <Card className="gap-0 p-5">
          <h2 className="font-bold text-base mb-3">Hình ảnh sản phẩm</h2>
          <ImageUpload value={images} onChange={setImages} folder="products" maxFiles={5} />
        </Card>

        {/* Basic info */}
        <Card className="gap-0 p-5 space-y-4">
          <h2 className="font-bold text-base">Thông tin cơ bản</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Tên sản phẩm *</Label>
              <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="VD: Rau muống tươi" className="mt-1" required />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Danh mục</Label>
              <select value={form.category_id} onChange={(e) => updateForm("category_id", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md h-9 px-3 text-sm">
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Giá bán (VND) *</Label>
              <Input type="number" value={form.price} onChange={(e) => updateForm("price", e.target.value)} placeholder="25000" className="mt-1" required />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Giá gốc (VND)</Label>
              <Input type="number" value={form.compare_at_price} onChange={(e) => updateForm("compare_at_price", e.target.value)} placeholder="35000" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Đơn vị</Label>
              <select value={form.unit} onChange={(e) => updateForm("unit", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md h-9 px-3 text-sm">
                {PRODUCT_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Tồn kho</Label>
              <Input type="number" value={form.stock_quantity} onChange={(e) => updateForm("stock_quantity", e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">SKU</Label>
              <Input value={form.sku} onChange={(e) => updateForm("sku", e.target.value)} placeholder="RAU001" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Khối lượng (g)</Label>
              <Input type="number" value={form.weight_grams} onChange={(e) => updateForm("weight_grams", e.target.value)} placeholder="500" className="mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => updateForm("is_active", e.target.checked)} className="accent-green-600" />
              Đang bán
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => updateForm("is_featured", e.target.checked)} className="accent-green-600" />
              Nổi bật
            </label>
          </div>
        </Card>

        {/* Bulk / wholesale */}
        <Card className="gap-0 p-5 space-y-4">
          <h2 className="font-bold text-base">Bán sỉ / nguyên thùng</h2>
          <p className="text-xs text-gray-400">Nếu sản phẩm hỗ trợ mua nguyên thùng/lốc, nhập thông tin bên dưới</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Đơn vị sỉ</Label>
              <select value={form.bulk_unit} onChange={(e) => updateForm("bulk_unit", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md h-9 px-3 text-sm">
                <option value="">-- Không bán sỉ --</option>
                {BULK_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Số lượng / {form.bulk_unit ? BULK_UNITS.find(u => u.value === form.bulk_unit)?.label || form.bulk_unit : "thùng"}</Label>
              <Input type="number" value={form.bulk_quantity} onChange={(e) => updateForm("bulk_quantity", e.target.value)} placeholder="VD: 24" className="mt-1" disabled={!form.bulk_unit} />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Giá sỉ (VND)</Label>
              <Input type="number" value={form.bulk_price} onChange={(e) => updateForm("bulk_price", e.target.value)} placeholder="VD: 180000" className="mt-1" disabled={!form.bulk_unit} />
            </div>
          </div>
          {form.bulk_unit && form.bulk_quantity && form.bulk_price && form.price && (
            <p className="text-xs text-green-600">
              Giá lẻ: {new Intl.NumberFormat("vi-VN").format(Number(form.price))}đ/{form.unit} — Giá sỉ: {new Intl.NumberFormat("vi-VN").format(Number(form.bulk_price))}đ/{BULK_UNITS.find(u => u.value === form.bulk_unit)?.label || form.bulk_unit} ({form.bulk_quantity} {PRODUCT_UNITS.find(u => u.value === form.unit)?.label || form.unit})
            </p>
          )}
        </Card>

        {/* Rich description */}
        <Card className="gap-0 p-5">
          <h2 className="font-bold text-base mb-3">Mô tả sản phẩm</h2>
          <p className="text-xs text-gray-400 mb-2">Hỗ trợ in đậm, danh sách, chèn ảnh vào mô tả</p>
          <RichTextEditor value={description} onChange={setDescription} />
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {loading ? "Đang lưu..." : "Thêm sản phẩm"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Huỷ</Button>
        </div>
      </form>
    </div>
  );
}
