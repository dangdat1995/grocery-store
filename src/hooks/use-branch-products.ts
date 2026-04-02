"use client";

import { useMemo } from "react";
import { useBranchStore } from "@/stores/branch-store";
import type { Product } from "@/types";
import type { BranchProductInfo } from "@/lib/supabase/queries";

/**
 * Filters products by selected branch availability.
 * Applies price overrides and stock from branch_products data.
 * If no branch selected or no branchProducts data, returns all products unchanged.
 */
export function useBranchProducts(
  products: Product[],
  branchProducts: Record<string, BranchProductInfo[]>
): Product[] {
  const selectedBranch = useBranchStore((s) => s.selectedBranch);

  return useMemo(() => {
    if (!selectedBranch) return products;

    const bpList = branchProducts[selectedBranch.id];
    // If no branch_products mapping exists for this branch, show all (graceful fallback)
    if (!bpList || bpList.length === 0) return products;

    const bpMap = new Map(bpList.map((bp) => [bp.product_id, bp]));

    return products
      .filter((p) => bpMap.has(p.id))
      .map((p) => {
        const bp = bpMap.get(p.id)!;
        return {
          ...p,
          price: bp.price_override ?? p.price,
          stock_quantity: bp.stock_quantity,
        };
      });
  }, [products, branchProducts, selectedBranch]);
}
