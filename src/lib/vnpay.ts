import crypto from "crypto";

interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  vnpUrl: string;
  returnUrl: string;
}

function getConfig(): VNPayConfig {
  return {
    tmnCode: process.env.VNPAY_TMN_CODE || "",
    hashSecret: process.env.VNPAY_HASH_SECRET || "",
    vnpUrl: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: process.env.VNPAY_RETURN_URL || "http://localhost:3000/thanh-toan/ket-qua",
  };
}

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

export function createVNPayUrl(orderId: string, amount: number, orderInfo: string, ipAddr: string): string {
  const config = getConfig();
  const date = new Date();
  const createDate = date.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);

  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: String(amount * 100), // VNPay requires amount * 100
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  const sorted = sortObject(params);
  const signData = new URLSearchParams(sorted).toString();
  const hmac = crypto.createHmac("sha512", config.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  sorted["vnp_SecureHash"] = signed;
  return `${config.vnpUrl}?${new URLSearchParams(sorted).toString()}`;
}

export function verifyVNPayReturn(query: Record<string, string>): boolean {
  const config = getConfig();
  const secureHash = query["vnp_SecureHash"];

  const params = { ...query };
  delete params["vnp_SecureHash"];
  delete params["vnp_SecureHashType"];

  const sorted = sortObject(params);
  const signData = new URLSearchParams(sorted).toString();
  const hmac = crypto.createHmac("sha512", config.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return secureHash === signed;
}
