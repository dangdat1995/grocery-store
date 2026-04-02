"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import {
  ArrowLeft, Save, Loader2, Trash2, Plus, ImageIcon, Video,
  CalendarDays, Package, Zap,
} from "lucide-react";

interface MediaItem {
  type: "image" | "video";
  url: string;
  alt: string;
}

interface EventProduct {
  id: string;
  product_id: string;
  sale_price: number | null;
  products?: { name: string; price: number; images: string[] };
}

const MOCK_EVENT: any = {
  id: "1",
  title: "Flash Sale Cuối Tuần",
  slug: "flash-sale-cuoi-tuan",
  description: "Giảm giá sốc cuối tuần cho tất cả sản phẩm rau củ quả tươi",
  discount_type: "percent",
  discount_value: 20,
  min_order_amount: 100000,
  start_date: "2026-03-29T00:00:00Z",
  end_date: "2026-04-05T23:59:59Z",
  is_active: true,
  media: [
    { type: "image", url: "https://placehold.co/800x400/f97316/fff?text=Flash+Sale", alt: "Flash Sale" },
  ],
};

const MOCK_EVENT_PRODUCTS: EventProduct[] = [
  { id: "ep1", product_id: "p1", sale_price: 28000, products: { name: "Rau muống", price: 35000, images: [] } },
  { id: "ep2", product_id: "p2", sale_price: 18000, products: { name: "Cà chua", price: 25000, images: [] } },
  { id: "ep3", product_id: "p3", sale_price: null, products: { name: "Khoai tây", price: 30000, images: [] } },
];

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [eventProducts, setEventProducts] = useState<EventProduct[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    discount_type: "percent",
    discount_value: "",
    min_order_amount: "0",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const toLocalDatetime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      if (isDemo) {
        setForm({
          title: MOCK_EVENT.title,
          description: MOCK_EVENT.description || "",
          discount_type: MOCK_EVENT.discount_type,
          discount_value: String(MOCK_EVENT.discount_value),
          min_order_amount: String(MOCK_EVENT.min_order_amount),
          start_date: toLocalDatetime(MOCK_EVENT.start_date),
          end_date: toLocalDatetime(MOCK_EVENT.end_date),
          is_active: MOCK_EVENT.is_active,
        });
        setMediaList(MOCK_EVENT.media || []);
        setEventProducts(MOCK_EVENT_PRODUCTS);
        setLoadingData(false);
        return;
      }

      const sb = createClient();
      const [{ data: event }, { data: products }] = await Promise.all([
        sb.from("events").select("*").eq("id", eventId).single(),
        sb
          .from("event_products")
          .select("*, products(name, price, images)")
          .eq("event_id", eventId),
      ]);

      if (!event) {
        toast.error("Không tìm thấy sự kiện");
        router.push("/admin/su-kien");
        return;
      }

      setForm({
        title: event.title,
        description: event.description || "",
        discount_type: event.discount_type,
        discount_value: String(event.discount_value),
        min_order_amount: String(event.min_order_amount),
        start_date: toLocalDatetime(event.start_date),
        end_date: toLocalDatetime(event.end_date),
        is_active: event.is_active,
      });
      setMediaList(event.media || []);
      setEventProducts(products || []);
      setLoadingData(false);
    };

    load();
  }, [eventId]);

  const updateForm = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start_date || !form.end_date) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 500));
      setLoading(false);
      toast.success("Demo: Cập nhật sự kiện thành công!");
      return;
    }

    const slug = form.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { error } = await createClient()
      .from("events")
      .update({
        title: form.title,
        slug,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: parseInt(form.discount_value) || 0,
        min_order_amount: parseInt(form.min_order_amount) || 0,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        is_active: form.is_active,
        media: mediaList.filter((m) => m.url.trim()),
      })
      .eq("id", eventId);

    setLoading(false);

    if (error) {
      toast.error("Lỗi: " + error.message);
      return;
    }

    toast.success("Cập nhật sự kiện thành công!");
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xoá sự kiện này? Hành động không thể hoàn tác.")) return;

    setDeleting(true);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Demo: Đã xoá sự kiện");
      router.push("/admin/su-kien");
      return;
    }

    const { error } = await createClient().from("events").delete().eq("id", eventId);
    setDeleting(false);

    if (error) {
      toast.error("Lỗi xoá: " + error.message);
      return;
    }

    toast.success("Đã xoá sự kiện");
    router.push("/admin/su-kien");
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin/su-kien">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Button>
        </Link>
        <h1 className="text-lg sm:text-xl font-bold">Chi tiết sự kiện</h1>
      </div>

      <Card className="gap-0 p-3 sm:p-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Tên sự kiện *</Label>
            <Input
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              placeholder="Flash Sale Cuối Tuần"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label>Mô tả</Label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[60px]"
              placeholder="Giảm giá lên đến 50% cho tất cả rau củ..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loại giảm giá</Label>
              <select
                value={form.discount_type}
                onChange={(e) => updateForm("discount_type", e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="percent">Giảm %</option>
                <option value="fixed">Giảm tiền (VND)</option>
              </select>
            </div>
            <div>
              <Label>Giá trị giảm *</Label>
              <Input
                type="number"
                value={form.discount_value}
                onChange={(e) => updateForm("discount_value", e.target.value)}
                placeholder={form.discount_type === "percent" ? "20" : "50000"}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label>Đơn tối thiểu (VND)</Label>
            <Input
              type="number"
              value={form.min_order_amount}
              onChange={(e) => updateForm("min_order_amount", e.target.value)}
              placeholder="100000"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bắt đầu *</Label>
              <Input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => updateForm("start_date", e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Kết thúc *</Label>
              <Input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => updateForm("end_date", e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => updateForm("is_active", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is_active" className="cursor-pointer">Kích hoạt sự kiện</Label>
          </div>

          {/* Media */}
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

          {/* Event Products */}
          {eventProducts.length > 0 && (
            <div className="border-t pt-4">
              <Label className="font-semibold flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-green-600" /> Sản phẩm tham gia ({eventProducts.length})
              </Label>
              <div className="space-y-1.5">
                {eventProducts.map((ep) => (
                  <div key={ep.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium">{ep.products?.name || ep.product_id}</span>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {ep.products?.price && (
                        <span className="line-through">{formatPrice(ep.products.price)}</span>
                      )}
                      {ep.sale_price && (
                        <span className="text-red-600 font-semibold">{formatPrice(ep.sale_price)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 gap-1.5" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Huỷ
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Đang xoá..." : "Xoá"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
