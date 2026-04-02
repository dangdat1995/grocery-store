"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, ArrowLeft, Tag, Leaf, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import ProductGrid from "@/components/store/ProductGrid";
import ProductReviews from "@/components/store/ProductReviews";
import type { Product } from "@/types";
import { toast } from "sonner";

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [buyMode, setBuyMode] = useState<"retail" | "bulk">("retail");
  const addItem = useCartStore((s) => s.addItem);

  const hasBulk = !!(product.bulk_price && product.bulk_quantity && product.bulk_unit);
  const activePrice = buyMode === "bulk" && hasBulk ? product.bulk_price! : product.price;
  const activeUnit = buyMode === "bulk" && hasBulk ? product.bulk_unit! : product.unit;

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, buyMode);
    }
    toast.success(`Đã thêm ${quantity} ${activeUnit} ${product.name} vào giỏ`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link href="/san-pham" className="inline-flex items-center text-sm text-gray-400 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Image */}
        <div className="animate-fade-in">
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center overflow-hidden relative shadow-md">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-300">
                <ShoppingCart className="w-20 h-20" />
                <span className="text-sm">Ảnh sản phẩm</span>
              </div>
            )}
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-base px-3 py-1.5 rounded-xl font-bold shadow-lg">
                -{discountPercent}%
              </Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="animate-slide-in-right">
          {product.category && (
            <Link href={`/danh-muc/${product.category.slug}`}>
              <Badge variant="outline" className="mb-3 rounded-lg">{product.category.name}</Badge>
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">{product.name}</h1>
          <p className="text-gray-400 mb-5">Đơn vị: {product.unit}</p>

          {/* Buy mode selector */}
          {hasBulk && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setBuyMode("retail"); setQuantity(1); }}
                className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  buyMode === "retail"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span className="block font-bold">Mua lẻ</span>
                <span className="text-xs opacity-70">{formatPrice(product.price)}/{product.unit}</span>
              </button>
              <button
                onClick={() => { setBuyMode("bulk"); setQuantity(1); }}
                className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  buyMode === "bulk"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span className="block font-bold">Nguyên {product.bulk_unit}</span>
                <span className="text-xs opacity-70">{formatPrice(product.bulk_price!)}/{product.bulk_unit} ({product.bulk_quantity} {product.unit})</span>
              </button>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl md:text-4xl font-extrabold text-green-600">
              {formatPrice(activePrice)}
            </span>
            {buyMode === "retail" && hasDiscount && (
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
            {buyMode === "bulk" && hasBulk && (
              <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                ~{formatPrice(Math.round(product.bulk_price! / product.bulk_quantity!))}/{product.unit}
              </span>
            )}
          </div>

          {buyMode === "retail" && hasDiscount && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl mb-5 font-medium">
              <Tag className="w-4 h-4" />
              Tiết kiệm {formatPrice(product.compare_at_price! - product.price)}
            </div>
          )}

          {/* Features */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Leaf className="w-3.5 h-3.5 text-green-500" /> Tươi ngon
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Package className="w-3.5 h-3.5 text-blue-500" /> Giao nhanh
            </div>
          </div>

          <Separator className="my-5" />

          {product.stock_quantity > 0 ? (
            <>
              <p className="text-sm text-green-600 mb-4 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Còn {product.stock_quantity} {product.unit} trong kho
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border rounded-xl overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 rounded-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-5 font-bold text-lg">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 rounded-none"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className={`flex-1 rounded-xl h-12 font-bold text-base shadow-md transition-all ${
                    added
                      ? "bg-green-700 scale-[0.98]"
                      : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                  }`}
                  onClick={handleAdd}
                >
                  {added ? (
                    <><Check className="w-5 h-5 mr-2" /> Đã thêm!</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5 mr-2" /> Thêm vào giỏ - {formatPrice(activePrice * quantity)}</>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-center">
              Tạm hết hàng
            </div>
          )}

          {product.description && (
            <>
              <Separator className="my-5" />
              <h3 className="font-bold mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </>
          )}
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-extrabold mb-6">Sản phẩm liên quan</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
