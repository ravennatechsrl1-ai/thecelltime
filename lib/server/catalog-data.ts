import { unstable_cache } from "next/cache";
import { fetchGlobalBrands } from "@/lib/catalog-brands-sync";
import { mapProductRow } from "@/lib/map-product";
import { Product } from "@/types";
import { getSupabaseClientSafe } from "@/utils/supabase";

export const getCachedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = getSupabaseClientSafe();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getCachedProducts]", error);
      return [];
    }

    return (data ?? []).map((row) =>
      mapProductRow(row as Record<string, unknown>)
    );
  },
  ["store-products"],
  { revalidate: 60, tags: ["products"] }
);

export const getCachedCatalogBrands = unstable_cache(
  async () => {
    const supabase = getSupabaseClientSafe();
    if (!supabase) return [];

    try {
      return await fetchGlobalBrands(supabase);
    } catch (error) {
      console.error("[getCachedCatalogBrands]", error);
      return [];
    }
  },
  ["store-catalog-brands"],
  { revalidate: 300, tags: ["catalog-brands"] }
);
