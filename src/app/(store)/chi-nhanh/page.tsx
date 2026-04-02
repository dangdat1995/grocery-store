export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import type { Branch } from "@/types";
import BranchLocations from "./BranchLocations";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const DEMO_BRANCHES: Branch[] = [
  {
    id: "b1", name: "Chi nhánh chính - Quận 1", slug: "chi-nhanh-chinh",
    phone: "0901234567", address: "123 Nguyễn Huệ, Phường Bến Nghé",
    ward: "Phường Bến Nghé", district: "Quận 1", city: "TP. Hồ Chí Minh",
    latitude: 10.7731, longitude: 106.7030,
    delivery_radius_km: 20, opening_time: "06:00", closing_time: "21:00",
    is_main: true, is_active: true,
    manager_name: "Nguyễn Văn A", manager_phone: "0901234567",
    created_at: "2026-01-01", updated_at: "2026-01-01",
  },
  {
    id: "b2", name: "Chi nhánh Quận 7", slug: "chi-nhanh-quan-7",
    phone: "0912345678", address: "456 Nguyễn Thị Thập, Phường Tân Phong",
    ward: "Phường Tân Phong", district: "Quận 7", city: "TP. Hồ Chí Minh",
    latitude: 10.7340, longitude: 106.7218,
    delivery_radius_km: 15, opening_time: "06:30", closing_time: "21:30",
    is_main: false, is_active: true,
    manager_name: "Trần Thị B", manager_phone: "0912345678",
    created_at: "2026-02-01", updated_at: "2026-02-01",
  },
  {
    id: "b3", name: "Chi nhánh Thủ Đức", slug: "chi-nhanh-thu-duc",
    phone: "0923456789", address: "789 Võ Văn Ngân, Phường Linh Chiểu",
    ward: "Phường Linh Chiểu", district: "TP. Thủ Đức", city: "TP. Hồ Chí Minh",
    latitude: 10.8512, longitude: 106.7592,
    delivery_radius_km: 15, opening_time: "07:00", closing_time: "21:00",
    is_main: false, is_active: true,
    manager_name: "Lê Văn C", manager_phone: "0923456789",
    created_at: "2026-03-01", updated_at: "2026-03-01",
  },
];

async function getBranches(): Promise<Branch[]> {
  if (isDemo) return DEMO_BRANCHES;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("branches")
      .select("*")
      .eq("is_active", true)
      .order("is_main", { ascending: false });
    return (data || []) as Branch[];
  } catch {
    return DEMO_BRANCHES;
  }
}

export default async function BranchesPage() {
  const branches = await getBranches();
  return <BranchLocations branches={branches} />;
}
