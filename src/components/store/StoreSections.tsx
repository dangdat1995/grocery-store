"use client";

import { useBranchProducts } from "@/hooks/use-branch-products";
import FlashSale from "./FlashSale";
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
    .filter((p: any) => p.compare_at_price && p.compare_at_price > p.price);

  // Split: top sale items for flash sale, rest for regular sale strip
  const flashSaleProducts = saleProducts.slice(0, 8);
  const moreSaleProducts = saleProducts.slice(8, 18);

  const featuredProducts = products.filter((p: any) => p.is_featured).slice(0, 8);

  return (
    <div className="space-y-2">
      {flashSaleProducts.length > 0 && <FlashSale products={flashSaleProducts} />}
      {moreSaleProducts.length > 0 && <SaleStrip products={moreSaleProducts} />}
      {children}
      <FeaturedStrip products={featuredProducts} />
      <StoreAisles categories={categories} products={products} />
    </div>
  );
}
