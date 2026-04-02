"use client";

import Link from "next/link";
import { ShoppingCart, Plus, Star } from "lucide-react";
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

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isNew = product.created_at && (Date.now() - new Date(product.created_at).getTime()) < 7 * 86400000;

  return (
    <Link href={`/san-pham/${product.slug}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-green-200 hover:shadow-xl h-full flex flex-col transition-all duration-300">
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <ShoppingCart className="w-10 h-10" />
              <span className="text-xs">Ảnh sản phẩm</span>
            </div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge className="bg-red-500 shadow-md font-bold text-xs px-2 py-0.5 rounded-lg">
                -{discountPercent}%
              </Badge>
            )}
            {isNew && !hasDiscount && (
              <Badge className="bg-emerald-500 shadow-md font-bold text-[10px] px-1.5 py-0.5 rounded-lg">
                Mới
              </Badge>
            )}
          </div>

          {/* Top-right badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.bulk_price && product.bulk_unit && (
              <Badge className="bg-teal-500 shadow-md font-bold text-[10px] px-1.5 py-0.5 rounded-lg">
                Sỉ
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-amber-500 shadow-md font-bold text-[10px] px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-white" /> Hot
              </Badge>
            )}
          </div>

          {/* Low stock warning */}
          {isLowStock && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-700/80 to-transparent py-1 px-2">
              <p className="text-[9px] text-white font-bold text-center">Chỉ còn {product.stock_quantity} sản phẩm</p>
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white font-bold bg-black/30 px-4 py-1.5 rounded-full text-sm">
                Hết hàng
              </span>
            </div>
          )}

          {/* Quick add button */}
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
        <div className="p-2.5 flex flex-col flex-1">
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">/{product.unit}</p>
          <p className="font-semibold text-[13px] line-clamp-2 mb-1.5 group-hover:text-green-700 transition-colors leading-snug">
            {product.name}
          </p>
          <div className="mt-auto space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-base text-green-600">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-[11px] text-gray-400 line-through ml-1.5">
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
              <p className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-md inline-block">
                {product.bulk_unit}: {formatPrice(product.bulk_price)} ({product.bulk_quantity} {product.unit})
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
