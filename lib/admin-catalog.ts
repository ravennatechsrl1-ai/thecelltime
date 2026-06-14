import { PHONE_BRANDS, PhoneBrandSlug } from "@/lib/phone-brands";

export const PHONE_STORAGE_OPTIONS = [
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
] as const;

export const ACCESSORY_TYPES = [
  "charger",
  "cable",
  "case",
  "screenProtector",
  "audio",
  "other",
] as const;

export type AccessoryType = (typeof ACCESSORY_TYPES)[number];

export const OTHER_BRAND_DEFAULT = "Other";

export function getPhoneBrandDbName(slug: PhoneBrandSlug): string {
  const config = PHONE_BRANDS.find((b) => b.slug === slug);
  return config?.matchNames[0] ?? slug;
}

export function buildPhoneProductName(
  brandName: string,
  model: string,
  storage: string
): string {
  const parts = [brandName.trim(), model.trim(), storage.trim()].filter(Boolean);
  return parts.join(" ");
}

export function buildAccessoryProductName(
  brandName: string,
  typeLabel: string,
  customName: string
): string {
  const base = customName.trim();
  if (base) return base;
  return `${brandName} ${typeLabel}`.trim();
}

export type InventoryTab = "phones" | "accessories" | "other";

export function tabToCategory(tab: InventoryTab): "phones" | "accessories" | "other" {
  return tab;
}
