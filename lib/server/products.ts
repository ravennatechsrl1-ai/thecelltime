import { unstable_cache } from "next/cache";
import { mapProductRow } from "@/lib/map-product";
import { Product } from "@/types";
import { getSupabaseClientSafe } from "@/utils/supabase";

async function loadProductsFromDb(): Promise<Product[]> {
  const supabase = getSupabaseClientSafe();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, phone_listings(base_name, base_name_i18n)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[products/load]", error);
    return [];
  }

  return (data ?? []).map((row) =>
    mapProductRow(row as Record<string, unknown>)
  );
}

export const getProductsCached = unstable_cache(
  loadProductsFromDb,
  ["store-products"],
  { revalidate: 60, tags: ["products"] }
);
