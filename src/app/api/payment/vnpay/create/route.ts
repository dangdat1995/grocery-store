import { NextRequest, NextResponse } from "next/server";
import { createVNPayUrl } from "@/lib/vnpay";

export async function POST(request: NextRequest) {
  try {
    const { order_id, amount, order_number } = await request.json();
    const ipAddr = request.headers.get("x-forwarded-for") || "127.0.0.1";

    const paymentUrl = createVNPayUrl(
      order_id,
      amount,
      `Thanh toan don hang ${order_number}`,
      ipAddr
    );

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    return NextResponse.json({ error: "VNPay error" }, { status: 500 });
  }
}
