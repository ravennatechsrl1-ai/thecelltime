import { SupabaseClient } from "@supabase/supabase-js";
import { ProtectionDeviceType } from "@/lib/protection-catalog";

export interface PhoneBrandOption {
  id: string;
  slug: string;
  label: string;
}

export interface PhoneModelOption {
  id: string;
  brand_id: string;
  slug: string;
  label: string;
}

export interface PhoneConditionOption {
  id: string;
  slug: string;
  label: string;
  shop_group: "new" | "used";
}

export interface PhoneStorageOption {
  id: string;
  label: string;
}

export interface PhoneColorOption {
  id: string;
  label: string;
  hex_color: string;
}

export interface DeviceBrandOption {
  id: string;
  device_type: ProtectionDeviceType;
  slug: string;
  label: string;
}

export interface DeviceSeriesOption {
  id: string;
  brand_id: string;
  slug: string;
  label: string;
}

export interface DeviceModelOption {
  id: string;
  series_id: string;
  slug: string;
  label: string;
  is_recent: boolean;
}

export interface DeviceCatalogTree {
  brands: DeviceBrandOption[];
  series: DeviceSeriesOption[];
  models: DeviceModelOption[];
}

export interface PhoneCatalog {
  brands: PhoneBrandOption[];
  models: PhoneModelOption[];
  conditions: PhoneConditionOption[];
  storage: PhoneStorageOption[];
  colors: PhoneColorOption[];
}

export const EMPTY_PHONE_CATALOG: PhoneCatalog = {
  brands: [],
  models: [],
  conditions: [],
  storage: [],
  colors: [],
};

export const EMPTY_DEVICE_CATALOG: DeviceCatalogTree = {
  brands: [],
  series: [],
  models: [],
};

export function normalizePhoneCatalog(data: unknown): PhoneCatalog {
  if (!data || typeof data !== "object") return EMPTY_PHONE_CATALOG;
  const record = data as Record<string, unknown>;
  return {
    brands: Array.isArray(record.brands)
      ? (record.brands as PhoneBrandOption[])
      : [],
    models: Array.isArray(record.models)
      ? (record.models as PhoneModelOption[])
      : [],
    conditions: Array.isArray(record.conditions)
      ? (record.conditions as PhoneConditionOption[])
      : [],
    storage: Array.isArray(record.storage)
      ? (record.storage as PhoneStorageOption[])
      : [],
    colors: Array.isArray(record.colors)
      ? (record.colors as PhoneColorOption[])
      : [],
  };
}

export function normalizeDeviceCatalog(data: unknown): DeviceCatalogTree {
  if (!data || typeof data !== "object") return EMPTY_DEVICE_CATALOG;
  const record = data as Record<string, unknown>;
  return {
    brands: Array.isArray(record.brands)
      ? (record.brands as DeviceBrandOption[])
      : [],
    series: Array.isArray(record.series)
      ? (record.series as DeviceSeriesOption[])
      : [],
    models: Array.isArray(record.models)
      ? (record.models as DeviceModelOption[])
      : [],
  };
}

export async function fetchPhoneCatalog(supabase: SupabaseClient): Promise<PhoneCatalog> {
  const [brandsRes, modelsRes, conditionsRes, storageRes, colorsRes] = await Promise.all([
    supabase
      .from("catalog_phone_brands")
      .select("*")
      .order("sort_order")
      .order("label"),
    supabase
      .from("catalog_phone_models")
      .select("*")
      .order("sort_order")
      .order("label"),
    supabase
      .from("catalog_phone_conditions")
      .select("*")
      .order("sort_order")
      .order("label"),
    supabase
      .from("catalog_phone_storage")
      .select("*")
      .order("sort_order")
      .order("label"),
    supabase
      .from("catalog_phone_colors")
      .select("*")
      .order("sort_order")
      .order("label"),
  ]);

  if (brandsRes.error) throw brandsRes.error;
  if (modelsRes.error) throw modelsRes.error;
  if (conditionsRes.error) throw conditionsRes.error;
  if (storageRes.error) throw storageRes.error;
  if (colorsRes.error) throw colorsRes.error;

  return {
    brands: (brandsRes.data ?? []) as PhoneBrandOption[],
    models: (modelsRes.data ?? []) as PhoneModelOption[],
    conditions: (conditionsRes.data ?? []) as PhoneConditionOption[],
    storage: (storageRes.data ?? []) as PhoneStorageOption[],
    colors: (colorsRes.data ?? []) as PhoneColorOption[],
  };
}

export async function fetchDeviceCatalog(
  supabase: SupabaseClient,
  deviceType: ProtectionDeviceType
): Promise<DeviceCatalogTree> {
  const { data: brands, error: brandsError } = await supabase
    .from("catalog_device_brands")
    .select("*")
    .eq("device_type", deviceType)
    .order("sort_order")
    .order("label");

  if (brandsError) throw brandsError;

  const brandIds = (brands ?? []).map((b) => b.id as string);
  if (brandIds.length === 0) {
    return { brands: [], series: [], models: [] };
  }

  const { data: series, error: seriesError } = await supabase
    .from("catalog_device_series")
    .select("*")
    .in("brand_id", brandIds)
    .order("sort_order")
    .order("label");

  if (seriesError) throw seriesError;

  const seriesIds = (series ?? []).map((s) => s.id as string);
  if (seriesIds.length === 0) {
    return {
      brands: (brands ?? []) as DeviceBrandOption[],
      series: [],
      models: [],
    };
  }

  const { data: models, error: modelsError } = await supabase
    .from("catalog_device_models")
    .select("*")
    .in("series_id", seriesIds)
    .order("sort_order")
    .order("label");

  if (modelsError) throw modelsError;

  return {
    brands: (brands ?? []) as DeviceBrandOption[],
    series: (series ?? []) as DeviceSeriesOption[],
    models: (models ?? []) as DeviceModelOption[],
  };
}

export function getDeviceSeriesGroups(
  tree: DeviceCatalogTree,
  brandId: string
): { series: DeviceSeriesOption; models: DeviceModelOption[] }[] {
  const brandSeries = tree.series.filter((s) => s.brand_id === brandId);
  return brandSeries.map((series) => ({
    series,
    models: tree.models.filter((m) => m.series_id === series.id),
  }));
}
