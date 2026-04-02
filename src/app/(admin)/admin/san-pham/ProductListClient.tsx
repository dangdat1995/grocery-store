"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import {
  Search,
  Edit,
  ArrowUpDown,
  Package,
  Eye,
  EyeOff,
  AlertTriangle,
  Star,
} from "lucide-react";

const STOCK_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "in_stock", label: "Còn hàng" },
  { key: "low", label: "Sắp hết (≤5)" },
  { key: "out", label: "Hết hàng" },
];

const STATUS_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Đang bán", color: "bg-green-100 text-green-700" },
  { key: "hidden", label: "Đã ẩn", color: "bg-gray-100 text-gray-600" },
  { key: "featured", label: "Nổi bật", color: "bg-yellow-100 text-yellow-700" },
];

type SortField = "name" | "price" | "stock_quantity" | "created_at";
type SortDir = "asc" | "desc";

interface Props {
  products: any[];
  categories: string[];
}

export default function ProductListClient({ products, categories }: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let result = [...products];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q)
      );
    }

    // Category
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category?.name === categoryFilter);
    }

    // Stock
    if (stockFilter === "out") result = result.filter((p) => p.stock_quantity === 0);
    else if (stockFilter === "low") result = result.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5);
    else if (stockFilter === "in_stock") result = result.filter((p) => p.stock_quantity > 0);

    // Status
    if (statusFilter === "active") result = result.filter((p) => p.is_active);
    else if (statusFilter === "hidden") result = result.filter((p) => !p.is_active);
    else if (statusFilter === "featured") result = result.filter((p) => p.is_featured);

    // Sort
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortField === "name") { aVal = a.name || ""; bVal = b.name || ""; }
      else if (sortField === "price") { aVal = a.price || 0; bVal = b.price || 0; }
      else if (sortField === "stock_quantity") { aVal = a.stock_quantity || 0; bVal = b.stock_quantity || 0; }
      else { aVal = new Date(a.created_at).getTime(); bVal = new Date(b.created_at).getTime(); }

      if (typeof aVal === "string") return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });

    return result;
  }, [products, search, categoryFilter, stockFilter, statusFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  // Counts
  const activeCount = products.filter((p) => p.is_active).length;
  const hiddenCount = products.filter((p) => !p.is_active).length;
  const outCount = products.filter((p) => p.stock_quantity === 0).length;
  const lowCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length;

  return (
    <>
      {/* Quick stat chips */}
      <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap overflow-x-auto pb-1">
        <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
          <Package className="w-3 h-3 inline mr-1" /> {products.length} sản phẩm
        </span>
        <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700">
          <Eye className="w-3 h-3 inline mr-1" /> {activeCount} đang bán
        </span>
        {hiddenCount > 0 && (
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
            <EyeOff className="w-3 h-3 inline mr-1" /> {hiddenCount} ẩn
          </span>
        )}
        {outCount > 0 && (
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700">
            <AlertTriangle className="w-3 h-3 inline mr-1" /> {outCount} hết hàng
          </span>
        )}
        {lowCount > 0 && (
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700">
            <AlertTriangle className="w-3 h-3 inline mr-1" /> {lowCount} sắp hết
          </span>
        )}
      </div>

      {/* Filters row */}
      <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, SKU, danh mục..."
            className="pl-10"
          />
        </div>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-md h-9 px-3 text-sm min-w-[140px]"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Stock filter */}
        <div className="flex gap-1">
          {STOCK_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStockFilter(f.key)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                stockFilter === f.key
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? "bg-gray-800 text-white"
                  : f.color || "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-500 mb-2">{filtered.length}/{products.length} sản phẩm</p>

      {/* Table */}
      <Card className="gap-0 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3 font-medium">
                  <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-green-600">
                    Tên sản phẩm
                    <ArrowUpDown className={`w-3 h-3 ${sortField === "name" ? "text-green-600" : "text-gray-300"}`} />
                  </button>
                </th>
                <th className="p-3 font-medium">Danh mục</th>
                <th className="p-3 font-medium">
                  <button onClick={() => toggleSort("price")} className="flex items-center gap-1 hover:text-green-600">
                    Giá
                    <ArrowUpDown className={`w-3 h-3 ${sortField === "price" ? "text-green-600" : "text-gray-300"}`} />
                  </button>
                </th>
                <th className="p-3 font-medium">
                  <button onClick={() => toggleSort("stock_quantity")} className="flex items-center gap-1 hover:text-green-600">
                    Tồn kho
                    <ArrowUpDown className={`w-3 h-3 ${sortField === "stock_quantity" ? "text-green-600" : "text-gray-300"}`} />
                  </button>
                </th>
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product: any) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {product.is_featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">/{product.unit} {product.sku ? `· ${product.sku}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{product.category?.name || "-"}</td>
                  <td className="p-3">
                    <span className="font-medium">{formatPrice(product.price)}</span>
                    {product.compare_at_price && (
                      <span className="text-xs text-gray-400 line-through ml-1">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${product.stock_quantity === 0 ? "text-red-600" : product.stock_quantity <= 5 ? "text-orange-600" : ""}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Đang bán" : "Ẩn"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/san-pham/${product.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    {search || categoryFilter !== "all" || stockFilter !== "all" || statusFilter !== "all"
                      ? "Không tìm thấy sản phẩm phù hợp"
                      : "Chưa có sản phẩm nào"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
