import { createClient } from "./server";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_DELIVERY_ZONES, MOCK_BRANCH_PRODUCTS } from "../mock-data";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export async function getCategories() {
  if (isDemo) return MOCK_CATEGORIES;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function getProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}) {
  if (isDemo) {
    let results = [...MOCK_PRODUCTS];
    if (options?.categorySlug) {
      results = results.filter((p) => p.category?.slug === options.categorySlug);
    }
    if (options?.featured) {
      results = results.filter((p) => p.is_featured);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }
    return results;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*)")
      .eq("is_active", true);

    if (options?.featured) {
      query = query.eq("is_featured", true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.search) {
      query = query.ilike("name", `%${options.search}%`);
    }

    const { data } = await query.order("created_at", { ascending: false });

    if (options?.categorySlug && data) {
      return data.filter(
        (p: any) => p.category?.slug === options.categorySlug
      );
    }

    return data ?? [];
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string) {
  if (isDemo) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*)")
      .eq("slug", slug)
      .single();
    return data;
  } catch {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

export async function getCategoryBySlug(slug: string) {
  if (isDemo) {
    return MOCK_CATEGORIES.find((c) => c.slug === slug) || null;
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();
    return data;
  } catch {
    return MOCK_CATEGORIES.find((c) => c.slug === slug) || null;
  }
}

export async function getDeliveryZones() {
  if (isDemo) return MOCK_DELIVERY_ZONES;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("delivery_zones")
      .select("*")
      .eq("is_active", true)
      .order("min_distance_km");
    return data ?? [];
  } catch {
    return MOCK_DELIVERY_ZONES;
  }
}

export interface BranchProductInfo {
  product_id: string;
  is_available: boolean;
  stock_quantity: number;
  price_override: number | null;
}

// Returns map: { [branch_id]: BranchProductInfo[] }
export async function getBranchProducts(): Promise<Record<string, BranchProductInfo[]>> {
  if (isDemo) return MOCK_BRANCH_PRODUCTS;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("branch_products")
      .select("branch_id, product_id, is_available, stock_quantity, price_override")
      .eq("is_available", true);
    if (!data) return {};
    const map: Record<string, BranchProductInfo[]> = {};
    for (const row of data) {
      if (!map[row.branch_id]) map[row.branch_id] = [];
      map[row.branch_id].push({
        product_id: row.product_id,
        is_available: row.is_available,
        stock_quantity: row.stock_quantity,
        price_override: row.price_override,
      });
    }
    return map;
  } catch {
    return {};
  }
}

export async function getOrdersByUser(userId: string) {
  if (isDemo) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getOrderById(orderId: string) {
  if (isDemo) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .single();
    return data;
  } catch {
    return null;
  }
}
