import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const MOCK_REVIEWS = [
  {
    id: "r1",
    product_id: "1",
    user_id: "u1",
    rating: 5,
    comment: "Rau rất tươi, giao nhanh. Sẽ mua lại!",
    created_at: "2026-03-28T10:00:00Z",
    profile: { full_name: "Nguyễn Văn A" },
  },
  {
    id: "r2",
    product_id: "1",
    user_id: "u2",
    rating: 4,
    comment: "Chất lượng tốt, đóng gói cẩn thận.",
    created_at: "2026-03-25T14:00:00Z",
    profile: { full_name: "Trần Thị B" },
  },
  {
    id: "r3",
    product_id: "1",
    user_id: "u3",
    rating: 5,
    comment: "Giá cả hợp lý, rau ngon lắm!",
    created_at: "2026-03-20T09:00:00Z",
    profile: { full_name: "Lê Văn C" },
  },
];

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("product_id");
  if (!productId) {
    return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
  }

  if (isDemo) {
    const avg = MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length;
    return NextResponse.json({
      reviews: MOCK_REVIEWS,
      average: Math.round(avg * 10) / 10,
      total: MOCK_REVIEWS.length,
    });
  }

  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("product_reviews")
    .select("id, product_id, user_id, rating, comment, created_at, profiles(full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50);

  const mapped = (reviews || []).map((r: any) => ({
    ...r,
    profile: r.profiles,
  }));

  const total = mapped.length;
  const average = total > 0
    ? Math.round((mapped.reduce((s: number, r: any) => s + r.rating, 0) / total) * 10) / 10
    : 0;

  return NextResponse.json({ reviews: mapped, average, total });
}

export async function POST(request: NextRequest) {
  if (isDemo) {
    return NextResponse.json({ success: true, review: { id: "demo", rating: 5, comment: "Demo review" } });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập để đánh giá" }, { status: 401 });
  }

  const body = await request.json();
  const { product_id, rating, comment } = body;

  if (!product_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  // Check if user already reviewed this product
  const { data: existing } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", product_id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Update existing review
    const { data, error } = await supabase
      .from("product_reviews")
      .update({ rating, comment: comment || null, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, review: data, updated: true });
  }

  // Create new review
  const { data, error } = await supabase
    .from("product_reviews")
    .insert({ product_id, user_id: user.id, rating, comment: comment || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, review: data });
}
