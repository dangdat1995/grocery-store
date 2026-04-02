export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import CustomerListClient from "./CustomerListClient";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const MOCK_CUSTOMERS = [
  { id: "1", full_name: "Nguyễn Văn A", phone: "0901234567", created_at: "2026-01-15T10:00:00Z", total_orders: 25, total_spent: 8500000, loyalty_tier: "gold", last_order_at: "2026-04-01T10:00:00Z" },
  { id: "2", full_name: "Trần Thị B", phone: "0912345678", created_at: "2026-02-20T14:00:00Z", total_orders: 12, total_spent: 4200000, loyalty_tier: "silver", last_order_at: "2026-04-01T09:30:00Z" },
  { id: "3", full_name: "Lê Văn C", phone: "0923456789", created_at: "2026-03-25T08:00:00Z", total_orders: 5, total_spent: 1800000, loyalty_tier: "bronze", last_order_at: "2026-03-30T08:00:00Z" },
  { id: "4", full_name: "Phạm Thị D", phone: "0934567890", created_at: "2026-03-28T16:00:00Z", total_orders: 2, total_spent: 450000, loyalty_tier: "new", last_order_at: "2026-03-28T16:00:00Z" },
  { id: "5", full_name: "Hoàng Văn E", phone: "0945678901", created_at: "2026-03-30T11:00:00Z", total_orders: 1, total_spent: 78000, loyalty_tier: "new", last_order_at: "2026-03-30T11:00:00Z" },
  { id: "6", full_name: "Võ Thị F", phone: "0956789012", created_at: "2026-02-01T09:00:00Z", total_orders: 52, total_spent: 22000000, loyalty_tier: "platinum", last_order_at: "2026-04-01T07:00:00Z" },
];

export default async function AdminCustomersPage() {
  let customers: any[] = [];
  if (isDemo) {
    customers = MOCK_CUSTOMERS;
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer")
        .order("total_spent", { ascending: false });
      customers = data || [];
    } catch {
      customers = [];
    }
  }

  return <CustomerListClient customers={customers} />;
}
