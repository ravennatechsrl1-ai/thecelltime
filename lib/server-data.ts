import { unstable_cache } from "next/cache";
import { CatalogBrand, fetchGlobalBrands } from "@/lib/catalog-brands-sync";
import { mapProductRow } from "@/lib/map-product";
import { Product } from "@/types";
import { getSupabaseClientSafe } from "@/utils/supabase";

export const getCachedBrands = unstable_cache(
  async (): Promise<CatalogBrand[]> => {
    const supabase = getSupabaseClientSafe();
    if (!supabase) return [];
    return fetchGlobalBrands(supabase);
  },
  ["catalog-brands-v1"],
  { revalidate: 300, tags: ["catalog-brands"] }
);

export const getCachedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = getSupabaseClientSafe();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*, phone_listings(base_name, base_name_i18n)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getCachedProducts]", error);
      return [];
    }

    return (data ?? []).map((row) =>
      mapProductRow(row as Record<string, unknown>)
    );
  },
  ["products-list-v1"],
  { revalidate: 60, tags: ["products"] }
);

export const CACHE_HEADERS = {
  products: "public, s-maxage=60, stale-while-revalidate=300",
  brands: "public, s-maxage=300, stale-while-revalidate=600",
} as const;
