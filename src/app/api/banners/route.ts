import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEMO_BANNERS = [
  { id: "1", title: "Flash Sale Cuối Tuần", subtitle: "Giảm đến 50% rau củ, trái cây tươi sống — chỉ 2 ngày duy nhất!", tag: "HOT DEAL", link: "/san-pham?sale=true", gradient: "from-green-600 via-emerald-500 to-teal-500", emoji: "🥬", tag_color: "bg-yellow-400 text-yellow-900", media_type: "none", media_url: "", sort_order: 0, is_active: true },
  { id: "2", title: "Thịt Tươi Mỗi Ngày", subtitle: "Cam kết nhập mới 100% — Giao nhanh 2 giờ", tag: "CAM KẾT", link: "/san-pham", gradient: "from-emerald-600 via-green-500 to-lime-500", emoji: "🥩", tag_color: "bg-white/20 text-white", media_type: "none", media_url: "", sort_order: 1, is_active: true },
  { id: "3", title: "Miễn Phí Giao Hàng", subtitle: "Đơn từ 300k trong bán kính 5km", tag: "FREE SHIP", link: "/san-pham", gradient: "from-teal-600 via-emerald-500 to-green-500", emoji: "🚛", tag_color: "bg-white/20 text-white", media_type: "none", media_url: "", sort_order: 2, is_active: true },
];

// GET: public — active banners
export async function GET() {
  const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  if (isDemo) {
    return NextResponse.json({ banners: DEMO_BANNERS });
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return NextResponse.json({ banners: data || [] });
  } catch {
    return NextResponse.json({ banners: DEMO_BANNERS });
  }
}

// POST: admin — create banner
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { data, error } = await supabase.from("banners").insert({
      title: body.title,
      subtitle: body.subtitle || null,
      tag: body.tag || null,
      tag_color: body.tag_color || "bg-white/20 text-white",
      link: body.link || "/san-pham",
      gradient: body.gradient || "from-green-600 via-emerald-500 to-teal-500",
      emoji: body.emoji || null,
      media_type: body.media_type || "none",
      media_url: body.media_url || null,
      sort_order: body.sort_order ?? 0,
      is_active: body.is_active ?? true,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ banner: data });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// PATCH: admin — update banner
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data, error } = await supabase.from("banners").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ banner: data });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// DELETE: admin — delete banner
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
