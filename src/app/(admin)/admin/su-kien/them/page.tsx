"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ImageIcon, Video } from "lucide-react";

interface MediaItem {
  type: "image" | "video";
  url: string;
  alt: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    discount_type: "percent",
    discount_value: "",
    min_order_amount: "0",
    start_date: "",
    end_date: "",
  });

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start_date || !form.end_date) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("events").insert({
      title: form.title,
      slug: generateSlug(form.title),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseInt(form.discount_value) || 0,
      min_order_amount: parseInt(form.min_order_amount) || 0,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      is_active: true,
      media: mediaList.filter((m) => m.url.trim()),
    });
    setLoading(false);

    if (error) {
      toast.error("Lỗi: " + error.message);
      return;
    }

    toast.success("Tạo sự kiện thành công!");
    router.push("/admin/su-kien");
  };

  const updateForm = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5">Tạo sự kiện mới</h1>
      <Card className="gap-0 p-3 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tên sự kiện *</Label>
            <Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="Flash Sale Cuối Tuần" className="mt-1" required />
          </div>
          <div>
            <Label>Mô tả</Label>
            <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[60px]" placeholder="Giảm giá lên đến 50% cho tất cả rau củ..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loại giảm giá</Label>
              <select value={form.discount_type} onChange={(e) => updateForm("discount_type", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                <option value="percent">Giảm %</option>
                <option value="fixed">Giảm tiền (VND)</option>
              </select>
            </div>
            <div>
              <Label>Giá trị giảm *</Label>
              <Input type="number" value={form.discount_value} onChange={(e) => updateForm("discount_value", e.target.value)} placeholder={form.discount_type === "percent" ? "20" : "50000"} className="mt-1" required />
            </div>
          </div>
          <div>
            <Label>Đơn tối thiểu (VND)</Label>
            <Input type="number" value={form.min_order_amount} onChange={(e) => updateForm("min_order_amount", e.target.value)} placeholder="100000" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bắt đầu *</Label>
              <Input type="datetime-local" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label>Kết thúc *</Label>
              <Input type="datetime-local" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} className="mt-1" required />
            </div>
          </div>
          {/* Media (Ảnh/Video) */}
          <div className="border-t pt-4">
            <Label className="font-semibold flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-purple-600" /> Ảnh / Video sự kiện
            </Label>
            <div className="space-y-2">
              {mediaList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.type}
                    onChange={(e) => {
                      const updated = [...mediaList];
                      updated[idx] = { ...item, type: e.target.value as "image" | "video" };
                      setMediaList(updated);
                    }}
                    className="w-24 border rounded-md px-2 py-2 text-sm"
                  >
                    <option value="image">Ảnh</option>
                    <option value="video">Video</option>
                  </select>
                  <Input
                    value={item.url}
                    onChange={(e) => {
                      const updated = [...mediaList];
                      updated[idx] = { ...item, url: e.target.value };
                      setMediaList(updated);
                    }}
                    placeholder={item.type === "video" ? "https://...video.mp4" : "https://...image.jpg"}
                    className="flex-1"
                  />
                  <Input
                    value={item.alt}
                    onChange={(e) => {
                      const updated = [...mediaList];
                      updated[idx] = { ...item, alt: e.target.value };
                      setMediaList(updated);
                    }}
                    placeholder="Mô tả"
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 h-9 w-9 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMediaList([...mediaList, { type: "image", url: "", alt: "" }])}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm ảnh/video
              </Button>
            </div>

            {/* Media preview */}
            {mediaList.filter((m) => m.url).length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {mediaList.filter((m) => m.url).map((item, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border aspect-video bg-gray-100">
                    {item.type === "video" ? (
                      <video src={item.url} controls muted className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt={item.alt || "Preview"} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo sự kiện"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Huỷ</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
