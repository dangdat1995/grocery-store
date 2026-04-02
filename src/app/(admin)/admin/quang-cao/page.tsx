"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Video,
  Eye,
  EyeOff,
  GripVertical,
  ChevronRight,
  Zap,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tag_color: string;
  link: string;
  gradient: string;
  emoji: string;
  media_type: "none" | "image" | "video";
  media_url: string;
  sort_order: number;
  is_active: boolean;
}

const GRADIENT_PRESETS = [
  { label: "Xanh lá", value: "from-green-600 via-emerald-500 to-teal-500" },
  { label: "Xanh đậm", value: "from-green-700 via-emerald-600 to-teal-600" },
  { label: "Xanh nhạt", value: "from-emerald-600 via-green-500 to-lime-500" },
  { label: "Teal", value: "from-teal-600 via-emerald-500 to-green-500" },
  { label: "Xanh ngọc", value: "from-emerald-500 via-teal-500 to-cyan-500" },
];

const TAG_COLOR_PRESETS = [
  { label: "Vàng nổi", value: "bg-yellow-400 text-yellow-900" },
  { label: "Trắng mờ", value: "bg-white/20 text-white" },
  { label: "Trắng đục", value: "bg-white/30 text-white" },
  { label: "Xanh đậm", value: "bg-green-800 text-white" },
];

