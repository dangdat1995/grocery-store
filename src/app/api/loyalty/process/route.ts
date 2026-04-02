import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TIER_CONFIG } from "@/lib/constants";
import { getLoyaltySettings } from "@/lib/loyalty-settings";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

// Tier order for comparison
const TIER_ORDER = ["new", "bronze", "silver", "gold", "platinum"];

// Tier welcome voucher config — awarded once per tier upgrade
const TIER_WELCOME_VOUCHERS: Record<string, { percent: number; maxDiscount: number; description: string }> = {
  bronze: { percent: 5, maxDiscount: 25000, description: "Chào mừng hạng Đồng — Giảm 5% tối đa 25k" },
  silver: { percent: 8, maxDiscount: 50000, description: "Chào mừng hạng Bạc — Giảm 8% tối đa 50k" },
  gold: { percent: 12, maxDiscount: 100000, description: "Chào mừng hạng Vàng — Giảm 12% tối đa 100k" },
  platinum: { percent: 20, maxDiscount: 300000, description: "Chào mừng hạng Kim Cương — Giảm 20% tối đa 300k" },
};

/**
 * POST /api/loyalty/process
 *
 * Unified loyalty processing engine — called once when order status → "delivered"
 *
 * Steps:
 * 1. Earn loyalty points (with tier multiplier)
 * 2. Update profile stats (total_orders++, total_spent += order_total)
 * 3. Check & upgrade tier if qualified
 * 4. Award tier welcome voucher on upgrade
 * 5. Check spending milestones → award milestone vouchers
 *
 * Returns summary of everything that happened.
 */
