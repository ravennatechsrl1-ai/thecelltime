export type PhoneBrandSlug =
  | "apple"
  | "samsung"
  | "google"
  | "xiaomi"
  | "huawei"
  | "oppo"
  | "oneplus"
  | "motorola"
  | "honor";

export interface PhoneBrandConfig {
  slug: PhoneBrandSlug;
  labelKey:
    | "brandApple"
    | "brandSamsung"
    | "brandGoogle"
    | "brandXiaomi"
    | "brandHuawei"
    | "brandOppo"
    | "brandOnePlus"
    | "brandMotorola"
    | "brandHonor";
  matchNames: string[];
}

export const PHONE_BRANDS: PhoneBrandConfig[] = [
  { slug: "apple", labelKey: "brandApple", matchNames: ["Apple"] },
  { slug: "samsung", labelKey: "brandSamsung", matchNames: ["Samsung"] },
  { slug: "google", labelKey: "brandGoogle", matchNames: ["Google"] },
  { slug: "xiaomi", labelKey: "brandXiaomi", matchNames: ["Xiaomi"] },
  { slug: "huawei", labelKey: "brandHuawei", matchNames: ["Huawei"] },
  { slug: "oppo", labelKey: "brandOppo", matchNames: ["Oppo"] },
  { slug: "oneplus", labelKey: "brandOnePlus", matchNames: ["OnePlus"] },
  { slug: "motorola", labelKey: "brandMotorola", matchNames: ["Motorola"] },
  { slug: "honor", labelKey: "brandHonor", matchNames: ["Honor"] },
];

export function isPhoneBrandSlug(value: string): value is PhoneBrandSlug {
  return PHONE_BRANDS.some((brand) => brand.slug === value);
}

export function productMatchesBrand(
  productBrand: string,
  slug: PhoneBrandSlug
): boolean {
  const config = PHONE_BRANDS.find((brand) => brand.slug === slug);
  if (!config) return false;
  const normalized = productBrand.trim().toLowerCase();
  return config.matchNames.some(
    (name) => name.toLowerCase() === normalized
  );
}

export function shopBrandHref(
  filter: "phones-new" | "phones-used",
  slug: PhoneBrandSlug
): string {
  return filter === "phones-new"
    ? `/shop/phones/new/${slug}`
    : `/shop/phones/used/${slug}`;
}
