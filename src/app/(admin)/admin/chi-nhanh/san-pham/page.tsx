"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Package, Search, ArrowLeft, Save,
  Check, Loader2, Plus, Minus,
} from "lucide-react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import { formatPrice } from "@/lib/format";

interface Branch { id: string; name: string; is_main: boolean }
interface Product { id: string; name: string; price: number; unit: string; stock_quantity: number; category_name: string }
interface BranchProduct { product_id: string; is_available: boolean; stock_quantity: number; price_override: number | null }

// ── Demo ──
const DEMO_BRANCHES: Branch[] = [
  { id: "b1", name: "CN Quận 1 (Chính)", is_main: true },
  { id: "b2", name: "CN Quận 7", is_main: false },
  { id: "b3", name: "CN Thủ Đức", is_main: false },
];
const DEMO_PRODUCTS: Product[] = [
  { id: "p1", name: "Rau muống", price: 8000, unit: "bó", stock_quantity: 100, category_name: "Rau củ quả" },
  { id: "p2", name: "Cà chua", price: 25000, unit: "kg", stock_quantity: 80, category_name: "Rau củ quả" },
  { id: "p3", name: "Khoai tây Đà Lạt", price: 35000, unit: "kg", stock_quantity: 60, category_name: "Rau củ quả" },
  { id: "p4", name: "Bắp cải", price: 18000, unit: "cái", stock_quantity: 50, category_name: "Rau củ quả" },
  { id: "p5", name: "Chuối già Nam Mỹ", price: 32000, unit: "kg", stock_quantity: 70, category_name: "Trái cây" },
  { id: "p6", name: "Cam sành", price: 45000, unit: "kg", stock_quantity: 55, category_name: "Trái cây" },
  { id: "p7", name: "Xoài cát Hoà Lộc", price: 75000, unit: "kg", stock_quantity: 30, category_name: "Trái cây" },
  { id: "p8", name: "Thịt ba chỉ heo", price: 85000, unit: "kg", stock_quantity: 40, category_name: "Thịt tươi" },
  { id: "p9", name: "Ức gà phi lê", price: 65000, unit: "kg", stock_quantity: 45, category_name: "Thịt tươi" },
  { id: "p10", name: "Sườn non bò Úc", price: 195000, unit: "kg", stock_quantity: 20, category_name: "Thịt tươi" },
  { id: "p11", name: "Tôm sú", price: 145000, unit: "kg", stock_quantity: 25, category_name: "Hải sản" },
  { id: "p12", name: "Cá hồi fillet", price: 175000, unit: "kg", stock_quantity: 15, category_name: "Hải sản" },
  { id: "p13", name: "Sữa tươi TH 1L", price: 32000, unit: "hộp", stock_quantity: 100, category_name: "Sữa & Bơ" },
  { id: "p14", name: "Sữa chua Vinamilk lốc 4", price: 28000, unit: "gói", stock_quantity: 80, category_name: "Sữa & Bơ" },
  { id: "p15", name: "Gạo ST25 5kg", price: 135000, unit: "bịch", stock_quantity: 50, category_name: "Đồ khô" },
  { id: "p16", name: "Mì Hảo Hảo thùng 30", price: 105000, unit: "hộp", stock_quantity: 35, category_name: "Đồ khô" },
  { id: "p17", name: "Nước mắm Phú Quốc", price: 55000, unit: "chai", stock_quantity: 60, category_name: "Gia vị" },
  { id: "p18", name: "Dầu ăn Tường An 1L", price: 42000, unit: "chai", stock_quantity: 70, category_name: "Gia vị" },
  { id: "p19", name: "Trà xanh 0 độ 500ml", price: 10000, unit: "chai", stock_quantity: 200, category_name: "Đồ uống" },
  { id: "p20", name: "Cà phê G7 hộp 18 gói", price: 52000, unit: "hộp", stock_quantity: 55, category_name: "Đồ uống" },
];
const DEMO_BP: Record<string, BranchProduct[]> = {
  b1: DEMO_PRODUCTS.map((p) => ({ product_id: p.id, is_available: true, stock_quantity: p.stock_quantity, price_override: null })),
  b2: [
    ...["p1","p2","p3","p5","p6","p8","p9","p13","p14","p15","p16","p17","p18","p19","p20"].map(id => ({ product_id: id, is_available: true, stock_quantity: 30, price_override: null as number | null })),
    { product_id: "p4", is_available: true, stock_quantity: 20, price_override: 20000 },
    { product_id: "p7", is_available: true, stock_quantity: 10, price_override: 80000 },
    { product_id: "p10", is_available: true, stock_quantity: 5, price_override: 205000 },
  ],
  b3: [
    ...["p1","p2","p3","p4","p5","p6","p8","p9","p15","p16","p17","p18","p19","p20"].map(id => ({ product_id: id, is_available: true, stock_quantity: 25, price_override: null as number | null })),
    { product_id: "p7", is_available: true, stock_quantity: 8, price_override: 72000 },
    { product_id: "p13", is_available: true, stock_quantity: 40, price_override: 30000 },
  ],
};

