export const dynamic = "force-dynamic";

import { getProducts, getCategories, getBranchProducts } from "@/lib/supabase/queries";
import BranchProductGrid from "@/components/store/BranchProductGrid";
import CategoryBar from "@/components/store/CategoryBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tất cả sản phẩm",
  description: "Khám phá tất cả sản phẩm tạp hoá online - Rau củ, trái cây, thịt cá, đồ khô, gia vị.",
};

export default async function ProductsPage() {
  const [products, categories, branchProducts] = await Promise.all([
    getProducts(),
    getCategories(),
    getBranchProducts(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Tất cả sản phẩm</h1>
      <CategoryBar categories={categories} />
      <div className="mt-4">
        <BranchProductGrid products={products} branchProducts={branchProducts} />
      </div>
    </div>
  );
}
