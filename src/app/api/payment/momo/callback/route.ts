import { NextRequest, NextResponse } from "next/server";
import { verifyMoMoSignature } from "@/lib/momo";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!verifyMoMoSignature(data)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();

    if (data.resultCode === 0) {
      // Payment success
      await supabase
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", data.orderId);
    } else {
      // Payment failed
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", data.orderId);
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    return NextResponse.json({ error: "Callback error" }, { status: 500 });
  }
}
