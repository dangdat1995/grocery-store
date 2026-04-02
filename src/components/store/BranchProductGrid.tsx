"use client";

import { useBranchProducts } from "@/hooks/use-branch-products";
import ProductCard from "./ProductCard";
import type { Product } from "@/types";
import type { BranchProductInfo } from "@/lib/supabase/queries";

interface BranchProductGridProps {
  products: Product[];
  branchProducts: Record<string, BranchProductInfo[]>;
  emptyMessage?: string;
}

export default function BranchProductGrid({
  products,
  branchProducts,
  emptyMessage = "Không có sản phẩm nào tại chi nhánh này",
}: BranchProductGridProps) {
  const filtered = useBranchProducts(products, branchProducts);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
