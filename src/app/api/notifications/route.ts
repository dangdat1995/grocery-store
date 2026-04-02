import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const DEMO_NOTIFICATIONS = [
  {
    id: "n1",
    type: "order",
    title: "Đơn hàng đã xác nhận",
    message: "Đơn hàng GH-20260401-001 đã được xác nhận và đang chuẩn bị.",
    link: "/don-hang/demo-1",
    is_read: false,
    is_global: false,
    created_at: "2026-04-01T15:00:00Z",
  },
  {
    id: "n2",
    type: "order",
    title: "Đơn hàng đang giao",
    message: "Đơn GH-20260401-001 đã được giao cho shipper. Dự kiến 30 phút.",
    link: "/don-hang/demo-1",
    is_read: false,
    is_global: false,
    created_at: "2026-04-01T16:30:00Z",
  },
  {
    id: "n3",
    type: "promo",
    title: "Flash Sale cuoi tuan!",
    message: "Giam 30% tat ca rau cu qua. Chi ap dung 2 ngay cuoi tuan nay!",
    link: "/san-pham",
    is_read: true,
    is_global: true,
    created_at: "2026-03-30T09:00:00Z",
  },
  {
    id: "n4",
    type: "event",
    title: "Su kien khai truong chi nhanh moi",
    message: "Mung khai truong chi nhanh Q.7 - Tang voucher 50K cho 100 khach dau tien!",
    link: "/chi-nhanh",
    is_read: true,
    is_global: true,
    created_at: "2026-03-28T08:00:00Z",
  },
];

// GET: Fetch notifications for current user
export async function GET() {
  if (isDemo) {
    const unread = DEMO_NOTIFICATIONS.filter((n) => !n.is_read).length;
    return NextResponse.json({ notifications: DEMO_NOTIFICATIONS, unread_count: unread });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ notifications: [], unread_count: 0 });
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .or(`user_id.eq.${user.id},is_global.eq.true`)
    .order("created_at", { ascending: false })
    .limit(50);

  const unread = (notifications || []).filter((n) => !n.is_read).length;

  return NextResponse.json({ notifications: notifications || [], unread_count: unread });
}

// POST: Create notification (admin use)
export async function POST(request: NextRequest) {
  if (isDemo) {
    return NextResponse.json({ success: true, demo: true });
  }

  const supabase = await createClient();
  const body = await request.json();
  const { type, title, message, link, user_id, order_id, is_global } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "Thiếu tiêu đề hoặc nội dung" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      type: type || "info",
      title,
      message,
      link: link || null,
      user_id: is_global ? null : (user_id || null),
      order_id: order_id || null,
      is_global: !!is_global,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notification: data });
}

// PATCH: Mark notifications as read
export async function PATCH(request: NextRequest) {
  if (isDemo) {
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { notification_id, mark_all } = body;

  if (mark_all) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  } else if (notification_id) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notification_id)
      .eq("user_id", user.id);
  }

  return NextResponse.json({ success: true });
}
