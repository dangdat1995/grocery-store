"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import {
  Search, Package, AlertTriangle,
  PackagePlus, X, Loader2, Building2, ChevronDown,
  Clock, ShieldAlert, CalendarClock, Trash2,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──
interface Batch {
  id: string;
  batch_code: string | null;
  quantity: number;
  remaining: number;
  cost_price: number;
  expiry_date: string | null;
  received_at: string;
  note: string | null;
}
interface ProductInv {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  stock_quantity: number;
  price: number;
  category_name: string;
  batches: Batch[];
}
interface Branch { id: string; name: string; is_main: boolean }

// ── Helpers ──
function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function stockColor(qty: number) {
  if (qty === 0) return "text-red-600";
  if (qty <= 5) return "text-orange-600";
  if (qty <= 20) return "text-yellow-600";
  return "text-green-600";
}

function expiryBadge(days: number | null) {
  if (days === null) return null;
  if (days < 0) return { text: `Hết hạn ${-days} ngày`, cls: "bg-red-100 text-red-700", level: "expired" as const };
  if (days === 0) return { text: "Hết hạn hôm nay", cls: "bg-red-100 text-red-700", level: "expired" as const };
  if (days <= 3) return { text: `Còn ${days} ngày`, cls: "bg-red-100 text-red-700", level: "critical" as const };
  if (days <= 7) return { text: `Còn ${days} ngày`, cls: "bg-orange-100 text-orange-700", level: "warning" as const };
  if (days <= 30) return { text: `Còn ${days} ngày`, cls: "bg-yellow-100 text-yellow-700", level: "notice" as const };
  return { text: `Còn ${days} ngày`, cls: "bg-green-100 text-green-700", level: "ok" as const };
}

