import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "Tạp Hoá Online <noreply@taphoaonline.vn>";

export type EmailTemplate =
  | "order_confirmation"
  | "payment_received"
  | "order_shipping"
  | "order_delivered"
  | "invoice";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  template?: EmailTemplate;
  orderId?: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.log("[Email] Resend not configured, skipping:", subject, "→", to);
    return { success: false, reason: "no_api_key" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Send error:", error);
      return { success: false, reason: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Exception:", err);
    return { success: false, reason: err.message };
  }
}

// ===== Email Templates =====

function baseLayout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#16a34a,#059669);padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">🛒 Tạp Hoá Online</h1>
    <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px;">Tươi ngon mỗi ngày</p>
  </div>
  <!-- Content -->
  <div style="padding:24px;">
    ${content}
  </div>
  <!-- Footer -->
  <div style="background:#f9fafb;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">
      Tạp Hoá Online | Hotline: 0901234567<br/>
      Email này được gửi tự động, vui lòng không trả lời.
    </p>
  </div>
</div>
</body>
</html>`;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number; subtotal: number }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  note?: string;
}

export function buildOrderConfirmationEmail(data: OrderEmailData) {
  const paymentLabels: Record<string, string> = {
    cod: "Thanh toán khi nhận hàng (COD)",
    bank_transfer: "Chuyển khoản ngân hàng",
    vnpay: "VNPay",
    momo: "Ví MoMo",
  };

  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">${item.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;">${formatVND(item.subtotal)}</td>
    </tr>`
    )
    .join("");

  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">✅</div>
      <h2 style="color:#16a34a;margin:8px 0 4px;">Đặt hàng thành công!</h2>
      <p style="color:#6b7280;font-size:14px;margin:0;">Mã đơn: <strong>${data.orderNumber}</strong></p>
    </div>

    <p style="font-size:14px;color:#374151;">Xin chào <strong>${data.customerName}</strong>,</p>
    <p style="font-size:14px;color:#6b7280;">Đơn hàng của bạn đã được tiếp nhận và đang xử lý.</p>

    <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 0;text-align:left;">Sản phẩm</th>
          <th style="padding:8px 0;text-align:center;">SL</th>
          <th style="padding:8px 0;text-align:right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="background:#f9fafb;padding:12px;border-radius:8px;font-size:13px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="color:#6b7280;">Tạm tính:</span>
        <span>${formatVND(data.subtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="color:#6b7280;">Phí giao hàng:</span>
        <span>${data.deliveryFee === 0 ? "Miễn phí" : formatVND(data.deliveryFee)}</span>
      </div>
      ${data.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#ef4444;">Giảm giá:</span><span style="color:#ef4444;">-${formatVND(data.discount)}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #e5e7eb;font-weight:bold;font-size:15px;">
        <span>Tổng cộng:</span>
        <span style="color:#16a34a;">${formatVND(data.total)}</span>
      </div>
    </div>

    <div style="margin-top:16px;font-size:13px;color:#6b7280;">
      <p><strong>📍 Giao đến:</strong> ${data.deliveryAddress}</p>
      <p><strong>💳 Thanh toán:</strong> ${paymentLabels[data.paymentMethod] || data.paymentMethod}</p>
      ${data.note ? `<p><strong>📝 Ghi chú:</strong> ${data.note}</p>` : ""}
    </div>
  `);

  return {
    subject: `✅ Đơn hàng ${data.orderNumber} đã được tiếp nhận`,
    html,
  };
}

export function buildPaymentReceivedEmail(orderNumber: string, total: number, method: string) {
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">💰</div>
      <h2 style="color:#16a34a;margin:8px 0 4px;">Đã xác nhận thanh toán!</h2>
      <p style="color:#6b7280;font-size:14px;margin:0;">Mã đơn: <strong>${orderNumber}</strong></p>
    </div>
    <p style="font-size:14px;color:#374151;">
      Chúng tôi đã nhận được thanh toán <strong style="color:#16a34a;">${formatVND(total)}</strong> cho đơn hàng <strong>${orderNumber}</strong>.
    </p>
    <p style="font-size:14px;color:#6b7280;">Đơn hàng đang được chuẩn bị và sẽ giao sớm nhất có thể.</p>
    <div style="text-align:center;margin-top:20px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/don-hang/${orderNumber}" style="background:#16a34a;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
        Theo dõi đơn hàng
      </a>
    </div>
  `);

  return {
    subject: `💰 Đã nhận thanh toán đơn ${orderNumber}`,
    html,
  };
}

export function buildShippingEmail(orderNumber: string) {
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">🚚</div>
      <h2 style="color:#f59e0b;margin:8px 0 4px;">Đơn hàng đang giao!</h2>
      <p style="color:#6b7280;font-size:14px;margin:0;">Mã đơn: <strong>${orderNumber}</strong></p>
    </div>
    <p style="font-size:14px;color:#374151;">
      Đơn hàng <strong>${orderNumber}</strong> đã được giao cho shipper và đang trên đường đến bạn.
    </p>
    <p style="font-size:14px;color:#6b7280;">Vui lòng giữ điện thoại để shipper liên hệ khi đến nơi.</p>
    <div style="text-align:center;margin-top:20px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/don-hang/${orderNumber}" style="background:#f59e0b;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
        Theo dõi đơn hàng
      </a>
    </div>
  `);

  return { subject: `🚚 Đơn ${orderNumber} đang giao đến bạn`, html };
}

export function buildDeliveredEmail(orderNumber: string) {
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">🎉</div>
      <h2 style="color:#16a34a;margin:8px 0 4px;">Giao hàng thành công!</h2>
      <p style="color:#6b7280;font-size:14px;margin:0;">Mã đơn: <strong>${orderNumber}</strong></p>
    </div>
    <p style="font-size:14px;color:#374151;">
      Đơn hàng <strong>${orderNumber}</strong> đã được giao thành công. Cảm ơn bạn đã mua sắm tại Tạp Hoá Online!
    </p>
    <p style="font-size:14px;color:#6b7280;">Nếu có vấn đề gì, xin liên hệ hotline 0901234567.</p>
  `);

  return { subject: `🎉 Đơn ${orderNumber} giao thành công!`, html };
}

