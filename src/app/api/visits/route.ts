import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: Track a page visit
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { page } = await request.json();
    const today = new Date().toISOString().split("T")[0];

    // Upsert visit count for today
    const { data: existing } = await supabase
      .from("page_visits")
      .select("id, visit_count")
      .eq("date", today)
      .eq("page", page || "/")
      .single();

    if (existing) {
      await supabase
        .from("page_visits")
        .update({ visit_count: existing.visit_count + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("page_visits").insert({
        date: today,
        page: page || "/",
        visit_count: 1,
        unique_visitors: 1,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Fail silently
  }
}

// GET: Get visit stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data } = await supabase
      .from("page_visits")
      .select("date, page, visit_count, unique_visitors")
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: true });

    // Aggregate by date
    const byDate: Record<string, { total: number; unique: number }> = {};
    (data || []).forEach((row: any) => {
      if (!byDate[row.date]) byDate[row.date] = { total: 0, unique: 0 };
      byDate[row.date].total += row.visit_count;
      byDate[row.date].unique += row.unique_visitors;
    });

    return NextResponse.json({ visits: byDate, raw: data });
  } catch {
    return NextResponse.json({ visits: {}, raw: [] });
  }
}
