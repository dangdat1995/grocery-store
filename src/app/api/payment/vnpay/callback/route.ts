import { NextRequest, NextResponse } from "next/server";
import { verifyVNPayReturn } from "@/lib/vnpay";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());

  const isValid = verifyVNPayReturn(params);
  const responseCode = params["vnp_ResponseCode"];
  const orderId = params["vnp_TxnRef"];

  if (isValid && responseCode === "00") {
    // Payment success - update order
    const supabase = await createClient();
    await supabase
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", orderId);

    const { data: order } = await supabase
      .from("orders")
      .select("order_number")
      .eq("id", orderId)
      .single();

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/thanh-toan/ket-qua?order=${order?.order_number}&status=success`
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/thanh-toan/ket-qua?status=failed`
  );
}
