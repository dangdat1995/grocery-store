"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, Package, Truck, MapPin, XCircle, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const CARRIERS: Record<string, string> = {
  store: "Tự giao",
  ghn: "Giao Hàng Nhanh",
  ghtk: "Giao Hàng Tiết Kiệm",
  viettel_post: "Viettel Post",
  jt: "J&T Express",
  grab: "GrabExpress",
  be: "beDelivery",
  ahamove: "Ahamove",
};

const STEPS = [
  { key: "pending", icon: Clock, label: "Chờ xác nhận", desc: "Đơn hàng đang chờ xác nhận" },
  { key: "confirmed", icon: CheckCircle, label: "Đã xác nhận", desc: "Cửa hàng đã xác nhận đơn hàng" },
  { key: "preparing", icon: Package, label: "Đang chuẩn bị", desc: "Đang đóng gói sản phẩm" },
  { key: "delivering", icon: Truck, label: "Đang giao", desc: "Shipper đang trên đường giao" },
  { key: "delivered", icon: MapPin, label: "Đã giao", desc: "Đơn hàng đã được giao thành công" },
];

interface Props {
  status: string;
  shippingCode?: string | null;
  shippingCarrier?: string | null;
  timestamps?: {
    created_at?: string;
    confirmed_at?: string;
    preparing_at?: string;
    shipping_at?: string;
    delivered_at?: string;
  };
}

function formatTime(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderTimeline({ status, shippingCode, shippingCarrier, timestamps }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (status === "cancelled") {
    return (
      <Card className="rounded-2xl border-0 shadow-md p-6 mb-4 bg-red-50 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="font-bold text-red-700">Đơn hàng đã bị huỷ</p>
            <p className="text-sm text-red-500">Liên hệ hotline để biết thêm chi tiết</p>
          </div>
        </div>
      </Card>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  const timestampMap: Record<string, string | undefined> = {
    pending: timestamps?.created_at,
    confirmed: timestamps?.confirmed_at,
    preparing: timestamps?.preparing_at,
    delivering: timestamps?.shipping_at,
    delivered: timestamps?.delivered_at,
  };

  return (
    <Card className="rounded-2xl border-0 shadow-md p-6 mb-4 overflow-hidden animate-fade-in">
      {/* Current status hero */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
          status === "delivered"
            ? "bg-gradient-to-br from-green-500 to-emerald-600"
            : "animated-gradient"
        }`}>
          {(() => {
            const CurrentIcon = STEPS[currentIndex]?.icon || Clock;
            return <CurrentIcon className="w-7 h-7 text-white" />;
          })()}
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-lg">
            {STEPS[currentIndex]?.label || status}
          </p>
          <p className="text-sm text-gray-500">
            {STEPS[currentIndex]?.desc}
          </p>
        </div>
        {status !== "delivered" && (
          <div className="ml-auto">
            <div className="w-3 h-3 bg-green-500 rounded-full track-pulse" />
          </div>
        )}
      </div>

      {/* Shipping info banner */}
      {shippingCode && (status === "delivering" || status === "delivered") && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 flex items-center gap-3">
          <Truck className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-500">
              {shippingCarrier ? CARRIERS[shippingCarrier] || shippingCarrier : "Đơn vị vận chuyển"}
            </p>
            <p className="font-mono font-bold text-blue-700 text-sm">{shippingCode}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shippingCode);
              toast.success("Đã sao chép mã vận đơn");
            }}
            className="text-blue-400 hover:text-blue-600 p-1"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Timeline steps */}
      <div className="relative">
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STEPS.length - 1;
          const time = formatTime(timestampMap[step.key]);

          return (
            <div key={step.key} className="flex gap-4 relative">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-700 ${
                    isCompleted
                      ? isCurrent
                        ? "bg-green-600 shadow-md scale-110"
                        : "bg-green-600"
                      : "bg-gray-200"
                  } ${animated && isCurrent ? "track-pulse" : ""}`}
                  style={{
                    transitionDelay: animated ? `${index * 200}ms` : "0ms",
                  }}
                >
                  <step.icon className={`w-4 h-4 ${isCompleted ? "text-white" : "text-gray-400"}`} />
                </div>
                {!isLast && (
                  <div className="w-0.5 h-10 my-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-200" />
                    <div
                      className={`absolute inset-0 bg-green-500 origin-top transition-transform duration-700 ${
                        animated && index < currentIndex ? "scale-y-100" : "scale-y-0"
                      }`}
                      style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 ${isLast ? "pb-0" : ""} flex-1`}>
                <div className="flex items-center gap-2">
                  <p
                    className={`font-semibold text-sm transition-all duration-500 ${
                      isCompleted ? "text-gray-900" : "text-gray-400"
                    } ${isCurrent ? "text-green-700" : ""}`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    {step.label}
                  </p>
                  {time && isCompleted && (
                    <span className="text-[10px] text-gray-400 font-normal">{time}</span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${isCompleted ? "text-gray-500" : "text-gray-300"}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
