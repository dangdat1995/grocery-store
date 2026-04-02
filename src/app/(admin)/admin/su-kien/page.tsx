export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EventListClient from "./EventListClient";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const MOCK_EVENTS = [
  { id: "1", title: "Flash Sale Cuối Tuần", description: "Giảm giá sốc cuối tuần", discount_type: "percent", discount_value: 20, start_date: "2026-03-29T00:00:00Z", end_date: "2026-04-05T23:59:59Z", is_active: true, event_products: [{ count: 8 }], media: [{ type: "image", url: "https://placehold.co/800x400/f97316/fff?text=Flash+Sale" }], created_at: "2026-03-28T10:00:00Z" },
  { id: "2", title: "Khuyến mãi Tháng 4", description: "Mua nhiều giảm nhiều", discount_type: "fixed", discount_value: 50000, start_date: "2026-04-01T00:00:00Z", end_date: "2026-04-30T23:59:59Z", is_active: true, event_products: [{ count: 12 }], media: [{ type: "image", url: "https://placehold.co/800x400/16a34a/fff?text=Khuyen+Mai" }, { type: "video", url: "" }], created_at: "2026-03-25T10:00:00Z" },
  { id: "3", title: "Tết Nguyên Đán 2026", description: "Ưu đãi lớn dịp Tết", discount_type: "percent", discount_value: 30, start_date: "2026-01-15T00:00:00Z", end_date: "2026-02-15T23:59:59Z", is_active: false, event_products: [{ count: 20 }], media: [], created_at: "2026-01-10T10:00:00Z" },
];

export default async function AdminEventsPage() {
  let events: any[] = [];
  if (isDemo) {
    events = MOCK_EVENTS;
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("events")
        .select("*, event_products(count)")
        .order("created_at", { ascending: false });
      events = data || [];
    } catch {
      events = [];
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h1 className="text-lg sm:text-xl font-bold">Sự kiện khuyến mãi</h1>
        <Link href="/admin/su-kien/them">
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" /> Tạo sự kiện
          </Button>
        </Link>
      </div>
      <EventListClient events={events} />
    </div>
  );
}