export function buildOrderConfirmedEmail(orderNumber: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">📦</div>
      <h2 style="color:#2563eb;margin:8px 0 4px;">Đơn hàng đã xác nhận!</h2>
      <p style="color:#6b7280;font-size:14px;margin:0;">Mã đơn: <strong>${orderNumber}</strong></p>
    </div>
    <p style="font-size:14px;color:#374151;">
      Đơn hàng <strong>${orderNumber}</strong> đã được xác nhận và đang được chuẩn bị.
    </p>
    <p style="font-size:14px;color:#6b7280;">Chúng tôi sẽ thông báo khi đơn hàng được giao cho shipper.</p>
    <div style="text-align:center;margin-top:20px;">
      <a href="${siteUrl}/don-hang/${orderNumber}" style="background:#2563eb;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
        Theo dõi đơn hàng
      </a>
    </div>
  `);
  return { subject: `📦 Đơn ${orderNumber} đã được xác nhận`, html };
}

export function buildPreparingEmail(orderNumber: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">🧺</div>
      <h2 style="color:#7c3aed;margin:8px 0 4px;">Đang chuẩn bị hàng!</h2>
      <p style="color:#6b7280;font-size:14px;margin:0;">Mã đơn: <strong>${orderNumber}</strong></p>
    </div>
    <p style="font-size:14px;color:#374151;">
      Đơn hàng <strong>${orderNumber}</strong> đang được đóng gói và chuẩn bị giao.
    </p>
    <div style="text-align:center;margin-top:20px;">
      <a href="${siteUrl}/don-hang/${orderNumber}" style="background:#7c3aed;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
        Theo dõi đơn hàng
      </a>
    </div>
  `);
  return { subject: `🧺 Đơn ${orderNumber} đang được chuẩn bị`, html };
}

export function buildCancelledEmail(orderNumber: string, reason?: string) {
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">❌</div>
      <h2 style="color:#dc2626;margin:8px 0 4px;">Đơn hàng đã huỷ</h2>
      <p style="color:#6b7280;font-size:14px;margin:0;">Mã đơn: <strong>${orderNumber}</strong></p>
    </div>
    <p style="font-size:14px;color:#374151;">
      Đơn hàng <strong>${orderNumber}</strong> đã bị huỷ.${reason ? ` Lý do: ${reason}` : ""}
    </p>
    <p style="font-size:14px;color:#6b7280;">
      Nếu bạn đã thanh toán, số tiền sẽ được hoàn lại trong 3-5 ngày làm việc.
      Liên hệ hotline 0901234567 nếu cần hỗ trợ.
    </p>
  `);
  return { subject: `❌ Đơn ${orderNumber} đã bị huỷ`, html };
}

export function buildInvoiceEmail(orderNumber: string, invoiceNumber: string, total: number) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">🧾</div>
      <h2 style="color:#16a34a;margin:8px 0 4px;">Hoá đơn của bạn</h2>
      <p style="color:#6b7280;font-size:14px;margin:0;">Mã đơn: <strong>${orderNumber}</strong></p>
    </div>
    <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0;">
      <table style="width:100%;font-size:14px;">
        <tr><td style="color:#6b7280;padding:4px 0;">Số hoá đơn:</td><td style="text-align:right;font-weight:bold;color:#16a34a;">${invoiceNumber}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0;">Mã đơn hàng:</td><td style="text-align:right;">${orderNumber}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0;">Tổng thanh toán:</td><td style="text-align:right;font-weight:bold;color:#16a34a;">${formatVND(total)}</td></tr>
      </table>
    </div>
    <p style="font-size:14px;color:#6b7280;">
      Bạn có thể xem và tải hoá đơn chi tiết tại trang theo dõi đơn hàng.
    </p>
    <div style="text-align:center;margin-top:20px;">
      <a href="${siteUrl}/don-hang/${orderNumber}" style="background:#16a34a;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
        Xem hoá đơn
      </a>
    </div>
  `);
  return { subject: `🧾 Hoá đơn ${invoiceNumber} - Đơn ${orderNumber}`, html };
}
