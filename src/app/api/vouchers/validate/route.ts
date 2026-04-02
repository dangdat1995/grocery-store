import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: Validate and calculate voucher discount
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Thiếu mã voucher" }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Find voucher by code
    const { data: voucher } = await supabase
      .from("vouchers")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .lte("start_date", now)
      .gte("end_date", now)
      .single();

    if (!voucher) {
      return NextResponse.json({ error: "Mã voucher không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    // Check usage limit
    if (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) {
      return NextResponse.json({ error: "Mã voucher đã hết lượt sử dụng" }, { status: 400 });
    }

    // Check min order amount
    if (subtotal < voucher.min_order_amount) {
      return NextResponse.json({
        error: `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN").format(voucher.min_order_amount)}đ để sử dụng mã này`,
      }, { status: 400 });
    }

    // Check per-user limit
    const { data: { user } } = await supabase.auth.getUser();
    if (user && voucher.per_user_limit > 0) {
      const { count } = await supabase
        .from("voucher_usages")
        .select("id", { count: "exact", head: true })
        .eq("voucher_id", voucher.id)
        .eq("user_id", user.id);
      if ((count || 0) >= voucher.per_user_limit) {
        return NextResponse.json({ error: "Bạn đã sử dụng hết lượt cho mã này" }, { status: 400 });
      }
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discount_type === "percent") {
      discount = Math.round(subtotal * voucher.discount_value / 100);
      if (voucher.max_discount && discount > voucher.max_discount) {
        discount = voucher.max_discount;
      }
    } else if (voucher.discount_type === "fixed") {
      discount = voucher.discount_value;
    } else if (voucher.discount_type === "free_ship") {
      // Will be handled at order level
      discount = 0;
    }

    return NextResponse.json({
      valid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        description: voucher.description,
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        max_discount: voucher.max_discount,
      },
      discount,
      free_ship: voucher.discount_type === "free_ship",
    });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
