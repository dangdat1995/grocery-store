"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Building2,
  Route,
  Truck,
  Navigation,
  ExternalLink,
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  phone: string | null;
  address: string;
  district: string | null;
  city: string;
  latitude: number;
  longitude: number;
  delivery_radius_km: number;
  opening_time: string;
  closing_time: string;
  is_main: boolean;
}

const BRANCH_COLORS = [
  "from-amber-500 to-orange-500",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-teal-500 to-cyan-600",
];

export default function BranchPicker({ branches }: { branches: Branch[] }) {
  if (!branches || branches.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">Chọn chi nhánh</h3>
              <p className="text-gray-400 text-xs">Sản phẩm có thể khác nhau theo từng chi nhánh</p>
            </div>
          </div>
          <Link href="/chi-nhanh" className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1">
            Bản đồ <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {branches.map((branch, i) => {
            const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
            const mapsUrl = `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;

            return (
              <div
                key={branch.id}
                className="rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${color} px-4 py-2.5 flex items-center gap-2`}>
                  {branch.is_main ? (
                    <Star className="w-4 h-4 text-white/90" />
                  ) : (
                    <Building2 className="w-4 h-4 text-white/90" />
                  )}
                  <span className="font-bold text-white text-sm truncate">{branch.name}</span>
                  {branch.is_main && (
                    <span className="text-[9px] bg-white/25 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto shrink-0">Chính</span>
                  )}
                </div>

                {/* Body */}
                <div className="p-3.5 space-y-2.5">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span>{branch.address}, {branch.district}, {branch.city}</span>
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                    {branch.phone && (
                      <a href={`tel:${branch.phone}`} className="flex items-center gap-1 hover:text-green-600">
                        <Phone className="w-3 h-3" /> {branch.phone}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {branch.opening_time} - {branch.closing_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Giao {branch.delivery_radius_km}km
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-[11px] rounded-lg h-8">
                        <Navigation className="w-3 h-3 mr-1" /> Xem bản đồ
                      </Button>
                    </a>
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" className="w-full text-[11px] bg-blue-600 hover:bg-blue-700 rounded-lg h-8">
                        <Route className="w-3 h-3 mr-1" /> Chỉ đường
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
