"use client";

import Link from "next/link";
import { ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`Đã thêm ${product.name} vào giỏ`);
  };

  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <Link href={`/san-pham/${product.slug}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover h-full flex flex-col">
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover img-zoom"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <ShoppingCart className="w-10 h-10" />
              <span className="text-xs">Ảnh sản phẩm</span>
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <Badge className="absolute top-2.5 left-2.5 bg-red-500 shadow-md font-bold text-xs px-2 py-0.5 rounded-lg">
              -{discountPercent}%
            </Badge>
          )}

          {/* Bulk available badge */}
          {product.bulk_price && product.bulk_unit && (
            <Badge className="absolute top-2.5 right-2.5 bg-orange-500 shadow-md font-bold text-[10px] px-1.5 py-0.5 rounded-lg">
              Có bán {product.bulk_unit}
            </Badge>
          )}

          {/* Out of stock overlay */}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white font-bold bg-black/30 px-4 py-1.5 rounded-full text-sm">
                Hết hàng
              </span>
            </div>
          )}

          {/* Quick add button - appears on hover */}
          {product.stock_quantity > 0 && (
            <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Button
                size="sm"
                className="h-9 w-9 p-0 rounded-xl bg-green-600 hover:bg-green-700 shadow-lg"
                onClick={handleAdd}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 flex flex-col flex-1">
          <p className="text-xs text-gray-400 mb-0.5">/{product.unit}</p>
          <p className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-green-700 transition-colors leading-snug">
            {product.name}
          </p>
          <div className="mt-auto pt-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-green-600 text-base">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through ml-1.5">
                    {formatPrice(product.compare_at_price!)}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                className="h-8 rounded-lg bg-green-600 hover:bg-green-700 shadow-sm md:hidden"
                onClick={handleAdd}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </Button>
            </div>
            {product.bulk_price && product.bulk_unit && product.bulk_quantity && (
              <p className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-block">
                {product.bulk_unit}: {formatPrice(product.bulk_price)} ({product.bulk_quantity} {product.unit})
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
