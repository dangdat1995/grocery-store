export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProducts, getCategories, getBranchProducts } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/format";
import { DELIVERY_TIERS } from "@/lib/constants";
import ComboSection from "@/components/store/ComboSection";
import QuickNav from "@/components/store/QuickNav";
import StoreSections from "@/components/store/StoreSections";
import HeroBanner from "@/components/store/HeroBanner";
import { getStoreSettings } from "@/lib/supabase/store-settings";


async function getActiveCombos() {
  const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  if (isDemo) {
    return [
      {
        id: "c1", name: "Combo Bếp Nhà", description: "Gạo + Nước mắm + Rau + Thịt - đủ 1 bữa cơm",
        combo_price: 120000, original_price: 155000, image_url: null,
        items: [
          { product_id: "1", product_name: "Gạo ST25 5kg", quantity: 1, price: 65000 },
          { product_id: "2", product_name: "Nước mắm Phú Quốc", quantity: 1, price: 45000 },
          { product_id: "3", product_name: "Rau muống tươi", quantity: 1, price: 15000 },
          { product_id: "4", product_name: "Thịt ba chỉ 500g", quantity: 1, price: 30000 },
        ],
      },
      {
        id: "c2", name: "Combo Đồ uống", description: "Sữa + Nước cam + Trà xanh",
        combo_price: 85000, original_price: 110000, image_url: null,
        items: [
          { product_id: "5", product_name: "Sữa tươi TH 1L", quantity: 2, price: 32000 },
          { product_id: "6", product_name: "Nước cam ép 1L", quantity: 1, price: 28000 },
          { product_id: "7", product_name: "Trà xanh đóng chai", quantity: 2, price: 9000 },
        ],
      },
    ];
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("combos")
      .select("*, items:combo_items(*, product:products(id, name, slug, price, unit, stock_quantity, is_active, images:product_images(url, sort_order, is_primary)))")
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("created_at", { ascending: false });
    return (data || []).map((c: any) => ({
      ...c,
      items: (c.items || []).map((it: any) => ({
        product_id: it.product_id,
        product_name: it.product?.name || "",
        quantity: it.quantity,
        price: it.product?.price || 0,
        product: it.product,
      })),
    }));
  } catch { return []; }
}

async function getActiveBranches() {
  const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  if (isDemo) {
    return [
      { id: "b1", name: "Chi nhánh chính - Quận 1", slug: "cn1", phone: "0901234567", address: "123 Nguyễn Huệ", ward: "Bến Nghé", district: "Quận 1", city: "TP. Hồ Chí Minh", latitude: 10.7731, longitude: 106.7030, delivery_radius_km: 20, opening_time: "06:00", closing_time: "21:00", is_main: true, is_active: true, manager_name: null, manager_phone: null, created_at: "", updated_at: "" },
      { id: "b2", name: "Chi nhánh Quận 7", slug: "cn7", phone: "0912345678", address: "456 Nguyễn Thị Thập", ward: "Tân Phong", district: "Quận 7", city: "TP. Hồ Chí Minh", latitude: 10.7340, longitude: 106.7218, delivery_radius_km: 15, opening_time: "06:30", closing_time: "21:30", is_main: false, is_active: true, manager_name: null, manager_phone: null, created_at: "", updated_at: "" },
      { id: "b3", name: "Chi nhánh Thủ Đức", slug: "cntd", phone: "0923456789", address: "789 Võ Văn Ngân", ward: "Linh Chiểu", district: "TP. Thủ Đức", city: "TP. Hồ Chí Minh", latitude: 10.8512, longitude: 106.7592, delivery_radius_km: 15, opening_time: "07:00", closing_time: "21:00", is_main: false, is_active: true, manager_name: null, manager_phone: null, created_at: "", updated_at: "" },
    ];
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.from("branches").select("*").eq("is_active", true).order("is_main", { ascending: false });
    return data || [];
  } catch { return []; }
}

