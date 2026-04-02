"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Branch } from "@/types";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  Building2,
  Locate,
  Route,
  Truck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

interface BranchLocationsProps {
  branches: Branch[];
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function getDirectionsUrl(destLat: number, destLng: number, originLat?: number, originLng?: number): string {
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
}

function getGoogleMapsEmbedUrl(branches: Branch[]): string {
  // Show all branches on a single map
  if (branches.length === 1) {
    const b = branches[0];
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d5000!2d${b.longitude}!3d${b.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2svn`;
  }
  // Multiple markers - center on average
  const avgLat = branches.reduce((s, b) => s + b.latitude, 0) / branches.length;
  const avgLng = branches.reduce((s, b) => s + b.longitude, 0) / branches.length;
  return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d50000!2d${avgLng}!3d${avgLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2svn`;
}

export default function BranchLocations({ branches }: BranchLocationsProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  // Sort branches: nearest first if user location available
  const sortedBranches = userLocation
    ? [...branches].sort((a, b) => {
        const distA = getDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distB = getDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distA - distB;
      })
    : branches;

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };

  // Auto-select nearest branch
  useEffect(() => {
    if (userLocation && sortedBranches.length > 0) {
      setSelectedBranch(sortedBranches[0].id);
    }
  }, [userLocation]);

  const activeBranch = branches.find((b) => b.id === selectedBranch) || branches[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <MapPin className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Hệ thống chi nhánh</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Tìm chi nhánh gần nhất và nhận đường đi bằng Google Maps
        </p>
      </div>

      {/* Locate me button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={handleLocate}
          disabled={locating}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl h-11 px-6 shadow-md"
        >
          {locating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Locate className="w-4 h-4 mr-2" />
          )}
          {locating ? "Đang định vị..." : userLocation ? "Đã định vị - Cập nhật lại" : "Định vị vị trí của tôi"}
        </Button>
      </div>

      {userLocation && (
        <div className="text-center mb-6">
          <Badge className="bg-blue-100 text-blue-700 text-xs">
            <Locate className="w-3 h-3 mr-1" />
            Vị trí của bạn: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Branch list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">
            {branches.length} chi nhánh {userLocation ? "(gần nhất trước)" : ""}
          </h2>

          {sortedBranches.map((branch) => {
            const isSelected = selectedBranch === branch.id;
            const isExpanded = expandedBranch === branch.id;
            const distance = userLocation
              ? getDistanceKm(userLocation.lat, userLocation.lng, branch.latitude, branch.longitude)
              : null;
            const inRange = distance !== null && distance <= branch.delivery_radius_km;

            return (
              <Card
                key={branch.id}
                className={`gap-0 p-0 overflow-hidden cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-green-500 shadow-md" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedBranch(branch.id)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      branch.is_main
                        ? "bg-gradient-to-br from-amber-400 to-orange-500"
                        : "bg-gradient-to-br from-green-500 to-emerald-600"
                    }`}>
                      {branch.is_main ? <Star className="w-5 h-5 text-white" /> : <Building2 className="w-5 h-5 text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{branch.name}</h3>
                        {branch.is_main && (
                          <Badge className="bg-amber-100 text-amber-700 text-[10px]">Chính</Badge>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5 flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />
                        {branch.address}, {branch.district}, {branch.city}
                      </p>

                      {/* Distance badge */}
                      {distance !== null && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-[10px] ${inRange ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            <Navigation className="w-2.5 h-2.5 mr-0.5" />
                            {distance.toFixed(1)} km
                          </Badge>
                          {inRange ? (
                            <Badge className="bg-green-100 text-green-700 text-[10px]">
                              <Truck className="w-2.5 h-2.5 mr-0.5" /> Trong vùng giao hàng
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700 text-[10px]">
                              Ngoài vùng giao ({branch.delivery_radius_km}km)
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expand */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedBranch(isExpanded ? null : branch.id); }}
                      className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {branch.phone && (
                          <a href={`tel:${branch.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-green-600">
                            <Phone className="w-3 h-3 text-gray-400" /> {branch.phone}
                          </a>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-3 h-3 text-gray-400" /> {branch.opening_time} - {branch.closing_time}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Truck className="w-3 h-3 text-gray-400" /> Giao hàng {branch.delivery_radius_km}km
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        <a
                          href={getGoogleMapsUrl(branch.latitude, branch.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button size="sm" variant="outline" className="w-full text-xs rounded-lg">
                            <MapPin className="w-3 h-3 mr-1" /> Xem bản đồ
                          </Button>
                        </a>
                        <a
                          href={getDirectionsUrl(
                            branch.latitude,
                            branch.longitude,
                            userLocation?.lat,
                            userLocation?.lng
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button size="sm" className="w-full text-xs bg-green-600 hover:bg-green-700 rounded-lg">
                            <Route className="w-3 h-3 mr-1" /> Chỉ đường
                          </Button>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="gap-0 p-0 overflow-hidden sticky top-20">
            {/* Map header with selected branch */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4" />
                <span className="font-bold text-sm">{activeBranch?.name || "Bản đồ chi nhánh"}</span>
              </div>
              {activeBranch && (
                <a
                  href={getDirectionsUrl(
                    activeBranch.latitude,
                    activeBranch.longitude,
                    userLocation?.lat,
                    userLocation?.lng
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white/90 hover:text-white text-xs bg-white/15 rounded-lg px-3 py-1.5 hover:bg-white/25 transition-colors"
                >
                  <Route className="w-3 h-3" /> Chỉ đường <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Google Maps iframe */}
            <div className="relative">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=&q=${activeBranch?.latitude || 10.7769},${activeBranch?.longitude || 106.7009}&zoom=15&language=vi`}
                className="w-full h-[300px] md:h-[450px] border-0 hidden"
                allowFullScreen
                loading="lazy"
              />
              {/* Fallback: OpenStreetMap (works without API key) */}
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  (activeBranch?.longitude || 106.7009) - 0.015
                }%2C${
                  (activeBranch?.latitude || 10.7769) - 0.01
                }%2C${
                  (activeBranch?.longitude || 106.7009) + 0.015
                }%2C${
                  (activeBranch?.latitude || 10.7769) + 0.01
                }&layer=mapnik&marker=${activeBranch?.latitude || 10.7769}%2C${activeBranch?.longitude || 106.7009}`}
                className="w-full h-[300px] md:h-[450px] border-0"
                loading="lazy"
              />

              {/* Overlay buttons on map */}
              <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                <a
                  href={getGoogleMapsUrl(activeBranch?.latitude || 10.7769, activeBranch?.longitude || 106.7009)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="sm" className="w-full bg-white text-gray-700 hover:bg-gray-50 shadow-lg rounded-xl text-xs font-bold border">
                    <img src="https://www.google.com/favicon.ico" alt="" className="w-3.5 h-3.5 mr-1.5" />
                    Mở Google Maps
                  </Button>
                </a>
                <a
                  href={getDirectionsUrl(
                    activeBranch?.latitude || 10.7769,
                    activeBranch?.longitude || 106.7009,
                    userLocation?.lat,
                    userLocation?.lng
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg rounded-xl text-xs font-bold">
                    <Route className="w-3.5 h-3.5 mr-1.5" />
                    Dẫn đường đến đây
                  </Button>
                </a>
              </div>
            </div>

            {/* Branch info below map */}
            {activeBranch && (
              <div className="p-4 border-t bg-gray-50 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm text-gray-700">{activeBranch.address}, {activeBranch.district}, {activeBranch.city}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {activeBranch.phone && (
                    <a href={`tel:${activeBranch.phone}`} className="flex items-center gap-1 hover:text-green-600">
                      <Phone className="w-3 h-3" /> {activeBranch.phone}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activeBranch.opening_time} - {activeBranch.closing_time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Giao hàng trong {activeBranch.delivery_radius_km}km
                  </span>
                </div>
                {userLocation && (
                  <div className="pt-1">
                    <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                      <Navigation className="w-2.5 h-2.5 mr-0.5" />
                      Cách bạn {getDistanceKm(userLocation.lat, userLocation.lng, activeBranch.latitude, activeBranch.longitude).toFixed(1)} km
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
