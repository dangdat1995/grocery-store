import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/san-pham`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/dang-nhap`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic pages would be fetched from Supabase when connected
  // const supabase = await createClient();
  // const { data: products } = await supabase.from("products").select("slug, updated_at").eq("is_active", true);
  // const { data: categories } = await supabase.from("categories").select("slug, updated_at").eq("is_active", true);

  return staticPages;
}