export async function POST(request: NextRequest) {
  if (isDemo) {
    return NextResponse.json({
      success: true,
      summary: {
        points_earned: 410,
        new_balance: 1615,
        tier_upgraded: true,
        old_tier: "silver",
        new_tier: "gold",
        tier_voucher: "LENHANGGOLD-A1B2C3",
        milestones_awarded: [{ voucher_code: "MOC5TR-A1B2C3", discount_percent: 15 }],
      },
    });
  }

  try {
    const supabase = await createClient();
    const { user_id, order_id, order_number, order_total } = await request.json();

    if (!user_id || !order_total) {
      return NextResponse.json({ error: "Missing user_id or order_total" }, { status: 400 });
    }

    // Get current profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("loyalty_tier, points_balance, total_orders, total_spent")
      .eq("id", user_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldTier = profile.loyalty_tier || "new";
    const currentBalance = profile.points_balance || 0;
    const currentOrders = (profile.total_orders || 0) + 1;
    const currentSpent = (profile.total_spent || 0) + order_total;

    const summary: any = {
      points_earned: 0,
      new_balance: currentBalance,
      tier_upgraded: false,
      old_tier: oldTier,
      new_tier: oldTier,
      tier_voucher: null,
      milestones_awarded: [],
    };

    // ─── STEP 1: Earn Points ───
    const loyaltySettings = await getLoyaltySettings();
    const multiplier = loyaltySettings.tier_multipliers[oldTier] || 1;
    const basePoints = Math.floor(order_total / 1000) * loyaltySettings.points_per_1000;
    const earnedPoints = Math.round(basePoints * multiplier);

    // Check duplicate earn
    const { data: existingEarn } = await supabase
      .from("points_transactions")
      .select("id")
      .eq("order_id", order_id)
      .eq("type", "earn")
      .single();

    let newBalance = currentBalance;
    if (!existingEarn && earnedPoints > 0) {
      newBalance = currentBalance + earnedPoints;
      const tierLabels: Record<string, string> = { new: "", bronze: "Đồng", silver: "Bạc", gold: "Vàng", platinum: "Kim Cương" };
      const tierLabel = tierLabels[oldTier] || "";

      await supabase.from("points_transactions").insert({
        user_id,
        type: "earn",
        points: earnedPoints,
        balance_after: newBalance,
        order_id,
        description: `Tích điểm đơn ${order_number}${multiplier > 1 ? ` (x${multiplier} ${tierLabel})` : ""}`,
      });

      summary.points_earned = earnedPoints;
      summary.new_balance = newBalance;
    }

    // ─── STEP 2: Update Profile Stats ───
    const profileUpdates: any = {
      total_orders: currentOrders,
      total_spent: currentSpent,
      points_balance: newBalance,
      last_order_at: new Date().toISOString(),
    };

    // ─── STEP 3: Check Tier Upgrade ───
    const tierKeys = Object.keys(loyaltySettings.tier_config);
    let newTier = oldTier;

    for (let i = tierKeys.length - 1; i >= 0; i--) {
      const tier = tierKeys[i];
      const config = loyaltySettings.tier_config[tier];
      if (currentOrders >= config.minOrders || currentSpent >= config.minSpent) {
        newTier = tier;
        break;
      }
    }

    const oldTierIdx = TIER_ORDER.indexOf(oldTier);
    const newTierIdx = TIER_ORDER.indexOf(newTier);
    const tierUpgraded = newTierIdx > oldTierIdx;

    if (tierUpgraded) {
      profileUpdates.loyalty_tier = newTier;
      summary.tier_upgraded = true;
      summary.new_tier = newTier;

      // ─── STEP 4: Award Tier Welcome Voucher ───
      const tierVoucher = TIER_WELCOME_VOUCHERS[newTier];
      if (tierVoucher) {
        const shortId = user_id.slice(0, 6).toUpperCase();
        const voucherCode = `LENHANG${newTier.toUpperCase()}-${shortId}`;
        const now = new Date();
        const endDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days

        const { data: voucher, error: vError } = await supabase
          .from("vouchers")
          .insert({
            code: voucherCode,
            description: tierVoucher.description,
            discount_type: "percent",
            discount_value: tierVoucher.percent,
            max_discount: tierVoucher.maxDiscount,
            min_order_amount: 0,
            usage_limit: 1,
            per_user_limit: 1,
            start_date: now.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true,
          })
          .select()
          .single();

        if (voucher && !vError) {
          await supabase.from("voucher_distributions").insert({
            voucher_id: voucher.id,
            user_id,
            reason: `tier_upgrade_${newTier}`,
          });
          summary.tier_voucher = voucherCode;

          // Bonus points for tier upgrade
          const bonusMap: Record<string, number> = { bronze: 50, silver: 100, gold: 200, platinum: 500 };
          const bonusPoints = bonusMap[newTier] || 0;
          if (bonusPoints > 0) {
            newBalance += bonusPoints;
            await supabase.from("points_transactions").insert({
              user_id,
              type: "bonus",
              points: bonusPoints,
              balance_after: newBalance,
              order_id: null,
              description: `Thưởng lên hạng ${TIER_CONFIG[newTier as keyof typeof TIER_CONFIG]?.label || newTier}`,
            });
            profileUpdates.points_balance = newBalance;
            summary.new_balance = newBalance;
          }
        }
      }
    }

    // Save profile updates
    await supabase.from("profiles").update(profileUpdates).eq("id", user_id);

    // ─── STEP 5: Check Spending Milestones ───
    const { data: milestones } = await supabase
      .from("spending_milestones")
      .select("*")
      .eq("is_active", true)
      .lte("min_spent", currentSpent)
      .order("min_spent", { ascending: true });

    if (milestones && milestones.length > 0) {
      const { data: awarded } = await supabase
        .from("milestone_awards")
        .select("milestone_id")
        .eq("user_id", user_id);

      const awardedIds = new Set((awarded || []).map((a: any) => a.milestone_id));
      const newMilestones = milestones.filter((m: any) => !awardedIds.has(m.id));
      const shortId = user_id.slice(0, 6).toUpperCase();

      for (const ms of newMilestones) {
        const vCode = `${ms.voucher_code_prefix}-${shortId}`;
        const now = new Date();
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { data: msVoucher, error: msVErr } = await supabase
          .from("vouchers")
          .insert({
            code: vCode,
            description: ms.description || `Mốc ${ms.min_spent}: Giảm ${ms.discount_percent}% tối đa ${ms.max_discount}đ`,
            discount_type: "percent",
            discount_value: ms.discount_percent,
            max_discount: ms.max_discount,
            min_order_amount: 0,
            usage_limit: 1,
            per_user_limit: 1,
            start_date: now.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true,
          })
          .select()
          .single();

        if (msVoucher && !msVErr) {
          await supabase.from("voucher_distributions").insert({
            voucher_id: msVoucher.id,
            user_id,
            reason: `milestone_${ms.id}`,
          });
          await supabase.from("milestone_awards").insert({
            user_id,
            milestone_id: ms.id,
            voucher_id: msVoucher.id,
          });
          summary.milestones_awarded.push({
            milestone_min_spent: ms.min_spent,
            voucher_code: vCode,
            discount_percent: ms.discount_percent,
            max_discount: ms.max_discount,
          });
        }
      }
    }

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    console.error("[Loyalty Process]", err);
    return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
  }
}
