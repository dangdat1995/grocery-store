export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import InventoryClient from "./InventoryClient";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

interface ProductInventory {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  stock_quantity: number;
  price: number;
  category_name: string;
  batches: {
    id: string;
    batch_code: string | null;
    quantity: number;
    remaining: number;
    cost_price: number;
    expiry_date: string | null;
    received_at: string;
    note: string | null;
  }[];
}

interface Branch {
  id: string;
  name: string;
  is_main: boolean;
}

const MOCK_BRANCHES: Branch[] = [
  { id: "b1", name: "CN Quận 1 (Chính)", is_main: true },
  { id: "b2", name: "CN Quận 7", is_main: false },
  { id: "b3", name: "CN Thủ Đức", is_main: false },
];

const MOCK_PRODUCTS: ProductInventory[] = [
  { id: "p1", name: "Rau muống", sku: "RAU-001", unit: "bó", stock_quantity: 100, price: 8000, category_name: "Rau củ quả", batches: [
    { id: "b1", batch_code: "LOT-0401", quantity: 100, remaining: 100, cost_price: 5000, expiry_date: "2026-04-05", received_at: "2026-04-01T06:00:00Z", note: "Hàng tươi" },
  ]},
  { id: "p5", name: "Cam sành", sku: "TC-002", unit: "kg", stock_quantity: 3, price: 45000, category_name: "Trái cây", batches: [
    { id: "b2", batch_code: "LOT-0330", quantity: 20, remaining: 3, cost_price: 30000, expiry_date: "2026-04-04", received_at: "2026-03-30T07:00:00Z", note: "Sắp hết" },
  ]},
  { id: "p8", name: "Thịt ba chỉ heo", sku: "TH-001", unit: "kg", stock_quantity: 15, price: 85000, category_name: "Thịt tươi", batches: [
    { id: "b3", batch_code: "LOT-0401", quantity: 15, remaining: 15, cost_price: 70000, expiry_date: "2026-04-04", received_at: "2026-04-01T06:00:00Z", note: "Bán trong 3 ngày" },
  ]},
  { id: "p13", name: "Sữa tươi TH 1L", sku: "SUA-001", unit: "hộp", stock_quantity: 120, price: 32000, category_name: "Sữa & Bơ", batches: [
    { id: "b4", batch_code: "LOT-0320", quantity: 120, remaining: 80, cost_price: 26000, expiry_date: "2026-04-10", received_at: "2026-03-20T09:00:00Z", note: null },
    { id: "b5", batch_code: "LOT-0330", quantity: 60, remaining: 40, cost_price: 26500, expiry_date: "2026-04-20", received_at: "2026-03-30T09:00:00Z", note: null },
  ]},
  { id: "p15", name: "Gạo ST25 5kg", sku: "DK-001", unit: "bao", stock_quantity: 50, price: 135000, category_name: "Đồ khô", batches: [
    { id: "b6", batch_code: "LOT-0315", quantity: 30, remaining: 20, cost_price: 110000, expiry_date: "2027-03-01", received_at: "2026-03-15T08:00:00Z", note: null },
    { id: "b7", batch_code: "LOT-0328", quantity: 40, remaining: 30, cost_price: 112000, expiry_date: "2027-03-15", received_at: "2026-03-28T10:00:00Z", note: null },
  ]},
  { id: "p17", name: "Nước mắm Phú Quốc", sku: "GV-001", unit: "chai", stock_quantity: 200, price: 55000, category_name: "Gia vị", batches: [
    { id: "b8", batch_code: "LOT-0201", quantity: 200, remaining: 150, cost_price: 35000, expiry_date: "2028-01-01", received_at: "2026-02-01T08:00:00Z", note: null },
  ]},
  { id: "p10", name: "Sườn non bò Úc", sku: "TH-003", unit: "kg", stock_quantity: 0, price: 195000, category_name: "Thịt tươi", batches: [] },
  { id: "p11", name: "Tôm sú", sku: "HS-001", unit: "kg", stock_quantity: 2, price: 145000, category_name: "Hải sản", batches: [
    { id: "b9", batch_code: "LOT-0401", quantity: 10, remaining: 2, cost_price: 120000, expiry_date: "2026-04-03", received_at: "2026-04-01T05:00:00Z", note: "Tươi sống" },
  ]},
];

export default async function InventoryPage() {
  let products: ProductInventory[] = [];
  let branches: Branch[] = [];

  if (isDemo) {
    products = MOCK_PRODUCTS;
    branches = MOCK_BRANCHES;
  } else {
    try {
      const supabase = await createClient();

      const [{ data: prods }, { data: brData }] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, sku, unit, stock_quantity, price, category:categories(name)")
          .eq("is_active", true)
          .order("stock_quantity", { ascending: true }),
        supabase
          .from("branches")
          .select("id, name, is_main")
          .eq("is_active", true)
          .order("is_main", { ascending: false }),
      ]);

      branches = (brData || []).map((b: any) => ({ id: b.id, name: b.name, is_main: b.is_main }));

      const prodIds = (prods || []).map((p: any) => p.id);
      const { data: batches } = prodIds.length > 0
        ? await supabase
            .from("inventory_batches")
            .select("*")
            .in("product_id", prodIds)
            .order("expiry_date", { ascending: true })
        : { data: [] };

      products = (prods || []).map((p: any) => ({
        ...p,
        category_name: p.category?.name || "Khác",
        batches: (batches || []).filter((b: any) => b.product_id === p.id),
      }));
    } catch {
      products = [];
    }
  }

  return <InventoryClient products={products} branches={branches} isDemo={isDemo || false} />;
}
