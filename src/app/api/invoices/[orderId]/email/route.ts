import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, buildInvoiceEmail } from "@/lib/email";

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { orderId } = await params;

  const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (isDemo) {
    return NextResponse.json({
      success: true,
      message: "Demo: Đã gửi hoá đơn qua email",
    });
  }

  try {
    const supabase = await createClient();

    // Find order by order_number or id
    let order: any = null;
    const { data: byNumber } = await supabase
      .from("orders")
      .select("id, order_number, total, user_id")
      .eq("order_number", orderId)
      .single();

    if (byNumber) {
      order = byNumber;
    } else {
      const { data: byId } = await supabase
        .from("orders")
        .select("id, order_number, total, user_id")
        .eq("id", orderId)
        .single();
      order = byId;
    }

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    if (!order.user_id) {
      return NextResponse.json({ error: "Đơn hàng không có thông tin khách hàng" }, { status: 400 });
    }

    // Get customer email
    const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);
    const email = authUser?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Không tìm thấy email khách hàng" }, { status: 400 });
    }

    // Get or generate invoice number
    let invoiceNumber = `HD-${order.order_number.replace("GH-", "")}`;
    const { data: invoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("order_id", order.id)
      .single();

    if (invoice) {
      invoiceNumber = invoice.invoice_number;
    }

    // Send email
    const emailData = buildInvoiceEmail(order.order_number, invoiceNumber, order.total);
    const result = await sendEmail({ to: email, ...emailData });

    if (!result.success) {
      return NextResponse.json({ error: "Lỗi gửi email: " + result.reason }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã gửi hoá đơn tới ${email}`,
    });
  } catch (err: any) {
    console.error("[Invoice Email] Error:", err);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
