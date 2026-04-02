import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: Send voucher to a customer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { voucher_id, user_id, reason, event_id } = await request.json();
    if (!voucher_id || !user_id) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from("voucher_distributions")
      .select("id")
      .eq("voucher_id", voucher_id)
      .eq("user_id", user_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Khách đã nhận voucher này" }, { status: 400 });
    }

    const { error } = await supabase.from("voucher_distributions").insert({
      voucher_id,
      user_id,
      reason: reason || "manual",
      event_id: event_id || null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
