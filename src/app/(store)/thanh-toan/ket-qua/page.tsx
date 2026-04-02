"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BankTransferInfo from "@/components/store/BankTransferInfo";

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PaymentResult />
    </Suspense>
  );
}

function PaymentResult() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const status = searchParams.get("status");
  const method = searchParams.get("method");
  const amount = searchParams.get("amount");
  const isSuccess = status === "success";
  const isBankTransfer = method === "bank_transfer";

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <Card className="rounded-2xl border-0 shadow-md overflow-hidden animate-fade-in">
        <div className="p-8 text-center">
          {isSuccess ? (
            <>
              <div className="w-20 h-20 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center animate-bounce-in">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-extrabold mb-2">Đặt hàng thành công!</h1>
              <p className="text-gray-500 mb-1">
                Mã đơn hàng: <strong className="font-mono text-green-600">{orderNumber}</strong>
              </p>
              {isBankTransfer ? (
                <p className="text-sm text-blue-600 mb-4">
                  Vui lòng chuyển khoản theo thông tin bên dưới
                </p>
              ) : (
                <p className="text-gray-400 text-sm mb-6">
                  Chúng tôi sẽ liên hệ bạn để xác nhận đơn hàng.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-5 bg-red-100 rounded-full flex items-center justify-center animate-bounce-in">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-extrabold mb-2">Thanh toán thất bại</h1>
              <p className="text-gray-400 text-sm mb-6">
                Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
              </p>
            </>
          )}
        </div>

        {/* Bank Transfer Info */}
        {isSuccess && isBankTransfer && (
          <div className="px-6 pb-6">
            <BankTransferInfo orderNumber={orderNumber || undefined} amount={amount ? Number(amount) : undefined} compact />
          </div>
        )}

        <div className="px-6 pb-6 flex flex-col gap-3">
          {isSuccess && orderNumber && (
            <Link href={`/don-hang/${orderNumber}`}>
              <Button variant="outline" className="w-full rounded-xl h-11">
                Theo dõi đơn hàng
              </Button>
            </Link>
          )}
          <Link href="/san-pham">
            <Button className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-11 font-bold">
              <Sparkles className="w-4 h-4 mr-2" />
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
