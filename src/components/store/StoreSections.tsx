"use client";

import { useBranchProducts } from "@/hooks/use-branch-products";
import SaleStrip from "./SaleStrip";
import FeaturedStrip from "./FeaturedStrip";
import StoreAisles from "./StoreAisles";
import type { ReactNode } from "react";
import type { Product } from "@/types";
import type { BranchProductInfo } from "@/lib/supabase/queries";

interface StoreSectionsProps {
  allProducts: Product[];
  categories: any[];
  branchProducts: Record<string, BranchProductInfo[]>;
  children?: ReactNode; // slot between sale and featured (combo section)
}

export default function StoreSections({ allProducts, categories, branchProducts, children }: StoreSectionsProps) {
  const products = useBranchProducts(allProducts, branchProducts);

  const saleProducts = products
    .filter((p: any) => p.compare_at_price && p.compare_at_price > p.price)
    .slice(0, 10);

  const featuredProducts = products.filter((p: any) => p.is_featured).slice(0, 8);

  return (
    <>
      {saleProducts.length > 0 && <SaleStrip products={saleProducts} />}
      {children}
      <FeaturedStrip products={featuredProducts} />
      <StoreAisles categories={categories} products={products} />
    </>
  );
}
