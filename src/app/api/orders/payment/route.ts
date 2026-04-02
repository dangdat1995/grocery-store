import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, buildPaymentReceivedEmail } from "@/lib/email";

// PATCH: Xác nhận thanh toán cho đơn hàng
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { order_id, payment_status, note } = await request.json();

    if (!order_id || !payment_status) {
      return NextResponse.json(
        { error: "Thiếu thông tin" },
        { status: 400 }
      );
    }

    if (!["paid", "unpaid", "refunded", "failed"].includes(payment_status)) {
      return NextResponse.json(
        { error: "Trạng thái thanh toán không hợp lệ" },
        { status: 400 }
      );
    }

    // Get current order
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, payment_status, payment_method, user_id, total")
      .eq("id", order_id)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: "Đơn hàng không tồn tại" },
        { status: 404 }
      );
    }

    // Update payment status
    const updates: Record<string, any> = {
      payment_status,
    };

    // Auto-confirm order when payment is confirmed (if still pending)
    if (payment_status === "paid") {
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("status")
        .eq("id", order_id)
        .single();

      if (currentOrder?.status === "pending") {
        updates.status = "confirmed";
      }
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", order_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send payment confirmation email when marking as paid
    if (payment_status === "paid") {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id || "");
        const email = authUser?.user?.email;
        if (email) {
          const emailData = buildPaymentReceivedEmail(
            order.order_number,
            order.total || 0,
            order.payment_method
          );
          await sendEmail({ to: email, ...emailData });
        }
      } catch {
        // Email failure shouldn't block payment confirmation
      }
    }

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      payment_status,
    });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// GET: Lấy danh sách đơn hàng chưa thanh toán
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const filter = request.nextUrl.searchParams.get("filter") || "unpaid";
    const method = request.nextUrl.searchParams.get("method");

    let query = supabase
      .from("orders")
      .select("*, profiles(full_name, phone)")
      .order("created_at", { ascending: false });

    if (filter === "unpaid") {
      query = query.eq("payment_status", "unpaid");
    } else if (filter === "paid") {
      query = query.eq("payment_status", "paid");
    }

    if (method) {
      query = query.eq("payment_method", method);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