function nearestExpiry(batches: Batch[]): number | null {
  const dates = batches.filter(b => b.expiry_date && b.remaining > 0).map(b => daysUntil(b.expiry_date!)!);
  return dates.length ? Math.min(...dates) : null;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Component ──
interface Props {
  products: ProductInv[];
  branches: Branch[];
  isDemo: boolean;
}

type Tab = "all" | "expiry" | "low" | "out";

export default function InventoryClient({ products, branches, isDemo }: Props) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [showImport, setShowImport] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expiryRange, setExpiryRange] = useState<"all" | "expired" | "3d" | "7d" | "30d">("all");

  // ── Counts ──
  const allBatches = products.flatMap(p => p.batches.filter(b => b.remaining > 0 && b.expiry_date));
  const expiredBatches = allBatches.filter(b => daysUntil(b.expiry_date)! <= 0);
  const expiring3d = allBatches.filter(b => { const d = daysUntil(b.expiry_date)!; return d > 0 && d <= 3; });
  const expiring7d = allBatches.filter(b => { const d = daysUntil(b.expiry_date)!; return d > 0 && d <= 7; });
  const expiring30d = allBatches.filter(b => { const d = daysUntil(b.expiry_date)!; return d > 0 && d <= 30; });

  const outCount = products.filter(p => p.stock_quantity === 0).length;
  const lowCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const expiryAlertCount = expiredBatches.length + expiring7d.length;

  // ── Filter ──
  const filtered = useMemo(() => {
    let list = [...products];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
    }

    if (tab === "out") list = list.filter(p => p.stock_quantity === 0);
    else if (tab === "low") list = list.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
    else if (tab === "expiry") {
      // Only show products that have batches matching the expiry range
      list = list.filter(p => {
        const batchesWithExp = p.batches.filter(b => b.remaining > 0 && b.expiry_date);
        if (batchesWithExp.length === 0) return false;
        if (expiryRange === "all") return batchesWithExp.some(b => daysUntil(b.expiry_date)! <= 30);
        if (expiryRange === "expired") return batchesWithExp.some(b => daysUntil(b.expiry_date)! <= 0);
        if (expiryRange === "3d") return batchesWithExp.some(b => { const d = daysUntil(b.expiry_date)!; return d > 0 && d <= 3; });
        if (expiryRange === "7d") return batchesWithExp.some(b => { const d = daysUntil(b.expiry_date)!; return d > 0 && d <= 7; });
        if (expiryRange === "30d") return batchesWithExp.some(b => { const d = daysUntil(b.expiry_date)!; return d > 0 && d <= 30; });
        return true;
      });
    }

    // Sort based on tab
    if (tab === "expiry") {
      list.sort((a, b) => (nearestExpiry(a.batches) ?? 9999) - (nearestExpiry(b.batches) ?? 9999));
    } else {
      list.sort((a, b) => {
        if (a.stock_quantity === 0 && b.stock_quantity !== 0) return -1;
        if (b.stock_quantity === 0 && a.stock_quantity !== 0) return 1;
        if (a.stock_quantity <= 5 && b.stock_quantity > 5) return -1;
        if (b.stock_quantity <= 5 && a.stock_quantity > 5) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return list;
  }, [products, search, tab, expiryRange]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" /> Quản lý kho
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{products.length} sản phẩm · tồn kho, lô hàng & hạn sử dụng</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/chi-nhanh/san-pham">
            <Button variant="outline" size="sm" className="text-xs">
              <Building2 className="w-3.5 h-3.5 mr-1" /> Kho chi nhánh
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowImport(!showImport)} className="bg-green-600 hover:bg-green-700 text-xs">
            <PackagePlus className="w-3.5 h-3.5 mr-1" /> Nhập hàng
          </Button>
        </div>
      </div>

      {isDemo && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
          <strong>Demo</strong> — kết nối Supabase để quản lý kho thực tế
        </div>
      )}

      {/* ── Expiry alert banner ── */}
      {(expiredBatches.length > 0 || expiring3d.length > 0) && tab !== "expiry" && (
        <button onClick={() => { setTab("expiry"); setExpiryRange("all"); }}
          className="w-full mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-left hover:bg-red-100 transition-colors">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Cảnh báo hạn sử dụng</p>
              <p className="text-xs text-red-500 mt-0.5">
                {expiredBatches.length > 0 && <span className="font-bold">{expiredBatches.length} lô đã hết hạn</span>}
                {expiredBatches.length > 0 && expiring3d.length > 0 && " · "}
                {expiring3d.length > 0 && <span>{expiring3d.length} lô hết hạn trong 3 ngày</span>}
              </p>
            </div>
            <span className="text-xs text-red-400 font-medium">Xem chi tiết →</span>
          </div>
        </button>
      )}

      {/* ── Import form ── */}
      {showImport && <ImportForm products={products} isDemo={isDemo} onClose={() => setShowImport(false)} />}

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 mb-3">
        {([
          { key: "all" as Tab, label: "Tất cả", count: products.length, color: "text-gray-400", icon: Package },
          { key: "expiry" as Tab, label: "Hạn sử dụng", count: expiryAlertCount, color: "text-red-500", icon: CalendarClock },
          { key: "low" as Tab, label: "Sắp hết", count: lowCount, color: "text-orange-600", icon: AlertTriangle },
          { key: "out" as Tab, label: "Hết hàng", count: outCount, color: "text-red-600", icon: ShieldAlert },
        ]).map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); if (t.key === "expiry") setExpiryRange("all"); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs ${tab === t.key ? "text-gray-300" : t.color}`}>{t.count}</span>
            )}
          </button>
        ))}

        <div className="relative flex-1 ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Tìm tên, SKU..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-lg" />
        </div>
      </div>

      {/* ── Expiry sub-filters (only when expiry tab active) ── */}
      {tab === "expiry" && (
        <div className="flex gap-1.5 mb-4">
          {([
            { key: "all" as const, label: "Tất cả ≤30 ngày", count: expiring30d.length + expiredBatches.length },
            { key: "expired" as const, label: "Đã hết hạn", count: expiredBatches.length, cls: "text-red-600" },
            { key: "3d" as const, label: "≤ 3 ngày", count: expiring3d.length, cls: "text-red-500" },
            { key: "7d" as const, label: "≤ 7 ngày", count: expiring7d.length, cls: "text-orange-600" },
            { key: "30d" as const, label: "≤ 30 ngày", count: expiring30d.length, cls: "text-yellow-600" },
          ]).map(f => (
            <button key={f.key} onClick={() => setExpiryRange(f.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                expiryRange === f.key ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}>
              {f.label}
              <span className={`ml-1 ${expiryRange === f.key ? "text-red-200" : f.cls || "text-gray-400"}`}>{f.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Product list ── */}
      <div className="space-y-2">
        {filtered.map(p => {
          const exp = nearestExpiry(p.batches);
          const expBdg = expiryBadge(exp);
          const isExpanded = expanded === p.id;
          const expiringBatchesOfP = p.batches.filter(b => b.remaining > 0 && b.expiry_date && daysUntil(b.expiry_date)! <= 30);

          // Card border color: expiry tab prioritizes expiry colors
          const borderCls = tab === "expiry"
            ? (exp !== null && exp <= 0 ? "bg-red-50 border-red-300" :
               exp !== null && exp <= 3 ? "bg-red-50 border-red-200" :
               exp !== null && exp <= 7 ? "bg-orange-50 border-orange-200" :
               "bg-yellow-50 border-yellow-200")
            : (p.stock_quantity === 0 ? "bg-red-50 border-red-200" :
               p.stock_quantity <= 5 || (exp !== null && exp <= 7) ? "bg-orange-50 border-orange-200" :
               "bg-white border-gray-200");

          return (
            <div key={p.id} className={`rounded-xl border transition-all ${borderCls}`}>
              {/* Main row */}
              <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : p.id)}>

                {/* Icon */}
                {tab === "expiry" ? (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    exp !== null && exp <= 3 ? "bg-red-200" : exp !== null && exp <= 7 ? "bg-orange-100" : "bg-yellow-100"
                  }`}>
                    <CalendarClock className={`w-4 h-4 ${
                      exp !== null && exp <= 3 ? "text-red-600" : exp !== null && exp <= 7 ? "text-orange-500" : "text-yellow-600"
                    }`} />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    p.stock_quantity === 0 ? "bg-red-100" : p.stock_quantity <= 5 ? "bg-orange-100" : "bg-green-100"
                  }`}>
                    {p.stock_quantity === 0 ? <ShieldAlert className="w-4 h-4 text-red-500" /> :
                     p.stock_quantity <= 5 ? <AlertTriangle className="w-4 h-4 text-orange-500" /> :
                     <Package className="w-4 h-4 text-green-600" />}
                  </div>
                )}

                {/* Name + expiry info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    {p.sku && <span className="text-[10px] text-gray-400 font-mono">{p.sku}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{p.category_name}</span>
                    {expBdg && (
                      <Badge className={`text-[10px] px-1.5 py-0 ${expBdg.cls}`}>
                        <Clock className="w-2.5 h-2.5 mr-0.5" />{expBdg.text}
                      </Badge>
                    )}
                    {tab === "expiry" && expiringBatchesOfP.length > 1 && (
                      <span className="text-[10px] text-gray-400">{expiringBatchesOfP.length} lô</span>
                    )}
                  </div>
                </div>

                {/* Stock */}
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold ${stockColor(p.stock_quantity)}`}>{p.stock_quantity}</p>
                  <p className="text-[10px] text-gray-400">{p.unit}</p>
                </div>

                {/* Price */}
                <div className="text-right shrink-0 w-20 hidden sm:block">
                  <p className="text-xs font-medium text-gray-600">{formatPrice(p.price)}</p>
                </div>

                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>

              {/* Expanded: batch details */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100">
                  {p.batches.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">Chưa có lô hàng nào</p>
                  ) : (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Lô hàng ({p.batches.length})</p>
                      {p.batches
                        .sort((a, b) => (daysUntil(a.expiry_date) ?? 9999) - (daysUntil(b.expiry_date) ?? 9999))
                        .map(b => {
                        const bExp = daysUntil(b.expiry_date);
                        const bBadge = expiryBadge(bExp);
                        const isExpired = bExp !== null && bExp <= 0;
                        const isCritical = bExp !== null && bExp > 0 && bExp <= 3;

                        return (
                          <div key={b.id} className={`flex items-center gap-3 rounded-lg px-2.5 py-2 border text-xs ${
                            isExpired ? "bg-red-50 border-red-200" :
                            isCritical ? "bg-red-50 border-red-100" :
                            "bg-white border-gray-100"
                          }`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-700">{b.batch_code || "—"}</p>
                                {isExpired && <Trash2 className="w-3 h-3 text-red-400" />}
                              </div>
                              {b.note && <p className="text-[10px] text-gray-400 truncate">{b.note}</p>}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold">{b.remaining}</span>
                              <span className="text-gray-400">/{b.quantity}</span>
                            </div>
                            <div className="text-right w-16 shrink-0 hidden sm:block">
                              <p className="text-gray-500">{formatPrice(b.cost_price)}</p>
                            </div>
                            <div className="shrink-0 w-24 text-right">
                              {b.expiry_date ? (
                                <div>
                                  <p className="text-[10px] text-gray-500">{fmtDate(b.expiry_date)}</p>
                                  {bBadge && <Badge className={`text-[10px] px-1.5 py-0 mt-0.5 ${bBadge.cls}`}>{bBadge.text}</Badge>}
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-300">Không HSD</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            {tab === "expiry" ? (
              <>
                <CalendarClock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Không có lô hàng nào sắp hết hạn</p>
              </>
            ) : (
              <>
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Không tìm thấy sản phẩm</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Import form ──
function ImportForm({ products, isDemo, onClose }: { products: ProductInv[]; isDemo: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    product_id: "", batch_code: "", quantity: "", cost_price: "", expiry_date: "", note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity) { toast.error("Chọn sản phẩm và nhập số lượng"); return; }

    if (isDemo) {
      const p = products.find(p => p.id === form.product_id);
      toast.success(`Demo: Nhập ${form.quantity} ${p?.unit || ""} ${p?.name || ""}`);
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inventory/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: form.product_id,
          batch_code: form.batch_code || `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
          quantity: parseInt(form.quantity),
          cost_price: parseInt(form.cost_price) || 0,
          expiry_date: form.expiry_date || null,
          note: form.note || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Đã nhập hàng");
      onClose();
      window.location.reload();
    } catch (err: any) { toast.error(err.message || "Lỗi nhập hàng"); }
    setLoading(false);
  };

  return (
    <Card className="gap-0 p-4 mb-4 border-green-200 bg-green-50/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-1.5">
          <PackagePlus className="w-4 h-4 text-green-600" /> Nhập lô hàng mới
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0"><X className="w-4 h-4" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label className="text-xs">Sản phẩm *</Label>
          <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}
            className="w-full mt-1 h-9 px-3 rounded-lg border text-sm bg-white" required>
            <option value="">-- Chọn sản phẩm --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} {p.unit})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <Label className="text-xs">Số lượng *</Label>
            <Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
              placeholder="100" className="mt-1 h-9" required />
          </div>
          <div>
            <Label className="text-xs">Giá nhập (VND)</Label>
            <Input type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })}
              placeholder="50000" className="mt-1 h-9" />
          </div>
          <div>
            <Label className="text-xs">Hạn sử dụng</Label>
            <Input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })}
              className="mt-1 h-9" />
          </div>
          <div>
            <Label className="text-xs">Mã lô</Label>
            <Input value={form.batch_code} onChange={e => setForm({ ...form, batch_code: e.target.value })}
              placeholder="Tự tạo" className="mt-1 h-9" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
            placeholder="Ghi chú (tuỳ chọn)" className="h-9 flex-1" />
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 h-9 px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4 mr-1" />}
            Nhập
          </Button>
        </div>
      </form>
    </Card>
  );
}
