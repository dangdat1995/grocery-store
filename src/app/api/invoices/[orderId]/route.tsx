import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/invoice-pdf";
import { VAT_RATE, STORE_NAME, STORE_PHONE, STORE_EMAIL } from "@/lib/constants";
import React from "react";

interface Props {
  params: Promise<{ orderId: string }>;
}

// GET: Generate PDF invoice for an order
export async function GET(request: NextRequest, { params }: Props) {
  const { orderId } = await params;
  const format = request.nextUrl.searchParams.get("format") || "pdf";

  const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  let order: any = null;
  let items: any[] = [];
  let buyerName = "Khách hàng";
  let buyerPhone = "";
  let buyerAddress = "";

  let voucherCode = "";
  let voucherDiscount = 0;
  let voucherDescription = "";

  let comboSavings = 0;
  let pointsUsed = 0;
  let pointsDiscount = 0;
  let pointsEarned = 0;
  let gifts: { name: string; description: string; quantity: number }[] = [];

  if (isDemo) {
    // Demo data
    order = {
      id: "demo-1",
      order_number: "GH-20260401-001",
      status: "delivered",
      payment_method: "cod",
      payment_status: "paid",
      subtotal: 186000,
      delivery_fee: 20000,
      discount: 30000,
      voucher_discount: 15000,
      voucher_id: "v1",
      voucher_code: "GIAM15K",
      combo_savings: 5000,
      points_used: 100,
      points_discount: 10000,
      points_earned: 19,
      gifts: [
        { name: "Tặng túi nilon", description: "Tặng 1 túi nilon thân thiện môi trường", quantity: 1 },
        { name: "Quà đơn 300k", description: "Tặng 1 bịch khăn giấy cao cấp", quantity: 1 },
      ],
      total: 161000,
      delivery_address: "123 Nguyễn Huệ, Q.1, HCM",
      created_at: "2026-04-01T14:30:00Z",
    };
    items = [
      { product_name: "Gạo ST25", product_price: 135000, quantity: 1, subtotal: 135000 },
      { product_name: "Rau muống", product_price: 8000, quantity: 2, subtotal: 16000 },
      { product_name: "Cà chua", product_price: 25000, quantity: 1, subtotal: 25000 },
      { product_name: "Trà xanh 0 độ", product_price: 10000, quantity: 1, subtotal: 10000 },
    ];
    buyerName = "Nguyễn Văn Demo";
    buyerPhone = "0901234567";
    buyerAddress = "123 Nguyễn Huệ, Q.1, HCM";
    voucherCode = "GIAM15K";
    voucherDiscount = 15000;
    voucherDescription = "Giảm 15.000đ";
    comboSavings = 5000;
    pointsUsed = 100;
    pointsDiscount = 10000;
    pointsEarned = 19;
    gifts = [
      { name: "Tặng túi nilon", description: "Tặng 1 túi nilon thân thiện môi trường", quantity: 1 },
      { name: "Quà đơn 300k", description: "Tặng 1 bịch khăn giấy cao cấp", quantity: 1 },
    ];
  } else {
    const supabase = await createClient();

    // Try by order_number first, then by id
    let { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("order_number", orderId)
      .single();

    if (!data) {
      const result = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", orderId)
        .single();
      data = result.data;
    }

    if (!data) {
      return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    order = data;
    items = data.items || [];

    // Get buyer info
    if (order.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", order.user_id)
        .single();
      if (profile) {
        buyerName = profile.full_name || "Khách hàng";
        buyerPhone = profile.phone || "";
      }
    }
    buyerAddress = order.delivery_address || "";

    // Get voucher info if order used a voucher
    voucherDiscount = order.voucher_discount || 0;
    voucherCode = order.voucher_code || "";
    if (!voucherCode && order.voucher_id) {
      const { data: voucher } = await supabase
        .from("vouchers")
        .select("code, description")
        .eq("id", order.voucher_id)
        .single();
      if (voucher) {
        voucherCode = voucher.code;
        voucherDescription = voucher.description || "";
      }
    }

    // Points & combo & gifts from order
    comboSavings = order.combo_savings || 0;
    pointsUsed = order.points_used || 0;
    pointsDiscount = order.points_discount || 0;
    pointsEarned = order.points_earned || 0;

    // Parse gifts from order
    if (order.gifts && Array.isArray(order.gifts)) {
      gifts = order.gifts.map((g: any) => ({
        name: g.name || "",
        description: g.gift_description || g.description || "",
        quantity: g.gift_quantity || g.quantity || 1,
      }));
    }
  }

  const taxAmount = Math.round(order.subtotal * VAT_RATE);
  const invoiceNumber = `HD-${order.order_number?.replace("GH-", "") || orderId.slice(0, 8)}`;
  const now = new Date().toISOString();

  const invoiceData = {
    invoiceNumber,
    orderNumber: order.order_number || orderId,
    orderDate: order.created_at,
    issuedAt: now,
    storeName: STORE_NAME,
    storePhone: STORE_PHONE,
    storeEmail: STORE_EMAIL,
    storeAddress: "TP. Hồ Chí Minh",
    buyerName,
    buyerPhone,
    buyerAddress,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    items: items.map((item: any) => ({
      name: item.product_name,
      quantity: item.quantity,
      price: item.product_price,
      subtotal: item.subtotal,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    discount: order.discount || 0,
    voucherCode,
    voucherDiscount,
    voucherDescription,
    comboSavings,
    pointsUsed,
    pointsDiscount,
    pointsEarned,
    gifts,
    taxRate: VAT_RATE,
    taxAmount,
    total: order.total + taxAmount,
    note: order.note,
  };

  // Return JSON data for print mode
  if (format === "json") {
    return NextResponse.json({ invoice: invoiceData });
  }

  // Return HTML for thermal printer
  if (format === "thermal") {
    const thermalHtml = buildThermalHTML(invoiceData);
    return new NextResponse(thermalHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  // Generate PDF
  try {
    const buffer = await renderToBuffer(
      React.createElement(InvoicePDF, { data: invoiceData }) as any
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoiceNumber}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("[Invoice PDF] Error:", err);
    return NextResponse.json({ error: "Lỗi tạo PDF" }, { status: 500 });
  }
}

// Thermal printer HTML (80mm receipt format)
function buildThermalHTML(data: any) {
  const fmtVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

  const itemRows = data.items
    .map(
      (item: any) => `
    <tr>
      <td style="text-align:left">${item.name}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${fmtVND(item.subtotal)}</td>
    </tr>`
    )
    .join("");

  const payLabels: Record<string, string> = {
    cod: "COD", vnpay: "VNPay", momo: "MoMo", bank_transfer: "Chuyển khoản",
  };
  const payStatusLabels: Record<string, string> = {
    paid: "Đã TT", unpaid: "Chưa TT", refunded: "Hoàn tiền", failed: "Lỗi TT",
  };

  const fmtDT = (d: string) => new Date(d).toLocaleString("vi-VN");

  // Build promotions rows
  const promoRows: string[] = [];
  if (data.voucherDiscount > 0) {
    promoRows.push(`<tr><td class="red">Voucher: ${data.voucherCode || "Mã KM"}</td><td style="text-align:right" class="red">-${fmtVND(data.voucherDiscount)}</td></tr>`);
  }
  if (data.comboSavings > 0) {
    promoRows.push(`<tr><td class="red">Combo tiết kiệm:</td><td style="text-align:right" class="red">-${fmtVND(data.comboSavings)}</td></tr>`);
  }
  if (data.pointsDiscount > 0) {
    promoRows.push(`<tr><td class="red">Dùng ${data.pointsUsed} điểm:</td><td style="text-align:right" class="red">-${fmtVND(data.pointsDiscount)}</td></tr>`);
  }
  if (promoRows.length === 0 && data.discount > 0) {
    promoRows.push(`<tr><td class="red">Giảm giá:</td><td style="text-align:right" class="red">-${fmtVND(data.discount)}</td></tr>`);
  }

  // Build gifts section
  const giftLines = (data.gifts || []).map((g: any) =>
    `<div style="font-size:10px;">🎁 ${g.description}${g.quantity > 1 ? ` (x${g.quantity})` : ""}</div>`
  ).join("");

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
  @page { size: 80mm auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: monospace; font-size: 12px; width: 80mm; padding: 4mm; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .line { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; font-size: 11px; }
  .total { font-size: 14px; font-weight: bold; }
  .red { color: #dc2626; }
  .green { color: #16a34a; }
  .promo { background: #fef2f2; padding: 3px 0; }
  @media print { body { width: 80mm; } }
</style>
</head><body>
<div class="center bold" style="font-size:16px;">${data.storeName}</div>
<div class="center" style="font-size:10px;margin-top:2px;">${data.storeAddress}</div>
<div class="center" style="font-size:10px;">ĐT: ${data.storePhone}</div>
${data.storeEmail ? `<div class="center" style="font-size:10px;">Email: ${data.storeEmail}</div>` : ""}
<div class="line"></div>
<div class="center bold" style="font-size:14px;">HOÁ ĐƠN BÁN HÀNG</div>
<div class="center" style="font-size:10px;">Số: ${data.invoiceNumber}</div>
<div class="center" style="font-size:10px;">ĐH: ${data.orderNumber}</div>
<div style="font-size:10px;">Ngày đặt: ${fmtDT(data.orderDate)}</div>
<div style="font-size:10px;">Ngày xuất HĐ: ${fmtDT(data.issuedAt)}</div>
<div class="line"></div>
<div style="font-size:10px;font-style:italic;">Kính gửi: ${data.buyerName}</div>
<div style="font-size:9px;color:#666;margin-bottom:4px;">Cảm ơn quý khách đã mua hàng!</div>
<div style="font-size:11px;">KH: ${data.buyerName}</div>
${data.buyerPhone ? `<div style="font-size:11px;">ĐT: ${data.buyerPhone}</div>` : ""}
${data.paymentMethod ? `<div style="font-size:11px;">TT: ${payLabels[data.paymentMethod] || data.paymentMethod} - ${payStatusLabels[data.paymentStatus] || data.paymentStatus}</div>` : ""}
<div class="line"></div>
<table>
<tr style="font-weight:bold;border-bottom:1px solid #000;">
  <td>Sản phẩm</td><td style="text-align:center">SL</td><td style="text-align:right">T.Tiền</td>
</tr>
${itemRows}
</table>
<div class="line"></div>
<table>
<tr><td>Tạm tính (${data.items.length} SP):</td><td style="text-align:right">${fmtVND(data.subtotal)}</td></tr>
<tr><td>Phí giao:</td><td style="text-align:right">${data.deliveryFee === 0 ? "Miễn phí" : fmtVND(data.deliveryFee)}</td></tr>
${promoRows.length > 0 ? promoRows.join("\n") : ""}
${data.taxAmount > 0 ? `<tr><td>VAT (${data.taxRate * 100}%):</td><td style="text-align:right">${fmtVND(data.taxAmount)}</td></tr>` : ""}
</table>
<div class="line"></div>
<table><tr class="total"><td>TỔNG CỘNG:</td><td style="text-align:right">${fmtVND(data.total)}</td></tr></table>
${data.pointsEarned > 0 ? `<div style="font-size:10px;margin-top:4px;" class="green">⭐ Tích luỹ: +${data.pointsEarned} điểm</div>` : ""}
${giftLines ? `<div class="line"></div><div class="bold" style="font-size:11px;">Quà tặng kèm:</div>${giftLines}` : ""}
<div class="line"></div>
<div class="center" style="font-size:10px;margin-top:4px;">Cảm ơn Quý khách đã mua hàng!</div>
<div class="center" style="font-size:9px;color:#666;">Hẹn gặp lại Quý khách!</div>
<div class="center" style="font-size:9px;color:#999;margin-top:2px;">--- ${data.storeName} ---</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
}
