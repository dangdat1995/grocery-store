import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("vouchers")
      .select("id, code, description, discount_type, discount_value, usage_limit, used_count")
      .eq("is_active", true)
      .lte("start_date", now)
      .gte("end_date", now)
      .order("code");

    // Filter vouchers that still have uses left
    const available = (data || []).filter((v: any) => v.used_count < v.usage_limit);
    return NextResponse.json({ vouchers: available });
  } catch {
    return NextResponse.json({ vouchers: [] });
  }
}
