import { unstable_cache } from "next/cache";
import {
  CatalogBrand,
  fetchGlobalBrands,
} from "@/lib/catalog-brands-sync";
import {
  fetchPhoneCatalog,
  PhoneCatalog,
  EMPTY_PHONE_CATALOG,
} from "@/lib/catalog-service";
import { getSupabaseClientSafe } from "@/utils/supabase";

async function loadBrandsFromDb(): Promise<CatalogBrand[]> {
  const supabase = getSupabaseClientSafe();
  if (!supabase) return [];

  try {
    return await fetchGlobalBrands(supabase);
  } catch (error) {
    console.error("[catalog/brands/load]", error);
    return [];
  }
}

async function loadPhoneCatalogFromDb(): Promise<PhoneCatalog> {
  const supabase = getSupabaseClientSafe();
  if (!supabase) return EMPTY_PHONE_CATALOG;

  try {
    return await fetchPhoneCatalog(supabase);
  } catch (error) {
    console.error("[catalog/phones/load]", error);
    return EMPTY_PHONE_CATALOG;
  }
}

export const getCatalogBrandsCached = unstable_cache(
  loadBrandsFromDb,
  ["store-catalog-brands"],
  { revalidate: 300, tags: ["catalog-brands"] }
);

export const getPhoneCatalogCached = unstable_cache(
  loadPhoneCatalogFromDb,
  ["store-phone-catalog"],
  { revalidate: 300, tags: ["catalog-brands", "catalog-phones"] }
);
