import { SupabaseClient } from "@supabase/supabase-js";
import { PROTECTION_DEVICE_TYPES } from "@/lib/protection-catalog";

export interface CatalogBrand {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Canonical list from catalog_phone_brands (synced across all catalogs). */
export async function fetchGlobalBrands(
  supabase: SupabaseClient
): Promise<CatalogBrand[]> {
  const { data, error } = await supabase
    .from("catalog_phone_brands")
    .select("id, slug, label, sort_order")
    .order("sort_order")
    .order("label");

  if (error) throw error;
  return (data ?? []) as CatalogBrand[];
}

async function ensurePhoneBrandRow(
  supabase: SupabaseClient,
  input: { slug: string; label: string; sort_order: number }
): Promise<CatalogBrand> {
  const { data: existing, error: existingError } = await supabase
    .from("catalog_phone_brands")
    .select("id, slug, label, sort_order")
    .eq("slug", input.slug)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing as CatalogBrand;

  const { data, error } = await supabase
    .from("catalog_phone_brands")
    .insert(input)
    .select("id, slug, label, sort_order")
    .single();

  if (error) throw error;
  return data as CatalogBrand;
}

async function ensureDeviceBrandRow(
  supabase: SupabaseClient,
  input: {
    device_type: string;
    slug: string;
    label: string;
    sort_order: number;
  }
): Promise<void> {
  const { data: existing, error: existingError } = await supabase
    .from("catalog_device_brands")
    .select("id")
    .eq("device_type", input.device_type)
    .eq("slug", input.slug)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return;

  const { error } = await supabase
    .from("catalog_device_brands")
    .insert(input);

  if (error) throw error;
}

/** Insert a brand in catalog_phone_brands only (mobiles / phones shop). */
export async function addPhoneCatalogBrand(
  supabase: SupabaseClient,
  input: { slug: string; label: string; sort_order?: number }
): Promise<CatalogBrand> {
  const slug = input.slug.trim() || slugify(input.label);
  const label = input.label.trim();
  const sort_order = input.sort_order ?? 999;

  if (!slug || !label) {
    throw new Error("Brand slug and label are required.");
  }

  return ensurePhoneBrandRow(supabase, { slug, label, sort_order });
}

/** Insert a brand in catalog_device_brands for one device type (protection / accessories). */
export async function addDeviceCatalogBrand(
  supabase: SupabaseClient,
  input: {
    device_type: string;
    slug: string;
    label: string;
    sort_order?: number;
  }
): Promise<{ id: string; device_type: string; slug: string; label: string }> {
  const slug = input.slug.trim() || slugify(input.label);
  const label = input.label.trim();
  const sort_order = input.sort_order ?? 999;

  if (!slug || !label) {
    throw new Error("Brand slug and label are required.");
  }

  await ensureDeviceBrandRow(supabase, {
    device_type: input.device_type,
    slug,
    label,
    sort_order,
  });

  const { data, error } = await supabase
    .from("catalog_device_brands")
    .select("id, device_type, slug, label")
    .eq("device_type", input.device_type)
    .eq("slug", slug)
    .single();

  if (error || !data) throw error ?? new Error("Brand not found after insert.");
  return data as { id: string; device_type: string; slug: string; label: string };
}

/** Insert a brand in phones + all device-type catalogs (insert-only, no upsert). */
export async function syncBrandGlobally(
  supabase: SupabaseClient,
  input: { slug: string; label: string; sort_order?: number }
): Promise<CatalogBrand> {
  const slug = input.slug.trim() || slugify(input.label);
  const label = input.label.trim();
  const sort_order = input.sort_order ?? 999;

  if (!slug || !label) {
    throw new Error("Brand slug and label are required.");
  }

  const phoneBrand = await ensurePhoneBrandRow(supabase, {
    slug,
    label,
    sort_order,
  });

  for (const deviceType of PROTECTION_DEVICE_TYPES) {
    await ensureDeviceBrandRow(supabase, {
      device_type: deviceType,
      slug,
      label,
      sort_order,
    });
  }

  return phoneBrand;
}

/** Remove device-catalog rows for a brand slug (all device types). */
export async function removeDeviceBrandsBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<void> {
  const normalized = slug.trim();
  if (!normalized) return;

  const { error } = await supabase
    .from("catalog_device_brands")
    .delete()
    .eq("slug", normalized);

  if (error) throw error;
}

/** Remove a brand slug from phones and all device-type catalogs. */
export async function removeBrandGloballyBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<void> {
  const normalized = slug.trim();
  if (!normalized) return;

  const { error: deviceError } = await supabase
    .from("catalog_device_brands")
    .delete()
    .eq("slug", normalized);

  if (deviceError) throw deviceError;

  const { error: phoneError } = await supabase
    .from("catalog_phone_brands")
    .delete()
    .eq("slug", normalized);

  if (phoneError) throw phoneError;
}

/** Ensure every brand exists in phones + all device catalogs. */
export async function ensureBrandsSynced(
  supabase: SupabaseClient
): Promise<void> {
  const [{ data: phoneBrands }, { data: deviceBrands }] = await Promise.all([
    supabase.from("catalog_phone_brands").select("slug, label, sort_order"),
    supabase.from("catalog_device_brands").select("slug, label, sort_order"),
  ]);

  const bySlug = new Map<string, { label: string; sort_order: number }>();

  for (const row of phoneBrands ?? []) {
    bySlug.set(row.slug as string, {
      label: row.label as string,
      sort_order: (row.sort_order as number) ?? 999,
    });
  }

  for (const row of deviceBrands ?? []) {
    const slug = row.slug as string;
    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        label: row.label as string,
        sort_order: (row.sort_order as number) ?? 999,
      });
    }
  }

  for (const [slug, meta] of bySlug) {
    const hasPhone = phoneBrands?.some((b) => b.slug === slug);
    const deviceCount =
      deviceBrands?.filter((b) => b.slug === slug).length ?? 0;

    if (!hasPhone || deviceCount < PROTECTION_DEVICE_TYPES.length) {
      await syncBrandGlobally(supabase, {
        slug,
        label: meta.label,
        sort_order: meta.sort_order,
      });
    }
  }
}

export { slugify };
