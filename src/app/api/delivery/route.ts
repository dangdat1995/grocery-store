import { NextRequest, NextResponse } from "next/server";
import { haversineDistance, getDeliveryFee } from "@/lib/delivery";
import { MAX_DELIVERY_RADIUS_KM } from "@/lib/constants";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const DEMO_BRANCHES = [
  { id: "b1", name: "Chi nhánh chính - Quận 1", latitude: 10.7731, longitude: 106.7030, delivery_radius_km: 20 },
  { id: "b2", name: "Chi nhánh Quận 7", latitude: 10.7340, longitude: 106.7218, delivery_radius_km: 15 },
  { id: "b3", name: "Chi nhánh Thủ Đức", latitude: 10.8512, longitude: 106.7592, delivery_radius_km: 15 },
];

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: "Vui lòng cung cấp toạ độ" }, { status: 400 });
    }

    // Get branches
    let branches = DEMO_BRANCHES;
    if (!isDemo) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data } = await supabase.from("branches").select("id, name, latitude, longitude, delivery_radius_km").eq("is_active", true);
        if (data && data.length > 0) branches = data;
      } catch {}
    }

    // Find nearest branch within delivery radius
    const branchDistances = branches.map((b) => ({
      ...b,
      distance: haversineDistance(b.latitude, b.longitude, lat, lng),
    }));

    // Sort by distance
    branchDistances.sort((a, b) => a.distance - b.distance);

    // Find first branch where customer is within delivery radius
    const nearest = branchDistances.find((b) => b.distance <= b.delivery_radius_km);

    if (nearest) {
      const fee = getDeliveryFee(nearest.distance);
      return NextResponse.json({
        distance: Math.round(nearest.distance * 10) / 10,
        fee,
        inZone: true,
        branch_id: nearest.id,
        branch_name: nearest.name,
        message: `${nearest.name} - ${nearest.distance.toFixed(1)}km - Phí: ${fee === 0 ? "Miễn phí" : `${(fee || 0).toLocaleString("vi-VN")}đ`}`,
      });
    }

    // No branch in range — return closest with out-of-zone info
    const closest = branchDistances[0];
    return NextResponse.json({
      distance: Math.round(closest.distance * 10) / 10,
      fee: null,
      inZone: false,
      branch_id: null,
      branch_name: null,
      message: `Ngoài vùng giao hàng (gần nhất: ${closest.name} - ${closest.distance.toFixed(1)}km)`,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
