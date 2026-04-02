import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Lấy cài đặt cửa hàng
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from("store_settings")
      .select("key, value");

    const map: Record<string, string> = {};
    settings?.forEach((s: any) => {
      map[s.key] = s.value || "";
    });

    return NextResponse.json({ settings: map });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// PATCH: Cập nhật cài đặt cửa hàng
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates: Record<string, string> = await request.json();

    for (const [key, value] of Object.entries(updates)) {
      await supabase
        .from("store_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
