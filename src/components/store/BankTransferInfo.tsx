"use client";

import { useState } from "react";
import { Copy, Check, Landmark, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BANK_INFO, STORE_NAME } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

interface Props {
  orderNumber?: string;
  amount?: number;
  compact?: boolean;
}

export default function BankTransferInfo({ orderNumber, amount, compact }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const transferContent = orderNumber
    ? `${orderNumber} ${STORE_NAME}`
    : STORE_NAME;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`Đã sao chép ${label}`);
    setTimeout(() => setCopied(null), 2000);
  };

  // VietQR URL for generating QR code
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bank_bin}-${BANK_INFO.account_number}-compact.png?amount=${amount || 0}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_INFO.account_name)}`;

  const fields = [
    { label: "Ngân hàng", value: BANK_INFO.bank_name, key: "bank" },
    { label: "Số tài khoản", value: BANK_INFO.account_number, key: "account", copyable: true },
    { label: "Chủ tài khoản", value: BANK_INFO.account_name, key: "name" },
    { label: "Chi nhánh", value: BANK_INFO.branch, key: "branch" },
    ...(amount ? [{ label: "Số tiền", value: formatPrice(amount), key: "amount", copyable: true, rawValue: String(amount) }] : []),
    { label: "Nội dung CK", value: transferContent, key: "content", copyable: true, highlight: true },
  ];

  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
          <Landmark className="w-4 h-4" />
          Thông tin chuyển khoản
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center py-2">
          <div className="bg-white border border-blue-100 rounded-xl p-2 shadow-sm">
            <img
              src={qrUrl}
              alt="QR chuyển khoản"
              className="w-40 h-40 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <p className="text-[11px] text-blue-500 mt-1.5">Quét mã bằng app ngân hàng</p>
        </div>

        {fields.map((f) => (
          <div key={f.key} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{f.label}</span>
            <div className="flex items-center gap-1.5">
              <span className={`font-medium ${f.highlight ? "text-blue-700 bg-blue-100 px-2 py-0.5 rounded" : ""}`}>
                {f.value}
              </span>
              {f.copyable && (
                <button
                  onClick={() => copyText(f.rawValue || f.value, f.label)}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  {copied === f.label ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          <strong>Lưu ý:</strong> Ghi đúng nội dung CK để đơn hàng được xác nhận tự động.
        </p>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Chuyển khoản ngân hàng</h3>
            <p className="text-blue-100 text-xs">Quét mã QR hoặc chuyển khoản thủ công</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 shadow-sm mb-3">
              <img
                src={qrUrl}
                alt="QR chuyển khoản"
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-48 h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400"><svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg><span class="text-xs">Mã QR</span></div>`;
                }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              Quét mã bằng app ngân hàng
            </p>
          </div>

          {/* Bank details */}
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.key} className="flex items-start justify-between gap-2">
                <span className="text-xs text-gray-400 shrink-0 pt-0.5">{f.label}</span>
                <div className="flex items-center gap-1.5 text-right">
                  <span
                    className={`text-sm font-semibold ${
                      f.highlight
                        ? "text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg"
                        : f.key === "amount"
                        ? "text-green-600"
                        : ""
                    } ${f.key === "account" ? "font-mono tracking-wider" : ""}`}
                  >
                    {f.value}
                  </span>
                  {f.copyable && (
                    <button
                      onClick={() => copyText(f.rawValue || f.value, f.label)}
                      className="text-gray-300 hover:text-blue-600 transition-colors shrink-0"
                    >
                      {copied === f.label ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          <strong>Lưu ý:</strong> Vui lòng ghi đúng nội dung chuyển khoản để đơn hàng được xác nhận nhanh chóng.
          Đơn hàng sẽ được xử lý sau khi nhận được thanh toán.
        </div>
      </div>
    </Card>
  );
}
