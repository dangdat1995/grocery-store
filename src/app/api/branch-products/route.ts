import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Lấy branch_products — ?branch_id=xxx &include=products (kèm danh sách products)
export async function GET(request: NextRequest) {
  try {
    const branchId = request.nextUrl.searchParams.get("branch_id");
    const include = request.nextUrl.searchParams.get("include");
    const supabase = await createClient();

    let query = supabase
      .from("branch_products")
      .select("branch_id, product_id, is_available, stock_quantity, price_override");

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const result: any = { branch_products: data || [] };

    // Optionally include full product list (for admin setup page)
    if (include === "products") {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, price, unit, stock_quantity, is_active, category:categories(id, name)")
        .eq("is_active", true)
        .order("name");
      result.products = (products || []).map((p: any) => ({
        ...p,
        category_name: p.category?.name || "Khác",
      }));
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// POST: Lưu (upsert) sản phẩm cho 1 chi nhánh
// Body: { branch_id, items: [{ product_id, is_available, stock_quantity, price_override }] }
export async function POST(request: NextRequest) {
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

    const { branch_id, items } = await request.json();
    if (!branch_id || !Array.isArray(items)) {
      return NextResponse.json({ error: "branch_id và items là bắt buộc" }, { status: 400 });
    }

    // Delete existing records for this branch then insert new ones
    const { error: delError } = await supabase
      .from("branch_products")
      .delete()
      .eq("branch_id", branch_id);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    // Only insert available items (or items with price override)
    const rows = items.map((item: any) => ({
      branch_id,
      product_id: item.product_id,
      is_available: item.is_available ?? true,
      stock_quantity: item.stock_quantity ?? 0,
      price_override: item.price_override || null,
    }));

    if (rows.length > 0) {
      const { error: insError } = await supabase
        .from("branch_products")
        .insert(rows);

      if (insError) {
        return NextResponse.json({ error: insError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
