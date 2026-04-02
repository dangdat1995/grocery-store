import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

// POST: Check if user reached new spending milestones after order delivery
// Called automatically when order status → delivered
export async function POST(request: NextRequest) {
  if (isDemo) {
    return NextResponse.json({ success: true, awarded: [], message: "Demo mode" });
  }

  try {
    const supabase = await createClient();
    const { user_id, total_spent } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Get current total_spent from profile if not provided
    let spent = total_spent;
    if (!spent) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_spent")
        .eq("id", user_id)
        .single();
      spent = profile?.total_spent || 0;
    }

    if (spent <= 0) {
      return NextResponse.json({ success: true, awarded: [] });
    }

    // Get all active milestones
    const { data: milestones } = await supabase
      .from("spending_milestones")
      .select("*")
      .eq("is_active", true)
      .lte("min_spent", spent)
      .order("min_spent", { ascending: true });

    if (!milestones || milestones.length === 0) {
      return NextResponse.json({ success: true, awarded: [] });
    }

    // Get milestones already awarded to this user
    const { data: awarded } = await supabase
      .from("milestone_awards")
      .select("milestone_id")
      .eq("user_id", user_id);

    const awardedIds = new Set((awarded || []).map((a: any) => a.milestone_id));

    // Find new milestones to award
    const newMilestones = milestones.filter((m: any) => !awardedIds.has(m.id));

    if (newMilestones.length === 0) {
      return NextResponse.json({ success: true, awarded: [] });
    }

    const awardedVouchers: any[] = [];
    const shortId = user_id.slice(0, 6).toUpperCase();

    for (const milestone of newMilestones) {
      const voucherCode = `${milestone.voucher_code_prefix}-${shortId}`;
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Create the voucher
      const { data: voucher, error: voucherError } = await supabase
        .from("vouchers")
        .insert({
          code: voucherCode,
          description: milestone.description || `Thưởng mốc ${milestone.min_spent}: Giảm ${milestone.discount_percent}% tối đa ${milestone.max_discount}đ`,
          discount_type: "percent",
          discount_value: milestone.discount_percent,
          max_discount: milestone.max_discount,
          min_order_amount: 0,
          usage_limit: 1,
          per_user_limit: 1,
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (voucherError) {
        // Voucher code might already exist (duplicate), skip
        console.error("[Milestone] Voucher create error:", voucherError.message);
        continue;
      }

      // Distribute to user
      await supabase.from("voucher_distributions").insert({
        voucher_id: voucher.id,
        user_id,
        reason: `milestone_${milestone.id}`,
      });

      // Record the award
      await supabase.from("milestone_awards").insert({
        user_id,
        milestone_id: milestone.id,
        voucher_id: voucher.id,
      });

      awardedVouchers.push({
        milestone_min_spent: milestone.min_spent,
        voucher_code: voucherCode,
        discount_percent: milestone.discount_percent,
        max_discount: milestone.max_discount,
      });
    }

    return NextResponse.json({
      success: true,
      awarded: awardedVouchers,
      message: awardedVouchers.length > 0
        ? `Đã tặng ${awardedVouchers.length} voucher mốc thưởng`
        : "Không có mốc mới",
    });
  } catch (err: any) {
    console.error("[Milestone] Check error:", err);
    return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
  }
}
