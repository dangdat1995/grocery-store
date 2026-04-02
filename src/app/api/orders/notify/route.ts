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

    // Create in-app notification for the customer
    const notifMap: Record<string, { title: string; message: string }> = {
      confirmed: {
        title: "Đơn hàng đã xác nhận",
        message: `Đơn hàng ${order_number} đã được xác nhận và đang chuẩn bị.`,
      },
      preparing: {
        title: "Đang chuẩn bị hàng",
        message: `Đơn hàng ${order_number} đang được chuẩn bị. Vui lòng chờ nhé!`,
      },
      delivering: {
        title: "Đơn hàng đang giao",
        message: `Đơn ${order_number} đã giao cho shipper.${shipping_code ? ` MVĐ: ${shipping_code}` : ""}`,
      },
      delivered: {
        title: "Giao hàng thành công",
        message: `Đơn hàng ${order_number} đã giao thành công. Cảm ơn bạn!`,
      },
      cancelled: {
        title: "Đơn hàng đã huỷ",
        message: `Đơn hàng ${order_number} đã bị huỷ.${note ? ` Lý do: ${note}` : ""}`,
      },
      payment_confirmed: {
        title: "Thanh toán thành công",
        message: `Đã nhận thanh toán cho đơn hàng ${order_number}.`,
      },
    };

    const notif = notifMap[status];
    if (notif) {
      try {
        await supabase.from("notifications").insert({
          user_id: order.user_id,
          type: "order",
          title: notif.title,
          message: notif.message,
          link: `/don-hang/${order_id}`,
          order_id,
        });
      } catch (notifErr) {
        console.error("[Notify] Notification insert error:", notifErr);
      }
    }

    if (emailData) {
      const result = await sendEmail({ to: email, ...emailData });
      return NextResponse.json({ success: true, email_sent: result.success, notified: !!notif });
    }

    return NextResponse.json({ success: true, skipped: "no_template", notified: !!notif });
  } catch (err: any) {
    console.error("[Notify] Error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
