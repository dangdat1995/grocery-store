import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendEmail,
  buildOrderConfirmedEmail,
  buildPreparingEmail,
  buildShippingEmail,
  buildDeliveredEmail,
  buildCancelledEmail,
  buildPaymentReceivedEmail,
} from "@/lib/email";

// POST: Send notification email when order status changes
export async function POST(request: NextRequest) {
  try {
    const { order_id, order_number, status, shipping_code, carrier, note } =
      await request.json();
    if (!order_id || !status) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get customer email + order info
    const { data: order } = await supabase
      .from("orders")
      .select("user_id, total, payment_method, payment_status")
      .eq("id", order_id)
      .single();

    if (!order?.user_id) {
      return NextResponse.json({ success: true, skipped: "no_user" });
    }

    const { data: authUser } = await supabase.auth.admin.getUserById(
      order.user_id
    );
    const email = authUser?.user?.email;
    if (!email) {
      return NextResponse.json({ success: true, skipped: "no_email" });
    }

    let emailData: { subject: string; html: string } | null = null;

    switch (status) {
      case "confirmed":
        emailData = buildOrderConfirmedEmail(order_number);
        break;
      case "preparing":
        emailData = buildPreparingEmail(order_number);
        break;
      case "delivering":
        emailData = buildShippingEmail(order_number);
        if (shipping_code) {
          emailData.subject = `🚚 Đơn ${order_number} đang giao - MVĐ: ${shipping_code}`;
        }
        break;
      case "delivered":
        emailData = buildDeliveredEmail(order_number);
        break;
      case "cancelled":
        emailData = buildCancelledEmail(order_number, note);
        break;
      case "payment_confirmed":
        emailData = buildPaymentReceivedEmail(
          order_number,
          order.total,
          order.payment_method
        );
        break;
    }

    if (emailData) {
      const result = await sendEmail({ to: email, ...emailData });
      return NextResponse.json({ success: true, email_sent: result.success });
    }

    return NextResponse.json({ success: true, skipped: "no_template" });
  } catch (err: any) {
    console.error("[Notify] Error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
