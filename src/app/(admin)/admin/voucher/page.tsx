export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import VoucherListClient from "./VoucherListClient";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const MOCK_VOUCHERS = [
  { id: "1", code: "GIAM20K", description: "Giảm 20.000đ cho đơn từ 200k", discount_type: "fixed", discount_value: 20000, max_discount: null, min_order_amount: 200000, usage_limit: 100, used_count: 23, per_user_limit: 1, start_date: "2026-03-01T00:00:00Z", end_date: "2026-04-30T23:59:59Z", is_active: true },
  { id: "2", code: "FREESHIP", description: "Miễn phí ship cho đơn từ 150k", discount_type: "free_ship", discount_value: 0, max_discount: null, min_order_amount: 150000, usage_limit: 50, used_count: 12, per_user_limit: 2, start_date: "2026-03-15T00:00:00Z", end_date: "2026-04-15T23:59:59Z", is_active: true },
  { id: "3", code: "SALE10", description: "Giảm 10% tối đa 50k", discount_type: "percent", discount_value: 10, max_discount: 50000, min_order_amount: 100000, usage_limit: 200, used_count: 87, per_user_limit: 1, start_date: "2026-02-01T00:00:00Z", end_date: "2026-03-31T23:59:59Z", is_active: false },
  { id: "4", code: "GIAM50K", description: "Giảm 50.000đ cho đơn từ 500k", discount_type: "fixed", discount_value: 50000, max_discount: null, min_order_amount: 500000, usage_limit: 50, used_count: 50, per_user_limit: 1, start_date: "2026-01-01T00:00:00Z", end_date: "2026-12-31T23:59:59Z", is_active: true },
];

export default async function AdminVoucherPage() {
  let vouchers: any[] = [];
  if (isDemo) {
    vouchers = MOCK_VOUCHERS;
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("vouchers")
        .select("*")
        .order("created_at", { ascending: false });
      vouchers = data || [];
    } catch {
      vouchers = [];
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h1 className="text-lg sm:text-xl font-bold">Mã giảm giá (Voucher)</h1>
        <Link href="/admin/voucher/them">
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" /> Tạo voucher
          </Button>
        </Link>
      </div>
      <VoucherListClient vouchers={vouchers} />
    </div>
  );
}
