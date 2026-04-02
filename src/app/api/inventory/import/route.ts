import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { product_id, batch_code, quantity, cost_price, manufacture_date, expiry_date, note } = await request.json();

    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Thiếu thông tin sản phẩm hoặc số lượng" }, { status: 400 });
    }

    // Create batch
    const { data: batch, error: batchError } = await supabase
      .from("inventory_batches")
      .insert({
        product_id,
        batch_code: batch_code || `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
        quantity,
        remaining: quantity,
        cost_price: cost_price || 0,
        manufacture_date: manufacture_date || null,
        expiry_date: expiry_date || null,
        note: note || null,
      })
      .select("id")
      .single();

    if (batchError) return NextResponse.json({ error: batchError.message }, { status: 500 });

    // Log transaction
    await supabase.from("inventory_transactions").insert({
      product_id,
      batch_id: batch.id,
      type: "import",
      quantity,
      reason: `Nhập lô ${batch_code || "mới"}`,
      created_by: user.id,
    });

    // Update stock_quantity on product
    const { data: product } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", product_id)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({ stock_quantity: product.stock_quantity + quantity })
        .eq("id", product_id);
    }

    return NextResponse.json({ success: true, batch_id: batch.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi hệ thống" }, { status: 500 });
  }
}