async function getActiveGifts() {
  const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  if (isDemo) {
    return [
      { id: "g1", name: "Tặng túi nilon", gift_description: "Tặng 1 túi nilon thân thiện môi trường", condition_type: "any_product", condition_value: null, min_order_amount: 0 },
      { id: "g2", name: "Quà đơn 300k", gift_description: "Tặng 1 bịch khăn giấy cao cấp", condition_type: "min_amount", condition_value: "300000", min_order_amount: 300000 },
    ];
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("gift_promotions")
      .select("id, name, gift_description, condition_type, condition_value, min_order_amount")
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`);
    return data || [];
  } catch { return []; }
}

export default async function HomePage() {
  const [allProducts, categories, settings, combos, gifts, branches, branchProducts] = await Promise.all([
    getProducts({ limit: 50 }),
    getCategories(),
    getStoreSettings(),
    getActiveCombos(),
    getActiveGifts(),
    getActiveBranches(),
    getBranchProducts(),
  ]);

  // For QuickNav counts (unfiltered)
  const saleProducts = allProducts.filter(
    (p: any) => p.compare_at_price && p.compare_at_price > p.price
  );

  return (
    <div>
      {/* Hero Banner - Ultra Compact with Branch Selector */}
      <HeroBanner settings={settings} branches={branches} />

      {/* ===== QUICK NAV - Sale | Combo | Quà tặng | Danh mục ===== */}
      <QuickNav
        categories={categories}
        saleCount={saleProducts.length}
        comboCount={combos.length}
        giftCount={gifts.length}
      />

      {/* ===== Product sections — filtered by selected branch ===== */}
      <StoreSections allProducts={allProducts} categories={categories} branchProducts={branchProducts}>
        {/* Combo + gifts slot (between sale and featured) */}
        <div id="combo" className="scroll-mt-28">
          <ComboSection combos={combos} gifts={gifts} />
        </div>
      </StoreSections>

      {/* ===== 5. PHÍ GIAO HÀNG + CHI NHÁNH (gộp chung) ===== */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery fees */}
            <div>
              <h3 className="text-base font-extrabold mb-3">Phí giao hàng</h3>
              <div className="grid grid-cols-2 gap-2">
                {DELIVERY_TIERS.map((tier, i) => (
                  <div
                    key={tier.maxKm}
                    className={`px-3 py-2.5 text-center rounded-xl border bg-white ${
                      i === 0 ? "border-green-200" : "border-gray-100"
                    }`}
                  >
                    <p className="text-lg font-extrabold text-green-600">
                      {tier.fee === 0 ? "FREE" : formatPrice(tier.fee)}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {i === 0 ? `0-${tier.maxKm}km` : `${DELIVERY_TIERS[i - 1].maxKm}-${tier.maxKm}km`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Branches inline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-extrabold">Chi nhánh</h3>
                <Link href="/chi-nhanh" className="text-blue-600 text-xs font-medium flex items-center gap-0.5">
                  Bản đồ <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2">
                {branches.slice(0, 3).map((b: any) => (
                  <div key={b.id} className="flex items-center gap-3 bg-white rounded-xl border px-3 py-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${b.is_main ? "bg-amber-100" : "bg-blue-100"}`}>
                      <span className="text-sm">{b.is_main ? "⭐" : "🏪"}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">{b.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{b.address}, {b.district}</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 font-medium hover:underline shrink-0"
                    >
                      Chỉ đường
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <div>
            <h3 className="text-lg font-extrabold text-white">Đặt hàng ngay hôm nay</h3>
            <p className="text-white/60 text-xs">Tạo tài khoản miễn phí, chọn sản phẩm và nhận hàng tận cửa</p>
          </div>
          <Link href="/san-pham">
            <Button className="bg-white text-green-700 hover:bg-green-50 font-bold rounded-xl shadow-lg h-10 px-6 text-sm shrink-0">
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Mua sắm ngay
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
