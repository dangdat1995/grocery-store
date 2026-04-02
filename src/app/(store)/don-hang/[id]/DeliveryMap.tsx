"use client";

import { useState, useEffect } from "react";
import { MapPin, Store, Navigation, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DeliveryMapProps {
  storeLat: number;
  storeLng: number;
  customerLat: number | null;
  customerLng: number | null;
  deliveryAddress: string;
  distanceKm: number | null;
  status: string;
}

export default function DeliveryMap({
  storeLat,
  storeLng,
  customerLat,
  customerLng,
  deliveryAddress,
  distanceKm,
  status,
}: DeliveryMapProps) {
  const [progress, setProgress] = useState(0);

  // Animate progress based on status
  useEffect(() => {
    const statusProgress: Record<string, number> = {
      pending: 0,
      confirmed: 15,
      preparing: 30,
      delivering: 70,
      delivered: 100,
    };
    const timer = setTimeout(() => {
      setProgress(statusProgress[status] || 0);
    }, 500);
    return () => clearTimeout(timer);
  }, [status]);

  const hasCustomerLocation = customerLat && customerLng;

  // Build OpenStreetMap embed URL
  let mapUrl = "";
  if (hasCustomerLocation) {
    const minLat = Math.min(storeLat, customerLat!) - 0.005;
    const maxLat = Math.max(storeLat, customerLat!) + 0.005;
    const minLng = Math.min(storeLng, customerLng!) - 0.005;
    const maxLng = Math.max(storeLng, customerLng!) + 0.005;
    mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${customerLat}%2C${customerLng}`;
  } else {
    mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${storeLng - 0.02}%2C${storeLat - 0.015}%2C${storeLng + 0.02}%2C${storeLat + 0.015}&layer=mapnik&marker=${storeLat}%2C${storeLng}`;
  }

  return (
    <Card className="rounded-2xl border-0 shadow-md overflow-hidden mb-4 animate-fade-in-up">
      {/* Map */}
      <div className="relative">
        <iframe
          src={mapUrl}
          className="w-full h-48 md:h-56 border-0"
          loading="lazy"
        />

        {/* Delivery progress overlay */}
        {status === "delivering" && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse-soft">
                  <Truck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-orange-600">Shipper đang giao hàng</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Cửa hàng</p>
            <p className="text-sm font-medium truncate">Tạp Hoá Online</p>
          </div>
        </div>

        {/* Progress line */}
        <div className="ml-4 border-l-2 border-dashed border-gray-200 h-6 relative">
          {distanceKm && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-white px-1">
              {distanceKm}km
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Giao đến</p>
            <p className="text-sm font-medium truncate">{deliveryAddress}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
