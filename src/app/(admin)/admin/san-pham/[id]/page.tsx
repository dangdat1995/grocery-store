"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_UNITS, BULK_UNITS } from "@/lib/constants";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import type { Category } from "@/types";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
    const productId = params.id as string;
    if (!productId) return;

    const load = async () => {
      if (isDemo) {
        setCategories(MOCK_CATEGORIES as any);
        const mockProduct = MOCK_PRODUCTS.find((p) => p.id === productId);
        if (mockProduct) {
          setForm({
            name: mockProduct.name,
            category_id: mockProduct.category_id || "",
            price: String(mockProduct.price),
            compare_at_price: mockProduct.compare_at_price ? String(mockProduct.compare_at_price) : "",
            unit: mockProduct.unit,
            stock_quantity: String(mockProduct.stock_quantity),
            sku: mockProduct.sku || "",
            weight_grams: mockProduct.weight_grams ? String(mockProduct.weight_grams) : "",
            bulk_unit: (mockProduct as any).bulk_unit || "",
            bulk_quantity: (mockProduct as any).bulk_quantity ? String((mockProduct as any).bulk_quantity) : "",
            bulk_price: (mockProduct as any).bulk_price ? String((mockProduct as any).bulk_price) : "",
            is_active: mockProduct.is_active,
            is_featured: mockProduct.is_featured,
          });
          setDescription(mockProduct.description || "");
        }
        setLoadingData(false);
        return;
      }

      try {
        const [{ data: cats }, { data: product }] = await Promise.all([
          supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
          supabase.from("products").select("*, images:product_images(url, sort_order)").eq("id", productId).single(),
        ]);
        setCategories(cats || []);
        if (product) {
          setForm({
            name: product.name,
            category_id: product.category_id || "",
            price: String(product.price),
            compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
            unit: product.unit,
            stock_quantity: String(product.stock_quantity),
            sku: product.sku || "",
            weight_grams: product.weight_grams ? String(product.weight_grams) : "",
            bulk_unit: product.bulk_unit || "",
            bulk_quantity: product.bulk_quantity ? String(product.bulk_quantity) : "",
            bulk_price: product.bulk_price ? String(product.bulk_price) : "",
            is_active: product.is_active,
            is_featured: product.is_featured,
          });
          setDescription(product.description || "");
          if (product.images) {
            setImages(
              product.images
                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((img: any) => img.url)
            );
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
        toast.error("Lỗi tải dữ liệu sản phẩm");
      }
      setLoadingData(false);
    };
    load();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemo) {
      toast.info("Demo: Kết nối Supabase để cập nhật");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("products")
      .update({
        name: form.name,
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      toast.error("Lỗi: " + error.message);
      setLoading(false);
      return;
    }

    // Update images: delete old, insert new
    await supabase.from("product_images").delete().eq("product_id", params.id);
    if (images.length > 0) {
      await supabase.from("product_images").insert(
        images.map((url, i) => ({
          product_id: params.id as string,
          url,
          sort_order: i,
          is_primary: i === 0,
        }))
      );
    }

    toast.success("Cập nhật thành công!");
    router.push("/admin/san-pham");
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;
    if (isDemo) {
      toast.info("Demo: Kết nối Supabase để xoá");
      return;
    }
    const { error } = await supabase.from("products").delete().eq("id", params.id);
    if (error) {
      toast.error("Lỗi: " + error.message);
      return;
    }
    toast.success("Đã xoá sản phẩm");
    router.push("/admin/san-pham");
  };

  const updateForm = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loadingData) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/san-pham">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
          </Button>
        </Link>
        <h1 className="text-lg sm:text-xl font-bold">Sửa sản phẩm</h1>
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
              <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} className="mt-1" required />
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
              <Input type="number" value={form.price} onChange={(e) => updateForm("price", e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Giá gốc (VND)</Label>
              <Input type="number" value={form.compare_at_price} onChange={(e) => updateForm("compare_at_price", e.target.value)} className="mt-1" />
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
              <Input value={form.sku} onChange={(e) => updateForm("sku", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Khối lượng (g)</Label>
              <Input type="number" value={form.weight_grams} onChange={(e) => updateForm("weight_grams", e.target.value)} className="mt-1" />
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
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Huỷ</Button>
          <Button type="button" variant="destructive" onClick={handleDelete} className="ml-auto">
            <Trash2 className="w-4 h-4 mr-1" /> Xoá
          </Button>
        </div>
      </form>
    </div>
  );
}
