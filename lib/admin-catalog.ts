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

export const ACCESSORY_TYPE_SLUGS: Record<AccessoryType, string> = {
  charger: "chargers",
  cable: "cables",
  case: "cases",
  screenProtector: "screen-protectors",
  audio: "audio",
  other: "other",
};

const ACCESSORY_SLUG_TO_TYPE = Object.fromEntries(
  Object.entries(ACCESSORY_TYPE_SLUGS).map(([type, slug]) => [slug, type])
) as Record<string, AccessoryType>;

export const ACCESSORY_MATCH_KEYWORDS: Record<AccessoryType, string[]> = {
  charger: ["charger", "caricatore", "chargeur"],
  cable: ["cable", "cavo", "câble"],
  case: ["case", "cover", "custodia", "coque", "étui", "etui"],
  screenProtector: [
    "screen protector",
    "tempered glass",
    "vetro temperato",
    "pellicola",
    "verre trempé",
    "protection écran",
  ],
  audio: ["audio", "earphone", "headphone", "auricolare", "écouteur", "casque"],
  other: [],
};

export function accessoryTypeToSlug(type: AccessoryType): string {
  return ACCESSORY_TYPE_SLUGS[type];
}

export function accessorySlugToType(slug: string): AccessoryType | null {
  return ACCESSORY_SLUG_TO_TYPE[slug] ?? null;
}

export function productMatchesAccessoryType(
  productName: string,
  type: AccessoryType
): boolean {
  const name = productName.toLowerCase();

  if (type === "other") {
    return ACCESSORY_TYPES.every(
      (otherType) =>
        otherType === "other" ||
        !ACCESSORY_MATCH_KEYWORDS[otherType].some((keyword) =>
          name.includes(keyword.toLowerCase())
        )
    );
  }

  return ACCESSORY_MATCH_KEYWORDS[type].some((keyword) =>
    name.includes(keyword.toLowerCase())
  );
}

export const OTHER_BRAND_DEFAULT = "Other";

export function getPhoneBrandDbName(slug: PhoneBrandSlug): string {
  const config = PHONE_BRANDS.find((b) => b.slug === slug);
  return config?.matchNames[0] ?? slug;
}

export function buildPhoneProductName(
  brandName: string,
  model: string,
  storage: string,
  color?: string
): string {
  const parts = [brandName.trim(), model.trim(), storage.trim(), color?.trim()].filter(
    Boolean
  );
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
