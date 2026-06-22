import { PHONE_STORAGE_OPTIONS } from "@/lib/admin-catalog";
import { PHONE_BRANDS } from "@/lib/phone-brands";
import {
  PROTECTION_CATALOG,
  PROTECTION_DEVICE_TYPES,
  ProtectionDeviceType,
} from "@/lib/protection-catalog";
import { SupabaseClient } from "@supabase/supabase-js";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_PHONE_MODELS: Record<string, string[]> = {
  apple: [
    "iPhone 17 Pro Max",
    "iPhone 17 Pro",
    "iPhone 17",
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15",
    "iPhone 14",
    "iPhone 13",
    "iPhone SE",
  ],
  samsung: [
    "Galaxy S25 Ultra",
    "Galaxy S25+",
    "Galaxy S25",
    "Galaxy S24 Ultra",
    "Galaxy S24",
    "Galaxy A55",
    "Galaxy A35",
  ],
  google: ["Pixel 9 Pro", "Pixel 9", "Pixel 8a"],
  xiaomi: ["Redmi Note 14", "POCO X7", "Xiaomi 14"],
  huawei: ["Pura 70", "Mate 60"],
  oppo: ["Find X8", "Reno 12"],
  oneplus: ["OnePlus 13", "OnePlus Nord 4"],
  motorola: ["Edge 50", "Moto G85"],
  honor: ["Honor Magic 7", "Honor 200"],
};

/** @deprecated Use ensureCatalogDefaults */
export async function seedCatalogIfEmpty(
  supabase: SupabaseClient
): Promise<boolean> {
  await ensureCatalogDefaults(supabase);
  return true;
}

/** Seed each catalog table independently if empty (safe after partial runs). */
export async function ensureCatalogDefaults(
  supabase: SupabaseClient
): Promise<void> {
  const steps = [
    ensurePhoneBrands,
    ensurePhoneConditions,
    ensurePhoneStorage,
    ensurePhoneColors,
    ensurePhoneModels,
    ensureDeviceCatalog,
  ];

  for (const step of steps) {
    try {
      await step(supabase);
    } catch (error) {
      console.error("[catalog-seed]", step.name, error);
    }
  }
}

async function tableCount(
  supabase: SupabaseClient,
  table: string
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function ensurePhoneBrands(supabase: SupabaseClient): Promise<void> {
  if ((await tableCount(supabase, "catalog_phone_brands")) > 0) return;

  const brandRows = PHONE_BRANDS.map((brand, index) => ({
    slug: brand.slug,
    label: brand.matchNames[0],
    sort_order: index,
  }));

  const { error } = await supabase.from("catalog_phone_brands").insert(brandRows);
  if (error) throw error;
}

async function ensurePhoneConditions(supabase: SupabaseClient): Promise<void> {
  if ((await tableCount(supabase, "catalog_phone_conditions")) > 0) return;

  const { error } = await supabase.from("catalog_phone_conditions").insert([
    { slug: "new", label: "New", shop_group: "new", sort_order: 0 },
    { slug: "used", label: "Grade A Used", shop_group: "used", sort_order: 1 },
  ]);
  if (error) throw error;
}

async function ensurePhoneStorage(supabase: SupabaseClient): Promise<void> {
  if ((await tableCount(supabase, "catalog_phone_storage")) > 0) return;

  const { error } = await supabase.from("catalog_phone_storage").insert(
    PHONE_STORAGE_OPTIONS.map((label, index) => ({
      label,
      sort_order: index,
    }))
  );
  if (error) throw error;
}

const DEFAULT_PHONE_COLORS: { label: string; hex_color: string }[] = [
  { label: "Black", hex_color: "#1a1a1a" },
  { label: "White", hex_color: "#f5f5f5" },
  { label: "Blue", hex_color: "#2563eb" },
  { label: "Pink", hex_color: "#ec4899" },
  { label: "Green", hex_color: "#22c55e" },
  { label: "Gold", hex_color: "#d4af37" },
  { label: "Silver", hex_color: "#c0c0c0" },
  { label: "Purple", hex_color: "#7c3aed" },
  { label: "Red", hex_color: "#ef4444" },
  { label: "Natural Titanium", hex_color: "#e8dcc8" },
];

async function ensurePhoneColors(supabase: SupabaseClient): Promise<void> {
  if ((await tableCount(supabase, "catalog_phone_colors")) > 0) return;

  const { error } = await supabase.from("catalog_phone_colors").insert(
    DEFAULT_PHONE_COLORS.map((color, index) => ({
      label: color.label,
      hex_color: color.hex_color,
      sort_order: index,
    }))
  );
  if (error) throw error;
}

async function ensurePhoneModels(supabase: SupabaseClient): Promise<void> {
  const { data: brands, error: brandsError } = await supabase
    .from("catalog_phone_brands")
    .select("id, slug");
  if (brandsError) throw brandsError;
  if (!brands?.length) return;

  for (const brand of brands) {
    const { count, error: countError } = await supabase
      .from("catalog_phone_models")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brand.id);
    if (countError) throw countError;
    if (count && count > 0) continue;

    const models = DEFAULT_PHONE_MODELS[brand.slug as string];
    if (!models?.length) continue;

    const modelRows = models.map((label, index) => ({
      brand_id: brand.id as string,
      slug: slugify(label),
      label,
      sort_order: index,
    }));

    const { error } = await supabase
      .from("catalog_phone_models")
      .insert(modelRows);
    if (error) throw error;
  }
}

async function ensureDeviceCatalog(supabase: SupabaseClient): Promise<void> {
  if ((await tableCount(supabase, "catalog_device_brands")) > 0) return;

  let brandSort = 0;
  for (const deviceType of PROTECTION_DEVICE_TYPES) {
    const brands = PROTECTION_CATALOG[deviceType as ProtectionDeviceType];
    for (const brand of brands) {
      const { data: deviceBrand, error: deviceBrandError } = await supabase
        .from("catalog_device_brands")
        .insert({
          device_type: deviceType,
          slug: brand.slug,
          label: brand.label,
          sort_order: brandSort++,
        })
        .select("id")
        .single();

      if (deviceBrandError) throw deviceBrandError;

      const seriesMap = new Map<
        string,
        { label: string; models: typeof brand.models }
      >();

      for (const model of brand.models) {
        if (!seriesMap.has(model.seriesSlug)) {
          seriesMap.set(model.seriesSlug, {
            label: model.seriesLabel,
            models: [],
          });
        }
        seriesMap.get(model.seriesSlug)!.models.push(model);
      }

      let seriesSort = 0;
      for (const [seriesSlug, group] of seriesMap.entries()) {
        const { data: series, error: seriesError } = await supabase
          .from("catalog_device_series")
          .insert({
            brand_id: deviceBrand.id,
            slug: seriesSlug,
            label: group.label,
            sort_order: seriesSort++,
          })
          .select("id")
          .single();

        if (seriesError) throw seriesError;

        const deviceModels = group.models.map((model, index) => ({
          series_id: series.id,
          slug: model.slug,
          label: model.label,
          is_recent: model.isRecent ?? false,
          sort_order: index,
        }));

        if (deviceModels.length > 0) {
          const { error: deviceModelError } = await supabase
            .from("catalog_device_models")
            .insert(deviceModels);
          if (deviceModelError) throw deviceModelError;
        }
      }
    }
  }
}

export { slugify };
