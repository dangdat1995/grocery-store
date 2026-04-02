export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/supabase/queries";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";
import { formatPrice } from "@/lib/format";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Sản phẩm không tồn tại" };
  return {
    title: `${product.name} - ${formatPrice(product.price)}`,
    description: product.description || `Mua ${product.name} online, giao tận nơi.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getProducts({
    categorySlug: product.category?.slug,
    limit: 4,
  });

  const filtered = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={filtered} />;
}
