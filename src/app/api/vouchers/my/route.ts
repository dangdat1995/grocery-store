import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const DEMO_VOUCHERS = [
  { code: "LENHANGVANG-A1B2C3", description: "Chào mừng hạng Vàng — Giảm 12% tối đa 100k", discount_type: "percent", discount_value: 12, max_discount: 100000, end_date: "2026-06-01T00:00:00Z", used: false },
  { code: "MOC1TR-A1B2C3", description: "Mốc 1 triệu: Giảm 8% tối đa 50k", discount_type: "percent", discount_value: 8, max_discount: 50000, end_date: "2026-05-01T00:00:00Z", used: false },
  { code: "KHACHVIP-10", description: "Giảm 10% đơn hàng", discount_type: "percent", discount_value: 10, max_discount: null, end_date: "2026-04-30T00:00:00Z", used: false },
  { code: "FREESHIP-A", description: "Miễn phí giao hàng", discount_type: "free_ship", discount_value: 0, max_discount: null, end_date: "2026-04-15T00:00:00Z", used: true },
];

// GET: Fetch current user's vouchers (distributed to them)
export async function GET() {
  if (isDemo) {
    return NextResponse.json({ vouchers: DEMO_VOUCHERS });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ vouchers: [] });
    }

    // Get vouchers distributed to this user
    const { data: distributions } = await supabase
      .from("voucher_distributions")
      .select("*, vouchers(code, description, discount_type, discount_value, max_discount, end_date, is_active)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Check which ones have been used
    const { data: usages } = await supabase
      .from("voucher_usages")
      .select("voucher_id")
      .eq("user_id", user.id);

    const usedVoucherIds = new Set((usages || []).map((u: any) => u.voucher_id));
    const now = new Date();

    const vouchers = (distributions || [])
      .filter((d: any) => d.vouchers)
      .map((d: any) => ({
        ...d.vouchers,
        used: usedVoucherIds.has(d.voucher_id),
        expired: new Date(d.vouchers.end_date) < now,
        reason: d.reason,
      }));

    return NextResponse.json({ vouchers });
  } catch {
    return NextResponse.json({ vouchers: [] });
  }
}
