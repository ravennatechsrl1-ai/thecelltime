import { unstable_cache } from "next/cache";
import {
  fetchRepairTypes,
  RepairTypeOption,
} from "@/lib/repair-catalog-service";
import { getSupabaseClientSafe } from "@/utils/supabase";

async function loadActiveRepairTypes(): Promise<RepairTypeOption[]> {
  const supabase = getSupabaseClientSafe();
  if (!supabase) return [];

  try {
    return await fetchRepairTypes(supabase, { activeOnly: true });
  } catch (error) {
    console.error("[catalog/repairs/load]", error);
    return [];
  }
}

export const getRepairTypesCached = unstable_cache(
  loadActiveRepairTypes,
  ["store-repair-types"],
  { revalidate: 300, tags: ["catalog-repairs"] }
);
