"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Edit,
  X,
  Check,
  GripVertical,
  Image as ImageIcon,
  Save,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import type { Category } from "@/types";
import ImageUpload from "@/components/admin/ImageUpload";
import { CATEGORY_ICONS } from "@/lib/constants";

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    image_url: "",
    icon: "",
    slug: "",
  });

  const loadCategories = async () => {
    if (isDemo) {
      setCategories(MOCK_CATEGORIES as unknown as Category[]);
      return;
    }
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    setCategories(data || []);
  };

  useEffect(() => {
    loadCategories();
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

  const addCategory = async () => {
    if (!newName.trim()) return;
    if (isDemo) {
      toast.info("Demo: Kết nối Supabase để thêm danh mục");
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("categories").insert({
      name: newName.trim(),
      slug: generateSlug(newName),
      sort_order: categories.length + 1,
    });

    setLoading(false);
    if (error) {
      toast.error("Lỗi: " + error.message);
      return;
    }
    toast.success("Đã thêm danh mục");
    setNewName("");
    loadCategories();
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      description: cat.description || "",
      image_url: cat.image_url || "",
      icon: cat.icon || "",
      slug: cat.slug,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.name.trim()) return;
    if (isDemo) {
      toast.info("Demo: Kết nối Supabase để cập nhật");
      setEditingId(null);
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("categories")
      .update({
        name: editForm.name.trim(),
        slug: editForm.slug || generateSlug(editForm.name),
        description: editForm.description || null,
        image_url: editForm.image_url || null,
        icon: editForm.icon || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId);

    setLoading(false);
    if (error) {
      toast.error("Lỗi: " + error.message);
      return;
    }
    toast.success("Đã cập nhật danh mục");
    setEditingId(null);
    loadCategories();
  };

  const toggleActive = async (id: string, current: boolean) => {
    if (isDemo) {
      toast.info("Demo: Kết nối Supabase");
      return;
    }
    await supabase
      .from("categories")
      .update({ is_active: !current })
      .eq("id", id);
    loadCategories();
  };

  const deleteCategory = async (id: string) => {
    if (isDemo) {
      toast.info("Demo: Kết nối Supabase");
      return;
    }
    if (!confirm("Xoá danh mục này? Sản phẩm thuộc danh mục sẽ mất liên kết."))
      return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error("Lỗi: " + error.message);
      return;
    }
    toast.success("Đã xoá");
    loadCategories();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5">Danh mục sản phẩm</h1>

      {/* Add form */}
      <Card className="gap-0 p-4 mb-6">
        <div className="flex gap-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên danh mục mới..."
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
          <Button
            onClick={addCategory}
            disabled={loading || !newName.trim()}
            className="bg-green-600 hover:bg-green-700 shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Thêm
          </Button>
        </div>
      </Card>

      {/* Category list */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <Card key={cat.id} className="gap-0 p-0 overflow-hidden">
            {editingId === cat.id ? (
              /* Edit mode */
              <div className="p-4 space-y-4 bg-green-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-green-700">Chỉnh sửa danh mục</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEdit}
                    className="h-7 w-7 p-0 text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Tên danh mục *</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => {
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        }));
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Slug (URL)</Label>
                    <Input
                      value={editForm.slug}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Icon danh mục</Label>
                  <div className="mt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-2xl border">
                        {editForm.icon || "🛍️"}
                      </div>
                      <span className="text-sm text-gray-500">
                        {editForm.icon ? "Đã chọn" : "Chưa chọn (mặc định)"}
                      </span>
                      {editForm.icon && (
                        <button
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, icon: "" }))}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Xoá
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-10 gap-1 max-h-28 overflow-y-auto border rounded-lg p-2">
                      {CATEGORY_ICONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, icon: emoji }))}
                          className={`w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-green-100 transition-colors ${
                            editForm.icon === emoji ? "bg-green-200 ring-2 ring-green-500" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Mô tả</Label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Mô tả ngắn về danh mục..."
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm min-h-[60px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Hình ảnh danh mục</Label>
                  <div className="mt-1">
                    <ImageUpload
                      value={editForm.image_url ? [editForm.image_url] : []}
                      onChange={(urls) =>
                        setEditForm((prev) => ({
                          ...prev,
                          image_url: urls[0] || "",
                        }))
                      }
                      folder="categories"
                      maxFiles={1}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={saveEdit}
                    disabled={loading || !editForm.name.trim()}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5 mr-1" />
                    )}
                    Lưu
                  </Button>
                  <Button onClick={cancelEdit} variant="outline" size="sm">
                    Huỷ
                  </Button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div className="flex items-center gap-3 p-3">
                {/* Icon/Image */}
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : cat.icon ? (
                    <span className="text-2xl">{cat.icon}</span>
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    /{cat.slug}
                    {cat.description && (
                      <span className="ml-2 text-gray-400">
                        — {cat.description}
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    className="cursor-pointer text-xs"
                    variant={cat.is_active ? "default" : "secondary"}
                    onClick={() => toggleActive(cat.id, cat.is_active)}
                  >
                    {cat.is_active ? "Hiện" : "Ẩn"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                    onClick={() => startEdit(cat)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    onClick={() => deleteCategory(cat.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}

        {categories.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            Chưa có danh mục nào
          </Card>
        )}
      </div>
    </div>
  );
}
