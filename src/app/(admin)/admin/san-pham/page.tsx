export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import ProductListClient from "./ProductListClient";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export default async function AdminProductsPage() {
  let products: any[] = [];
  let categories: string[] = [];

  if (isDemo) {
    products = MOCK_PRODUCTS.map((p) => ({ ...p, category: p.category ? { name: p.category.name } : null }));
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("created_at", { ascending: false });
      products = data || [];
    } catch {
      products = [];
    }
  }

  // Extract unique category names
  categories = [...new Set(products.map((p) => p.category?.name).filter(Boolean))] as string[];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h1 className="text-lg sm:text-xl font-bold">Sản phẩm</h1>
        <Link href="/admin/san-pham/them">
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" /> Thêm SP
          </Button>
        </Link>
      </div>
      <ProductListClient products={products} categories={categories} />
    </div>
  );
}
