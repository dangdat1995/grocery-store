import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VAT_RATE } from "@/lib/constants";

// POST: Tạo hoá đơn từ đơn hàng
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { order_id, buyer_tax_code, note } = await request.json();

    // Get order
    const { data: order } = await supabase
      .from("orders")
      .select("*, profiles(full_name, phone), items:order_items(*)")
      .eq("id", order_id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    // Check if invoice already exists
    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .eq("order_id", order_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Đơn hàng đã có hoá đơn" }, { status: 400 });
    }

    // Generate invoice number
    const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number");

    const taxAmount = Math.round(order.subtotal * VAT_RATE);

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber || `HD-${Date.now()}`,
        order_id,
        buyer_name: order.profiles?.full_name || "Khách hàng",
        buyer_phone: order.profiles?.phone,
        buyer_address: order.delivery_address,
        buyer_tax_code: buyer_tax_code || null,
        subtotal: order.subtotal,
        delivery_fee: order.delivery_fee,
        discount: order.discount + (order.voucher_discount || 0),
        tax_amount: taxAmount,
        total: order.total,
        note: note || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// GET: Lấy hoá đơn theo order_id
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const orderId = request.nextUrl.searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const { data: invoice } = await supabase
      .from("invoices")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: "Chưa có hoá đơn" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
