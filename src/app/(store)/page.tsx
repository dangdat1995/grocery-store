export const dynamic = "force-dynamic";

import { getProducts, getCategories, getBranchProducts } from "@/lib/supabase/queries";
import ComboSection from "@/components/store/ComboSection";
import StoreSections from "@/components/store/StoreSections";
import HeroZone from "@/components/store/HeroZone";
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
  const [allProducts, categories, , combos, gifts, branchProducts] = await Promise.all([
    getProducts({ limit: 50 }),
    getCategories(),
    getStoreSettings(),
    getActiveCombos(),
    getActiveGifts(),
    getBranchProducts(),
  ]);

  return (
    <div className="bg-[#F5F5FA]">
      {/* ===== HERO ZONE: Banner + Categories + Vouchers + Promo Cards ===== */}
      <HeroZone categories={categories} />

      {/* ===== FLASH SALE + PRODUCTS ===== */}
      <StoreSections allProducts={allProducts} categories={categories} branchProducts={branchProducts}>
        <div id="combo" className="scroll-mt-28">
          <ComboSection combos={combos} gifts={gifts} />
        </div>
      </StoreSections>

    </div>
  );
}
