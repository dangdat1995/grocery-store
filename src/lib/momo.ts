import crypto from "crypto";

interface MoMoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  apiUrl: string;
  returnUrl: string;
  notifyUrl: string;
}

function getConfig(): MoMoConfig {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    partnerCode: process.env.MOMO_PARTNER_CODE || "",
    accessKey: process.env.MOMO_ACCESS_KEY || "",
    secretKey: process.env.MOMO_SECRET_KEY || "",
    apiUrl: process.env.MOMO_API_URL || "https://test-payment.momo.vn/v2/gateway/api",
    returnUrl: `${baseUrl}/thanh-toan/ket-qua`,
    notifyUrl: `${baseUrl}/api/payment/momo/callback`,
  };
}

export async function createMoMoPayment(
  orderId: string,
  amount: number,
  orderInfo: string
): Promise<{ paymentUrl?: string; error?: string }> {
  const config = getConfig();
  const requestId = `${orderId}_${Date.now()}`;

  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `amount=${amount}`,
    `extraData=`,
    `ipnUrl=${config.notifyUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${config.partnerCode}`,
    `redirectUrl=${config.returnUrl}`,
    `requestId=${requestId}`,
    `requestType=payWithMethod`,
  ].join("&");

  const signature = crypto
    .createHmac("sha256", config.secretKey)
    .update(rawSignature)
    .digest("hex");

  const body = {
    partnerCode: config.partnerCode,
    partnerName: "Tạp Hoá Online",
    storeId: config.partnerCode,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: config.returnUrl,
    ipnUrl: config.notifyUrl,
    lang: "vi",
    requestType: "payWithMethod",
    autoCapture: true,
    extraData: "",
    signature,
  };

  try {
    const res = await fetch(`${config.apiUrl}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.resultCode === 0) {
      return { paymentUrl: data.payUrl };
    }

    return { error: data.message || "MoMo payment failed" };
  } catch (err) {
    return { error: "Cannot connect to MoMo" };
  }
}

export function verifyMoMoSignature(
  data: Record<string, any>
): boolean {
  const config = getConfig();
  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `amount=${data.amount}`,
    `extraData=${data.extraData}`,
    `message=${data.message}`,
    `orderId=${data.orderId}`,
    `orderInfo=${data.orderInfo}`,
    `orderType=${data.orderType}`,
    `partnerCode=${data.partnerCode}`,
    `payType=${data.payType}`,
    `requestId=${data.requestId}`,
    `responseTime=${data.responseTime}`,
    `resultCode=${data.resultCode}`,
    `transId=${data.transId}`,
  ].join("&");

  const signature = crypto
    .createHmac("sha256", config.secretKey)
    .update(rawSignature)
    .digest("hex");

  return signature === data.signature;
}