export default function BranchProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>}>
      <Content />
    </Suspense>
  );
}

function Content() {
  const searchParams = useSearchParams();
  const initBranch = searchParams.get("branch") || "";

  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selBranch, setSelBranch] = useState("");
  const [bp, setBp] = useState<Record<string, BranchProduct[]>>({});
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changed, setChanged] = useState(false);

  // ── Load data ──
  useEffect(() => {
    (async () => {
      setLoading(true);
      if (isDemo) {
        setBranches(DEMO_BRANCHES);
        setProducts(DEMO_PRODUCTS);
        setBp(DEMO_BP);
        setSelBranch(initBranch || "b1");
        setLoading(false);
        return;
      }
      try {
        const [brRes, bpRes] = await Promise.all([
          fetch("/api/branches"),
          fetch("/api/branch-products?include=products"),
        ]);
        const brData = await brRes.json();
        const bpData = await bpRes.json();
        const brList = (brData.branches || []).map((b: any) => ({ id: b.id, name: b.name, is_main: b.is_main }));
        setBranches(brList);
        setProducts((bpData.products || []).map((p: any) => ({
          id: p.id, name: p.name, price: p.price, unit: p.unit,
          stock_quantity: p.stock_quantity, category_name: p.category_name || "Khác",
        })));
        const map: Record<string, BranchProduct[]> = {};
        for (const r of bpData.branch_products || []) {
          if (!map[r.branch_id]) map[r.branch_id] = [];
          map[r.branch_id].push({ product_id: r.product_id, is_available: r.is_available, stock_quantity: r.stock_quantity, price_override: r.price_override });
        }
        setBp(map);
        setSelBranch(initBranch && brList.some((b: Branch) => b.id === initBranch) ? initBranch : brList[0]?.id || "");
      } catch { toast.error("Lỗi tải dữ liệu"); }
      setLoading(false);
    })();
  }, []);

  // ── Helpers ──
  const cur = bp[selBranch] || [];
  const bpMap = useMemo(() => new Map(cur.map(b => [b.product_id, b])), [cur]);
  const categories = useMemo(() => [...new Set(products.map(p => p.category_name))].sort(), [products]);

  const grouped = useMemo(() => {
    let list = products;
    if (search) { const q = search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q)); }
    if (catFilter !== "all") list = list.filter(p => p.category_name === catFilter);
    const map: Record<string, Product[]> = {};
    for (const p of list) {
      if (!map[p.category_name]) map[p.category_name] = [];
      map[p.category_name].push(p);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [products, search, catFilter]);

  const activeCount = cur.filter(b => b.is_available).length;

  const toggle = (pid: string) => {
    setChanged(true);
    setBp(prev => {
      const list = [...(prev[selBranch] || [])];
      const idx = list.findIndex(b => b.product_id === pid);
      if (idx >= 0) {
        list[idx] = { ...list[idx], is_available: !list[idx].is_available };
      } else {
        const p = products.find(p => p.id === pid);
        list.push({ product_id: pid, is_available: true, stock_quantity: p?.stock_quantity || 0, price_override: null });
      }
      return { ...prev, [selBranch]: list };
    });
  };

  const setStock = (pid: string, val: number) => {
    setChanged(true);
    setBp(prev => {
      const list = [...(prev[selBranch] || [])];
      const idx = list.findIndex(b => b.product_id === pid);
      if (idx >= 0) list[idx] = { ...list[idx], stock_quantity: Math.max(0, val) };
      return { ...prev, [selBranch]: list };
    });
  };

  const setPrice = (pid: string, val: number | null) => {
    setChanged(true);
    setBp(prev => {
      const list = [...(prev[selBranch] || [])];
      const idx = list.findIndex(b => b.product_id === pid);
      if (idx >= 0) list[idx] = { ...list[idx], price_override: val };
      return { ...prev, [selBranch]: list };
    });
  };

  const addAll = () => {
    setChanged(true);
    setBp(prev => ({
      ...prev,
      [selBranch]: products.map(p => ({ product_id: p.id, is_available: true, stock_quantity: p.stock_quantity, price_override: null })),
    }));
    toast.success("Đã bật tất cả sản phẩm");
  };

  const handleSave = async () => {
    setSaving(true);
    if (isDemo) {
      await new Promise(r => setTimeout(r, 400));
      setSaving(false); setChanged(false);
      toast.info("Demo — kết nối Supabase để lưu thật");
      return;
    }
    try {
      const res = await fetch("/api/branch-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_id: selBranch, items: bp[selBranch] || [] }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setChanged(false);
      toast.success("Đã lưu — web sẽ hiển thị sản phẩm mới");
    } catch (e: any) { toast.error(e.message || "Lỗi lưu"); }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" /> Đang tải...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/chi-nhanh">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" /> Sản phẩm chi nhánh
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Chọn chi nhánh → bật/tắt sản phẩm → Lưu</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !changed}
          className={changed ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 text-gray-500"}>
          {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>

      {/* ── Branch tabs ── */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {branches.map(b => (
          <button key={b.id} onClick={() => setSelBranch(b.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium shrink-0 transition-all ${
              b.id === selBranch ? "bg-green-600 text-white shadow" : "bg-white border text-gray-600 hover:border-green-300"
            }`}>
            <Building2 className="w-3.5 h-3.5" />
            {b.name}
          </button>
        ))}
      </div>

      {/* ── Summary bar ── */}
      <div className="flex items-center gap-4 mb-4 px-1 text-sm">
        <span className="text-gray-500">
          <span className="font-bold text-green-600">{activeCount}</span>/{products.length} sản phẩm đang bán
        </span>
        {cur.length === 0 && (
          <Button size="sm" variant="outline" onClick={addAll} className="text-xs h-7 rounded-lg">
            <Plus className="w-3 h-3 mr-1" /> Bật tất cả
          </Button>
        )}
      </div>

      {/* ── Search + filter ── */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 rounded-lg" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="h-9 px-3 rounded-lg border text-sm bg-white">
          <option value="all">Tất cả</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* ── Product list by category ── */}
      <div className="space-y-4">
        {grouped.map(([catName, prods]) => (
          <div key={catName}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">{catName}</p>
            <div className="space-y-1">
              {prods.map(p => {
                const b = bpMap.get(p.id);
                const on = b?.is_available ?? false;
                const stock = b?.stock_quantity ?? 0;
                const priceOv = b?.price_override ?? null;

                return (
                  <div key={p.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      on ? "bg-white border-green-200" : "bg-gray-50 border-gray-100 opacity-60"
                    }`}>

                    {/* Toggle checkbox */}
                    <button onClick={() => toggle(p.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                        on ? "bg-green-600 border-green-600 text-white" : "border-gray-300 hover:border-green-400"
                      }`}>
                      {on && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {/* Name + price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatPrice(p.price)}/{p.unit}</span>
                        {priceOv !== null && (
                          <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">
                            CN: {formatPrice(priceOv)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stock + price controls (only when ON) */}
                    {on && (
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Stock */}
                        <div className="flex items-center gap-1">
                          <button onClick={() => setStock(p.id, stock - 10)}
                            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                            <Minus className="w-3 h-3" />
                          </button>
                          <input type="number" value={stock}
                            onChange={e => setStock(p.id, parseInt(e.target.value) || 0)}
                            className="w-14 h-7 text-center text-xs border rounded-md" />
                          <button onClick={() => setStock(p.id, stock + 10)}
                            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price override */}
                        <input type="number" placeholder="Giá CN"
                          value={priceOv ?? ""}
                          onChange={e => {
                            const v = e.target.value ? parseInt(e.target.value) : null;
                            setPrice(p.id, v === p.price ? null : v);
                          }}
                          className="w-24 h-7 text-xs text-right border rounded-md px-2 placeholder:text-gray-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Không tìm thấy sản phẩm</p>
          </div>
        )}
      </div>

      {/* ── Floating save bar ── */}
      {changed && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-xl text-sm font-medium flex items-center gap-3 z-50">
          Chưa lưu
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-white text-green-700 hover:bg-green-50 h-7 text-xs font-bold">
            {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
            Lưu ngay
          </Button>
        </div>
      )}
    </div>
  );
}
