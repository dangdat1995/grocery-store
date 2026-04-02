import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLoyaltySettings } from "@/lib/loyalty-settings";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const MOCK_TRANSACTIONS = [
  { id: "pt1", type: "earn", points: 205, balance_after: 1205, order_id: "1", description: "Tích điểm đơn GH-20260401-001 (x2 Vàng)", created_at: "2026-04-01T10:00:00Z" },
  { id: "pt2", type: "redeem", points: -100, balance_after: 1000, order_id: "o2", description: "Dùng 100 điểm cho đơn GH-20260328-005", created_at: "2026-03-28T14:00:00Z" },
  { id: "pt3", type: "earn", points: 350, balance_after: 1100, order_id: "o2", description: "Tích điểm đơn GH-20260328-005 (x2 Vàng)", created_at: "2026-03-28T14:00:00Z" },
  { id: "pt4", type: "earn", points: 180, balance_after: 750, order_id: "o3", description: "Tích điểm đơn GH-20260325-003 (x2 Vàng)", created_at: "2026-03-25T09:00:00Z" },
  { id: "pt5", type: "bonus", points: 200, balance_after: 570, order_id: null, description: "Thưởng lên hạng Vàng", created_at: "2026-03-20T11:00:00Z" },
  { id: "pt6", type: "earn", points: 370, balance_after: 370, order_id: "o4", description: "Tích điểm đơn GH-20260320-002 (x1.5 Bạc)", created_at: "2026-03-20T11:00:00Z" },
];

// GET: Fetch points balance and transaction history
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");

  const ls = await getLoyaltySettings();

  if (isDemo) {
    return NextResponse.json({
      balance: 1205,
      transactions: MOCK_TRANSACTIONS,
      tier: "gold",
      multiplier: ls.tier_multipliers["gold"],
      points_value: ls.points_value,
    });
  }

  const supabase = await createClient();
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!targetUserId) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  // Get profile for tier info
  const { data: profile } = await supabase
    .from("profiles")
    .select("loyalty_tier, points_balance")
    .eq("id", targetUserId)
    .single();

  const balance = profile?.points_balance || 0;
  const tier = profile?.loyalty_tier || "new";
  const multiplier = ls.tier_multipliers[tier] || 1;

  // Get transaction history
  const { data: transactions } = await supabase
    .from("points_transactions")
    .select("*")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    balance,
    transactions: transactions || [],
    tier,
    multiplier,
    points_value: ls.points_value,
  });
}

// POST: Earn or redeem points
export async function POST(request: NextRequest) {
  if (isDemo) {
    return NextResponse.json({ success: true, balance: 1205 });
  }

  const supabase = await createClient();
  const body = await request.json();
  const { action, order_id, order_number, order_total, user_id, points, description } = body;

  const ls = await getLoyaltySettings();

  if (action === "earn") {
    // Called when order is delivered — earn points
    const targetUserId = user_id;
    if (!targetUserId || !order_total) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Get current profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("loyalty_tier, points_balance")
      .eq("id", targetUserId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tier = profile.loyalty_tier || "new";
    const multiplier = ls.tier_multipliers[tier] || 1;
    const basePoints = Math.floor(order_total / 1000) * ls.points_per_1000;
    const earnedPoints = Math.round(basePoints * multiplier);
    const newBalance = (profile.points_balance || 0) + earnedPoints;

    // Check if already earned for this order
    const { data: existing } = await supabase
      .from("points_transactions")
      .select("id")
      .eq("order_id", order_id)
      .eq("type", "earn")
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: "Already earned", balance: profile.points_balance });
    }

    const tierLabels: Record<string, string> = { new: "", bronze: "Đồng", silver: "Bạc", gold: "Vàng", platinum: "Kim Cương" };
    const tierLabel = tierLabels[tier] || "";
    const desc = `Tích điểm đơn ${order_number || order_id}${multiplier > 1 ? ` (x${multiplier} ${tierLabel})` : ""}`;

    // Insert transaction
    const { error: txError } = await supabase.from("points_transactions").insert({
      user_id: targetUserId,
      type: "earn",
      points: earnedPoints,
      balance_after: newBalance,
      order_id: order_id || null,
      description: desc,
    });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // Update balance
    await supabase
      .from("profiles")
      .update({ points_balance: newBalance })
      .eq("id", targetUserId);

    return NextResponse.json({ success: true, earned: earnedPoints, balance: newBalance, multiplier });
  }

  if (action === "redeem") {
    // Called during checkout — redeem points for discount
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const redeemPoints = points;
    if (!redeemPoints || redeemPoints < ls.min_redeem_points) {
      return NextResponse.json({ error: `Tối thiểu ${ls.min_redeem_points} điểm` }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("points_balance")
      .eq("id", user.id)
      .single();

    const currentBalance = profile?.points_balance || 0;
    if (redeemPoints > currentBalance) {
      return NextResponse.json({ error: "Không đủ điểm" }, { status: 400 });
    }

    // Check max redeem percent
    if (order_total) {
      const maxDiscount = Math.floor(order_total * ls.max_redeem_percent / 100);
      const redeemValue = redeemPoints * ls.points_value;
      if (redeemValue > maxDiscount) {
        const maxPoints = Math.floor(maxDiscount / ls.points_value);
        return NextResponse.json({
          error: `Tối đa dùng ${maxPoints} điểm (${ls.max_redeem_percent}% đơn hàng)`,
          max_points: maxPoints,
        }, { status: 400 });
      }
    }

    const newBalance = currentBalance - redeemPoints;
    const discount = redeemPoints * ls.points_value;

    // Insert transaction
    const { error: txError } = await supabase.from("points_transactions").insert({
      user_id: user.id,
      type: "redeem",
      points: -redeemPoints,
      balance_after: newBalance,
      order_id: order_id || null,
      description: description || `Dùng ${redeemPoints} điểm cho đơn ${order_number || "hàng"}`,
    });

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // Update balance
    await supabase
      .from("profiles")
      .update({ points_balance: newBalance })
      .eq("id", user.id);

    return NextResponse.json({ success: true, redeemed: redeemPoints, discount, balance: newBalance });
  }

  if (action === "adjust") {
    // Admin manually adjusts points
    const targetUserId = user_id;
    if (!targetUserId || !points) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("points_balance")
      .eq("id", targetUserId)
      .single();

    const currentBalance = profile?.points_balance || 0;
    const newBalance = Math.max(0, currentBalance + points);

    await supabase.from("points_transactions").insert({
      user_id: targetUserId,
      type: points > 0 ? "bonus" : "adjust",
      points,
      balance_after: newBalance,
      order_id: null,
      description: description || (points > 0 ? `Thưởng ${points} điểm` : `Điều chỉnh ${points} điểm`),
    });

    await supabase
      .from("profiles")
      .update({ points_balance: newBalance })
      .eq("id", targetUserId);

    return NextResponse.json({ success: true, balance: newBalance });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
