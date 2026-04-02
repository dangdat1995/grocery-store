import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, buildPaymentReceivedEmail } from "@/lib/email";

// SePay webhook - auto confirm bank transfers
// SePay sends POST when bank account receives money
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get("Authorization");
    const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // SePay webhook payload fields:
    // transferAmount, transferType (in/out), content, description,
    // accountNumber, referenceCode, transactionDate
    const {
      transferAmount,
      transferType,
      content,
      description,
      referenceCode,
      transactionDate,
    } = body;

    // Only process incoming transfers
    if (transferType !== "in") {
      return NextResponse.json({ success: true, message: "Ignored outgoing transfer" });
    }

    // Extract order number from transfer content
    // Convention: customer puts "GH-YYYYMMDD-XXX" in transfer description
    const orderMatch = (content || description || "").match(/GH-\d{8}-\d{3,}/i);

    if (!orderMatch) {
      console.log("[SePay] No order number found in:", content || description);
      return NextResponse.json({
        success: true,
        message: "No order number matched",
      });
    }

    const orderNumber = orderMatch[0].toUpperCase();

    const supabase = await createClient();

    // Find order
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, total, payment_status, payment_method, user_id")
      .eq("order_number", orderNumber)
      .single();

    if (!order) {
      console.log("[SePay] Order not found:", orderNumber);
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    // Already paid - idempotent
    if (order.payment_status === "paid") {
      return NextResponse.json({ success: true, message: "Already paid" });
    }

    // Verify amount matches (allow small difference for bank fees)
    const amountDiff = Math.abs(transferAmount - order.total);
    if (amountDiff > 1000) {
      console.log(`[SePay] Amount mismatch: received ${transferAmount}, expected ${order.total}`);
      // Still log it but don't auto-confirm
      await supabase.from("payment_webhooks").insert({
        provider: "sepay",
        order_id: order.id,
        payload: body,
        status: "amount_mismatch",
        amount: transferAmount,
        reference: referenceCode,
      });
      return NextResponse.json({
        success: false,
        message: "Amount mismatch",
      });
    }

    // Update order payment status
    const updates: Record<string, any> = {
      payment_status: "paid",
      updated_at: new Date().toISOString(),
    };

    // Auto-confirm pending orders
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", order.id)
      .single();

    if (currentOrder?.status === "pending") {
      updates.status = "confirmed";
    }

    await supabase.from("orders").update(updates).eq("id", order.id);

    // Log webhook
    await supabase.from("payment_webhooks").insert({
      provider: "sepay",
      order_id: order.id,
      payload: body,
      status: "success",
      amount: transferAmount,
      reference: referenceCode,
    });

    // Send payment confirmation email
    if (order.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", order.user_id)
        .single();

      // Get user email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);
      const email = authUser?.user?.email;

      if (email) {
        const emailData = buildPaymentReceivedEmail(
          order.order_number,
          order.total,
          order.payment_method
        );
        await sendEmail({ to: email, ...emailData });
      }
    }

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      payment_status: "paid",
    });
  } catch (err: any) {
    console.error("[SePay Webhook] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
