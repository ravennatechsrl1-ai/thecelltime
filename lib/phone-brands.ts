import { Product } from "@/types";

/** Any catalog brand slug (admin-managed, not hardcoded). */
export type BrandSlug = string;

/** @deprecated Use BrandSlug — kept for existing imports. */
export type PhoneBrandSlug = BrandSlug;

export interface PhoneBrandConfig {
  slug: BrandSlug;
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

/** Default seed brands — storefront uses DB catalog after sync. */
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

const KNOWN_LOGO_SLUGS = new Set(PHONE_BRANDS.map((brand) => brand.slug));

export function hasBrandLogo(slug: string): boolean {
  return KNOWN_LOGO_SLUGS.has(slug);
}

export function isBrandSlug(value: string): value is BrandSlug {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function isPhoneBrandSlug(value: string): value is PhoneBrandSlug {
  return isBrandSlug(value);
}

function slugifyBrand(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productMatchesBrand(
  productBrand: string,
  slug: BrandSlug,
  catalogLabel?: string
): boolean {
  const normalized = productBrand.trim().toLowerCase();

  if (catalogLabel && catalogLabel.trim().toLowerCase() === normalized) {
    return true;
  }

  const config = PHONE_BRANDS.find((brand) => brand.slug === slug);
  if (
    config?.matchNames.some((name) => name.toLowerCase() === normalized)
  ) {
    return true;
  }

  return slugifyBrand(productBrand) === slug;
}

export function shopBrandHref(
  filter: "phones-new" | "phones-used",
  slug: BrandSlug
): string {
  return filter === "phones-new"
    ? `/shop/phones/new/${slug}`
    : `/shop/phones/used/${slug}`;
}

/** All products across every brand (phones, accessories, protection). */
export function shopAllBrandsPath(): string {
  return "/shop/brands";
}

/** All products (phones, accessories, protection) for a brand. */
export function shopBrandCatalogPath(slug: BrandSlug): string {
  return `/shop/brands/${slug}`;
}

export function productMatchesShopBrand(
  product: Product,
  slug: BrandSlug,
  catalogLabel?: string
): boolean {
  if (
    product.category !== "phones" &&
    product.category !== "accessories" &&
    product.category !== "protection"
  ) {
    return false;
  }
  if (
    product.protection_brand_slug === slug ||
    product.accessory_brand_slug === slug
  ) {
    return true;
  }
  return productMatchesBrand(product.brand, slug, catalogLabel);
}
