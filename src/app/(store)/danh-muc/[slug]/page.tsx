export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getProducts, getCategories, getCategoryBySlug, getBranchProducts } from "@/lib/supabase/queries";
import BranchProductGrid from "@/components/store/BranchProductGrid";
import CategoryBar from "@/components/store/CategoryBar";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Danh mục không tồn tại" };
  return {
    title: `${category.name} - Mua online giá tốt`,
    description: `Mua ${category.name} online, giao tận nơi trong 20km. Sản phẩm tươi ngon, giá cả hợp lý.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, products, categories, branchProducts] = await Promise.all([
    getCategoryBySlug(slug),
    getProducts({ categorySlug: slug }),
    getCategories(),
    getBranchProducts(),
  ]);

  if (!category) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{category.name}</h1>
      <CategoryBar categories={categories} />
      <div className="mt-4">
        <BranchProductGrid
          products={products}
          branchProducts={branchProducts}
          emptyMessage={`Chưa có sản phẩm nào trong danh mục ${category.name} tại chi nhánh này`}
        />
      </div>
    </div>
  );
}
