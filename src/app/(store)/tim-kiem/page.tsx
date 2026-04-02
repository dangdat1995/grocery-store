export const dynamic = "force-dynamic";

import { getProducts, getBranchProducts } from "@/lib/supabase/queries";
import BranchProductGrid from "@/components/store/BranchProductGrid";
import type { Metadata } from "next";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Tìm kiếm: ${q}` : "Tìm kiếm sản phẩm",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [products, branchProducts] = await Promise.all([
    q ? getProducts({ search: q }) : Promise.resolve([]),
    getBranchProducts(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">
        {q ? `Kết quả tìm kiếm: "${q}"` : "Tìm kiếm sản phẩm"}
      </h1>
      {q && (
        <p className="text-gray-500 mb-6">
          Tìm thấy {products.length} sản phẩm
        </p>
      )}
      <BranchProductGrid
        products={products}
        branchProducts={branchProducts}
        emptyMessage={q ? `Không tìm thấy sản phẩm nào cho "${q}"` : "Nhập từ khoá để tìm kiếm"}
      />
    </div>
  );
}