const EMPTY_BANNER: Omit<Banner, "id"> = {
  title: "",
  subtitle: "",
  tag: "",
  tag_color: "bg-yellow-400 text-yellow-900",
  link: "/san-pham",
  gradient: "from-green-600 via-emerald-500 to-teal-500",
  emoji: "",
  media_type: "none",
  media_url: "",
  sort_order: 0,
  is_active: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBanners = (signal?: AbortSignal) => {
    fetch("/api/banners", { signal })
      .then((r) => r.json())
      .then((data) => setBanners(data.banners || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchBanners(controller.signal);
    const onAiAction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === "create_banner" && detail.item) {
        setBanners((prev) => [...prev, detail.item]);
        toast.success("AI vừa tạo banner mới!");
      } else if (detail?.action === "create_banner") {
        fetchBanners();
      }
    };
    window.addEventListener("ai-action-done", onAiAction);
    return () => {
      controller.abort();
      window.removeEventListener("ai-action-done", onAiAction);
    };
  }, []);

  const startNew = () => {
    setEditing({ ...EMPTY_BANNER, id: "", sort_order: banners.length } as Banner);
    setIsNew(true);
  };

  const startEdit = (b: Banner) => {
    setEditing({ ...b });
    setIsNew(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title) {
      toast.error("Tiêu đề không được trống");
      return;
    }
    if (isDemo) {
      toast.info("Demo: Kết nối Supabase để lưu");
      // For demo, add locally
      if (isNew) {
        const newBanner = { ...editing, id: Date.now().toString() };
        setBanners((prev) => [...prev, newBanner]);
      } else {
        setBanners((prev) => prev.map((b) => (b.id === editing.id ? editing : b)));
      }
      cancelEdit();
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const { id, ...body } = editing;
        const res = await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setBanners((prev) => [...prev, data.banner]);
        toast.success("Đã tạo banner");
      } else {
        const res = await fetch("/api/banners", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setBanners((prev) => prev.map((b) => (b.id === editing.id ? data.banner : b)));
        toast.success("Đã cập nhật banner");
      }
      cancelEdit();
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu banner");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá banner này?")) return;
    if (isDemo) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Đã xoá (demo)");
      return;
    }
    try {
      const res = await fetch("/api/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Đã xoá banner");
    } catch {
      toast.error("Lỗi xoá banner");
    }
  };

  const updateField = (key: keyof Banner, value: any) => {
    if (!editing) return;
    setEditing({ ...editing, [key]: value });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Quảng cáo & Banner</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý banner quảng cáo trên trang chủ (hỗ trợ ảnh, video, GIF)</p>
        </div>
        <Button onClick={startNew} className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
          <Plus className="w-4 h-4 mr-1" /> Thêm banner
        </Button>
      </div>

      {isDemo && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <strong>Demo:</strong> Dữ liệu mẫu. Kết nối Supabase để lưu thực tế.
        </div>
      )}

      {/* Banner list */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Đang tải...
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b, idx) => (
            <Card key={b.id} className="overflow-hidden">
              <div className="flex items-stretch">
                {/* Preview thumbnail */}
                <div className={`w-48 sm:w-56 shrink-0 relative overflow-hidden ${!b.media_url ? `bg-gradient-to-br ${b.gradient}` : "bg-gray-100"}`}>
                  {b.media_type === "video" && b.media_url ? (
                    <video src={b.media_url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                  ) : b.media_type === "image" && b.media_url ? (
                    <img src={b.media_url} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      {b.emoji && <span className="text-4xl opacity-30">{b.emoji}</span>}
                    </div>
                  )}
                  {!b.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/40 px-2 py-1 rounded">Ẩn</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm truncate">{b.title || "(Chưa có tiêu đề)"}</h3>
                      {b.tag && (
                        <span className={`${b.tag_color} text-[9px] font-bold px-1.5 py-0.5 rounded-full`}>{b.tag}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{b.subtitle}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                      {b.media_type !== "none" && (
                        <span className="flex items-center gap-0.5">
                          {b.media_type === "video" ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          {b.media_type === "video" ? "Video" : "Hình ảnh"}
                        </span>
                      )}
                      <span>Link: {b.link}</span>
                      <span>Thứ tự: {b.sort_order}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(b)} className="text-xs h-7">
                      <Pencil className="w-3 h-3 mr-1" /> Sửa
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(b.id)} className="text-xs h-7 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {banners.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Chưa có banner nào. Nhấn "Thêm banner" để bắt đầu.
            </div>
          )}
        </div>
      )}

      {/* Edit / Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-base">{isNew ? "Thêm banner mới" : "Chỉnh sửa banner"}</h2>
              <button onClick={cancelEdit} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Preview */}
              <div className={`relative rounded-xl overflow-hidden h-40 ${!editing.media_url ? `bg-gradient-to-br ${editing.gradient}` : "bg-gray-900"}`}>
                {editing.media_type === "video" && editing.media_url ? (
                  <video src={editing.media_url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                ) : editing.media_type === "image" && editing.media_url ? (
                  <img src={editing.media_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 hero-pattern opacity-10" />
                    {editing.emoji && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-15">{editing.emoji}</span>}
                  </>
                )}
                {editing.media_url && <div className="absolute inset-0 bg-black/30" />}
                <div className="relative z-10 h-full flex flex-col justify-center px-6">
                  {editing.tag && (
                    <span className={`${editing.tag_color} text-[9px] font-extrabold px-2 py-0.5 rounded-full w-fit mb-1.5 inline-flex items-center gap-1`}>
                      <Zap className="w-2.5 h-2.5" /> {editing.tag}
                    </span>
                  )}
                  <p className="text-white text-xl font-extrabold drop-shadow">{editing.title || "Tiêu đề banner"}</p>
                  <p className="text-white/70 text-xs mt-1">{editing.subtitle || "Mô tả phụ..."}</p>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Tiêu đề *</Label>
                  <Input value={editing.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Flash Sale Cuối Tuần" className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Mô tả phụ</Label>
                  <Input value={editing.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} placeholder="Giảm đến 50%..." className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Tag (nhãn góc)</Label>
                  <Input value={editing.tag} onChange={(e) => updateField("tag", e.target.value)} placeholder="HOT DEAL" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Màu tag</Label>
                  <select value={editing.tag_color} onChange={(e) => updateField("tag_color", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                    {TAG_COLOR_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Link đích</Label>
                  <Input value={editing.link} onChange={(e) => updateField("link", e.target.value)} placeholder="/san-pham" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Emoji (hiệu ứng nền)</Label>
                  <Input value={editing.emoji} onChange={(e) => updateField("emoji", e.target.value)} placeholder="🥬" className="mt-1" />
                </div>
              </div>

              {/* Gradient */}
              <div>
                <Label className="text-xs">Gradient nền (khi không có ảnh/video)</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {GRADIENT_PRESETS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => updateField("gradient", g.value)}
                      className={`h-8 px-3 rounded-lg bg-gradient-to-r ${g.value} text-white text-[10px] font-bold border-2 transition-all ${editing.gradient === g.value ? "border-gray-800 scale-105" : "border-transparent"}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media */}
              <div className="border-t pt-4">
                <Label className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                  <ImageIcon className="w-3.5 h-3.5 text-green-600" /> Ảnh / Video / GIF quảng cáo
                </Label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(["none", "image", "video"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateField("media_type", type)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${editing.media_type === type ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                    >
                      {type === "none" ? "Chỉ gradient" : type === "image" ? "Hình ảnh / GIF" : "Video (MP4)"}
                    </button>
                  ))}
                </div>

                {editing.media_type !== "none" && (
                  <div>
                    <Label className="text-xs text-gray-500">
                      {editing.media_type === "video" ? "URL video (MP4, WebM)" : "URL hình ảnh (JPG, PNG, GIF, WebP)"}
                    </Label>
                    <Input
                      value={editing.media_url}
                      onChange={(e) => updateField("media_url", e.target.value)}
                      placeholder={editing.media_type === "video" ? "https://...video.mp4" : "https://...image.jpg hoặc .gif"}
                      className="mt-1"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      {editing.media_type === "video"
                        ? "Hỗ trợ MP4, WebM. Video sẽ tự phát, tắt tiếng, lặp lại."
                        : "Hỗ trợ JPG, PNG, WebP, GIF. GIF sẽ hiển thị động trên banner."}
                    </p>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 border-t pt-4">
                <div>
                  <Label className="text-xs">Thứ tự hiển thị</Label>
                  <Input type="number" value={editing.sort_order} onChange={(e) => updateField("sort_order", parseInt(e.target.value) || 0)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Trạng thái</Label>
                  <select
                    value={editing.is_active ? "true" : "false"}
                    onChange={(e) => updateField("is_active", e.target.value === "true")}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="true">Hiển thị</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-4 border-t sticky bottom-0 bg-white rounded-b-2xl">
              <Button variant="outline" onClick={cancelEdit}>Huỷ</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                {saving ? "Đang lưu..." : isNew ? "Tạo banner" : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
