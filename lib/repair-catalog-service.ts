import { SupabaseClient } from "@supabase/supabase-js";

export interface RepairTypeOption {
  id: string;
  slug: string;
  label: string;
  base_price: number;
  sort_order: number;
  is_active: boolean;
}

export const EMPTY_REPAIR_TYPES: RepairTypeOption[] = [];

export async function fetchRepairTypes(
  supabase: SupabaseClient,
  options?: { activeOnly?: boolean }
): Promise<RepairTypeOption[]> {
  let query = supabase
    .from("catalog_repair_types")
    .select("*")
    .order("sort_order")
    .order("label");

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    label: row.label as string,
    base_price: Number(row.base_price),
    sort_order: (row.sort_order as number) ?? 0,
    is_active: Boolean(row.is_active),
  }));
}

export function repairTypeLabel(
  slug: string,
  types: RepairTypeOption[],
  fallback?: string
): string {
  const match = types.find((type) => type.slug === slug);
  if (match) return match.label;
  return fallback ?? slug;
}
