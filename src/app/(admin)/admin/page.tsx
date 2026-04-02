export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export default async function AdminDashboard() {
  if (isDemo) {
    return <DashboardClient data={getDemoData()} isDemo />;
  }

  try {
    const supabase = await createClient();
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];
    const weekStart = new Date(now.getTime() - now.getDay() * 86400000).toISOString().split("T")[0];
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];

    const [products, customers, todayOrders, yesterdayOrders, weekOrders, monthOrders, recentOrders, visitData, lowStock] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("orders").select("total, status, payment_method, payment_status").gte("created_at", today),
      supabase.from("orders").select("total, status").gte("created_at", yesterday).lt("created_at", today),
      supabase.from("orders").select("total, status, payment_method, user_id").gte("created_at", weekStart),
      supabase.from("orders").select("total, status, payment_method, user_id").gte("created_at", monthStart),
      supabase.from("orders").select("id, order_number, total, status, payment_status, payment_method, created_at, profiles(full_name)").order("created_at", { ascending: false }).limit(8),
      supabase.from("page_visits").select("date, visit_count").gte("date", sevenDaysAgo).order("date"),
      supabase.from("products").select("id, name, stock_quantity").eq("is_active", true).lte("stock_quantity", 5).order("stock_quantity").limit(5),
    ]);

    const todayData = todayOrders.data || [];
    const yesterdayData = yesterdayOrders.data || [];
    const weekData = weekOrders.data || [];
    const monthData = monthOrders.data || [];

    const calc = (arr: any[]) => ({
      orders: arr.length,
      revenue: arr.reduce((s, o) => s + (o.total || 0), 0),
    });

    const pendingCount = todayData.filter(o => o.status === "pending").length + (recentOrders.data || []).filter((o: any) => o.status === "pending").length;
    const unpaidCount = todayData.filter(o => o.payment_status === "unpaid").length;

    const visitRows = visitData.data || [];
    const visitsByDay = visitRows.reduce((acc: Record<string, number>, r: any) => {
      acc[r.date] = (acc[r.date] || 0) + r.visit_count;
      return acc;
    }, {});

    return (
      <DashboardClient
        data={{
          totalProducts: products.count || 0,
          totalCustomers: customers.count || 0,
          today: calc(todayData),
          yesterday: calc(yesterdayData),
          thisWeek: calc(weekData),
          thisMonth: calc(monthData),
          pendingOrders: pendingCount,
          unpaidOrders: unpaidCount,
          recentOrders: (recentOrders.data || []).map((o: any) => ({
            id: o.id, order_number: o.order_number, total: o.total,
            status: o.status, payment_status: o.payment_status,
            payment_method: o.payment_method, created_at: o.created_at,
            customer_name: o.profiles?.full_name || "Khách",
          })),
          lowStock: (lowStock.data || []).map((p: any) => ({
            id: p.id, name: p.name, stock: p.stock_quantity,
          })),
          visitsByDay: Object.entries(visitsByDay).map(([date, visits]) => ({ date, visits: visits as number })),
          todayVisits: visitsByDay[today] || 0,
        }}
        isDemo={false}
      />
    );
  } catch {
    return <DashboardClient data={getEmptyData()} isDemo={false} />;
  }
}

function getDemoData() {
  return {
    totalProducts: MOCK_PRODUCTS.length,
    totalCustomers: 28,
    today: { orders: 3, revenue: 600000 },
    yesterday: { orders: 2, revenue: 370000 },
    thisWeek: { orders: 12, revenue: 2850000 },
    thisMonth: { orders: 45, revenue: 12500000 },
    pendingOrders: 2,
    unpaidOrders: 3,
    recentOrders: [
      { id: "1", order_number: "GH-20260401-001", total: 205000, status: "pending", payment_status: "unpaid", payment_method: "cod", created_at: "2026-04-01T10:00:00Z", customer_name: "Nguyễn Văn A" },
      { id: "2", order_number: "GH-20260401-002", total: 320000, status: "confirmed", payment_status: "paid", payment_method: "vnpay", created_at: "2026-04-01T09:30:00Z", customer_name: "Trần Thị B" },
      { id: "3", order_number: "GH-20260401-003", total: 95000, status: "delivering", payment_status: "unpaid", payment_method: "cod", created_at: "2026-04-01T08:00:00Z", customer_name: "Lê Văn C" },
      { id: "4", order_number: "GH-20260331-001", total: 450000, status: "delivered", payment_status: "paid", payment_method: "momo", created_at: "2026-03-31T15:00:00Z", customer_name: "Phạm Thị D" },
      { id: "5", order_number: "GH-20260331-002", total: 78000, status: "cancelled", payment_status: "failed", payment_method: "vnpay", created_at: "2026-03-31T12:00:00Z", customer_name: "Hoàng Văn E" },
    ],
    lowStock: [
      { id: "p10", name: "Sườn non bò Úc", stock: 0 },
      { id: "p11", name: "Tôm sú", stock: 2 },
      { id: "p5", name: "Cam sành", stock: 3 },
    ],
    visitsByDay: [
      { date: "2026-03-27", visits: 145 },
      { date: "2026-03-28", visits: 98 },
      { date: "2026-03-29", visits: 167 },
      { date: "2026-03-30", visits: 130 },
      { date: "2026-03-31", visits: 132 },
      { date: "2026-04-01", visits: 156 },
      { date: "2026-04-02", visits: 89 },
    ],
    todayVisits: 89,
  };
}

function getEmptyData() {
  return {
    totalProducts: 0, totalCustomers: 0,
    today: { orders: 0, revenue: 0 }, yesterday: { orders: 0, revenue: 0 },
    thisWeek: { orders: 0, revenue: 0 }, thisMonth: { orders: 0, revenue: 0 },
    pendingOrders: 0, unpaidOrders: 0, recentOrders: [], lowStock: [],
    visitsByDay: [], todayVisits: 0,
  };
}
