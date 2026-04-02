import { NextRequest, NextResponse } from "next/server";
import { createMoMoPayment } from "@/lib/momo";

export async function POST(request: NextRequest) {
  try {
    const { order_id, amount, order_number } = await request.json();

    const result = await createMoMoPayment(
      order_id,
      amount,
      `Thanh toan don hang ${order_number}`
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ paymentUrl: result.paymentUrl });
  } catch (error) {
    return NextResponse.json({ error: "MoMo error" }, { status: 500 });
  }
}
