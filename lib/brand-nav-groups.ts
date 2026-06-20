import { NavDropdownGroup } from "@/components/NavDropdown";
import { CatalogBrand } from "@/lib/catalog-brands-sync";
import { Translations } from "@/lib/i18n/types";
import { PHONE_BRANDS, shopBrandCatalogPath } from "@/lib/phone-brands";

/** Brands shown per category before the "All brands" link. */
export const BRAND_NAV_PREVIEW_LIMIT = 6;

type BrandNavCategory = "mobiles" | "computers" | "tablets" | "watch" | "other";

const COMPUTER_BRAND_SLUGS = new Set(["dell", "hp", "lenovo", "asus"]);
const PHONE_BRAND_SLUGS = new Set(PHONE_BRANDS.map((brand) => brand.slug));

const CATEGORY_ORDER: BrandNavCategory[] = [
  "mobiles",
  "computers",
  "tablets",
  "watch",
  "other",
];

function getBrandNavCategory(slug: string): BrandNavCategory {
  if (COMPUTER_BRAND_SLUGS.has(slug)) return "computers";
  if (PHONE_BRAND_SLUGS.has(slug)) return "mobiles";
  return "other";
}

function categoryLabel(t: Translations, category: BrandNavCategory): string {
  switch (category) {
    case "mobiles":
      return t.protection.deviceMobiles;
    case "computers":
      return t.protection.deviceComputers;
    case "tablets":
      return t.protection.deviceTablets;
    case "watch":
      return t.protection.deviceWatch;
    case "other":
      return t.nav.otherBrands;
  }
}

function categoryViewAllHref(category: BrandNavCategory): string {
  switch (category) {
    case "mobiles":
      return "/shop/phones";
    case "computers":
      return "/shop/protection/computers";
    case "tablets":
      return "/shop/protection/tablets";
    case "watch":
      return "/shop/protection/watch";
    case "other":
      return "/shop/brands";
  }
}

export function buildBrandNavGroups(
  t: Translations,
  catalogBrands: CatalogBrand[] = []
): NavDropdownGroup[] {
  const brands =
    catalogBrands.length > 0
      ? catalogBrands.map((brand) => ({ slug: brand.slug, label: brand.label }))
      : PHONE_BRANDS.map((brand) => ({
          slug: brand.slug,
          label: t.nav[brand.labelKey],
        }));

  const byCategory = new Map<BrandNavCategory, typeof brands>();

  for (const category of CATEGORY_ORDER) {
    byCategory.set(category, []);
  }

  for (const brand of brands) {
    const category = getBrandNavCategory(brand.slug);
    byCategory.get(category)!.push(brand);
  }

  const groups: NavDropdownGroup[] = [];

  for (const category of CATEGORY_ORDER) {
    const list = byCategory.get(category)!;
    if (list.length === 0) continue;

    groups.push({
      label: categoryLabel(t, category),
      items: list.slice(0, BRAND_NAV_PREVIEW_LIMIT).map((brand) => ({
        href: shopBrandCatalogPath(brand.slug),
        label: brand.label,
      })),
      viewAll: {
        href: categoryViewAllHref(category),
        label: t.nav.allBrands,
      },
    });
  }

  return groups;
}
