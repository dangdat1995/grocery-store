import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: Auto distribute vouchers
// Can be called by admin manually or via cron/webhook
// Modes:
// - event_auto: distribute event vouchers to all active customers
// - loyalty_reward: distribute vouchers to loyal customers based on tier
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { mode, voucher_id, event_id, min_tier } = await request.json();

    if (!voucher_id) {
      return NextResponse.json({ error: "Thiếu voucher_id" }, { status: 400 });
    }

    let targetUsers: string[] = [];

    if (mode === "event_auto" && event_id) {
      // Get all active customers and send them the event voucher
      const { data: customers } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer");
      targetUsers = (customers || []).map((c: any) => c.id);
    } else if (mode === "loyalty_reward") {
      // Get customers at or above a certain tier
      const tierOrder = ["new", "bronze", "silver", "gold", "platinum"];
      const minIdx = tierOrder.indexOf(min_tier || "bronze");
      const qualifyingTiers = tierOrder.slice(minIdx);

      const { data: customers } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer")
        .in("loyalty_tier", qualifyingTiers);
      targetUsers = (customers || []).map((c: any) => c.id);
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({ success: true, distributed: 0, message: "Không có khách hàng phù hợp" });
    }

    // Batch insert, skip duplicates
    const inserts = targetUsers.map((uid) => ({
      voucher_id,
      user_id: uid,
      reason: mode,
      event_id: event_id || null,
    }));

    // Insert one by one to skip duplicates (unique constraint)
    let distributed = 0;
    for (const item of inserts) {
      const { error } = await supabase.from("voucher_distributions").insert(item);
      if (!error) distributed++;
    }

    return NextResponse.json({
      success: true,
      distributed,
      total_target: targetUsers.length,
      skipped: targetUsers.length - distributed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
  }
}
