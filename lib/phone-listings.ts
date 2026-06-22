import { buildPhoneProductName } from "@/lib/admin-catalog";
import { Locale } from "@/lib/i18n/types";
import { resolveLocalizedText } from "@/lib/product-i18n";
import { getEffectivePrice } from "@/lib/product-pricing";
import {
  getPhoneColorLabel,
  getPhoneDisplayName,
  getPhoneStorageLabel,
} from "@/lib/phone-variants";
import { Product } from "@/types";

export interface PhoneListing {
  id: string;
  brand: string;
  phone_model: string;
  condition: string;
  base_name: string;
}

export interface PhoneListingVariantInput {
  storage: string;
  color: string;
  price: number;
  stock: number;
}

export interface ShopPhoneDisplay {
  listingId: string;
  title: string;
  product: Product;
  variants: Product[];
}

export function phoneProductPath(listingOrProductId: string): string {
  return `/shop/phone/${listingOrProductId}`;
}

/** Listing title without storage or color (for cards and detail heading). */
export function getPhoneListingTitle(
  product: Product,
  locale: Locale = "it"
): string {
  if (product.phone_listing_base_name_i18n) {
    return resolveLocalizedText(
      locale,
      product.phone_listing_base_name ?? product.name,
      product.phone_listing_base_name_i18n
    );
  }

  if (product.phone_listing_base_name?.trim()) {
    return resolveLocalizedText(
      locale,
      product.phone_listing_base_name,
      product.name_i18n
    );
  }

  let name = getPhoneDisplayName(product);
  const storage = getPhoneStorageLabel(product);
  if (storage && name.endsWith(` ${storage}`)) {
    name = name.slice(0, -(storage.length + 1)).trim();
  }

  return resolveLocalizedText(locale, name, product.name_i18n);
}

export function getListingId(product: Product): string {
  return product.phone_listing_id ?? product.id;
}

export function resolveListingVariants(
  listingId: string,
  allProducts: Product[]
): Product[] {
  const byListing = allProducts.filter(
    (p) => p.category === "phones" && p.phone_listing_id === listingId
  );
  if (byListing.length > 0) {
    return sortVariants(byListing);
  }

  const single = allProducts.find((p) => p.id === listingId);
  if (single?.category === "phones") {
    const legacy = findLegacySiblings(single, allProducts);
    return legacy.length > 0 ? legacy : [single];
  }

  return [];
}

function pickCheapestVariant(variants: Product[]): Product {
  return variants.reduce((min, product) =>
    getEffectivePrice(product) < getEffectivePrice(min) ? product : min
  );
}

function pickRepresentativeVariant(variants: Product[]): Product | undefined {
  if (variants.length === 0) return undefined;
  const inStock = variants.filter((v) => v.stock > 0);
  const pool = inStock.length > 0 ? inStock : variants;
  return pickCheapestVariant(pool);
}

function sortVariants(variants: Product[]): Product[] {
  return [...variants].sort((a, b) => {
    const storage = (getPhoneStorageLabel(a) ?? "").localeCompare(
      getPhoneStorageLabel(b) ?? ""
    );
    if (storage !== 0) return storage;
    return (getPhoneColorLabel(a) ?? "").localeCompare(getPhoneColorLabel(b) ?? "");
  });
}

function findLegacySiblings(product: Product, allProducts: Product[]): Product[] {
  const phones = allProducts.filter((p) => p.category === "phones");
  const title = getPhoneListingTitle(product);
  const siblings = phones.filter(
    (p) =>
      p.brand === product.brand &&
      p.condition === product.condition &&
      getPhoneListingTitle(p) === title
  );
  return siblings.length > 1 ? sortVariants(siblings) : [];
}

export function buildShopPhoneDisplays(
  products: Product[],
  locale: Locale = "it"
): ShopPhoneDisplay[] {
  const displays: ShopPhoneDisplay[] = [];
  const seenListings = new Set<string>();
  const seenLegacy = new Set<string>();

  for (const product of products) {
    if (product.category !== "phones") {
      displays.push({
        listingId: product.id,
        title: resolveLocalizedText(locale, product.name, product.name_i18n),
        product,
        variants: [],
      });
      continue;
    }

    if (product.phone_listing_id) {
      const lid = product.phone_listing_id;
      if (seenListings.has(lid)) continue;
      seenListings.add(lid);

      const variants = products.filter((p) => p.phone_listing_id === lid);
      const representative = pickRepresentativeVariant(variants) ?? product;
      displays.push({
        listingId: lid,
        title: getPhoneListingTitle(representative, locale),
        product: representative,
        variants,
      });
      continue;
    }

    const legacy = findLegacySiblings(product, products);
    if (legacy.length > 1) {
      const key = `${product.brand}|${product.condition}|${getPhoneListingTitle(product)}`;
      if (seenLegacy.has(key)) continue;
      seenLegacy.add(key);
      const representative = pickRepresentativeVariant(legacy) ?? product;
      displays.push({
        listingId: representative.id,
        title: getPhoneListingTitle(representative, locale),
        product: representative,
        variants: legacy,
      });
      continue;
    }

    displays.push({
      listingId: product.id,
      title: getPhoneListingTitle(product, locale),
      product,
      variants: [product],
    });
  }

  return displays;
}

export function buildVariantProductName(
  listing: Pick<PhoneListing, "brand" | "phone_model" | "base_name">,
  storage: string,
  color: string
): string {
  if (listing.base_name && storage && color) {
    return `${listing.base_name} ${storage} ${color}`.trim();
  }
  return buildPhoneProductName(listing.brand, listing.phone_model, storage, color);
}

export function buildVariantProductNameI18n(
  listing: Pick<PhoneListing, "brand" | "phone_model" | "base_name"> & {
    base_name_i18n?: import("@/types").ProductNameI18n | null;
  },
  storage: string,
  color: string
): import("@/types").ProductNameI18n {
  const suffix = `${storage} ${color}`.trim();
  const itBase = listing.base_name_i18n?.it?.trim() || listing.base_name;
  const enBase = listing.base_name_i18n?.en?.trim() || itBase;

  if (itBase && suffix) {
    return {
      it: `${itBase} ${suffix}`.trim(),
      en: `${enBase} ${suffix}`.trim(),
    };
  }

  const fallback = buildVariantProductName(listing, storage, color);
  return { it: fallback, en: fallback };
}

export function findVariantByOptions(
  variants: Product[],
  storage: string,
  color: string
): Product | undefined {
  return variants.find(
    (v) =>
      getPhoneStorageLabel(v) === storage &&
      (getPhoneColorLabel(v) ?? "") === color
  );
}

export function getUniqueStorages(variants: Product[]): string[] {
  return Array.from(
    new Set(
      variants
        .map((v) => getPhoneStorageLabel(v))
        .filter((s): s is string => Boolean(s))
    )
  );
}

export function getColorsForStorage(
  variants: Product[],
  storage: string
): Product[] {
  return variants.filter((v) => getPhoneStorageLabel(v) === storage);
}

/** Colors to show in picker — all unique colors when each storage has ≤1 color. */
export function getColorPickerVariants(
  variants: Product[],
  activeStorage: string
): Product[] {
  const forStorage = getColorsForStorage(variants, activeStorage);
  if (forStorage.length > 1) return forStorage;

  const seen = new Map<string, Product>();
  for (const variant of variants) {
    const color = getPhoneColorLabel(variant);
    const key = color?.trim().toLowerCase() ?? variant.id;
    if (!seen.has(key)) seen.set(key, variant);
  }
  return Array.from(seen.values());
}

export function pickInitialVariant(
  variants: Product[],
  preferredId?: string
): Product {
  if (preferredId) {
    const match = variants.find((v) => v.id === preferredId);
    if (match) return match;
  }
  return variants.find((v) => v.stock > 0) ?? variants[0];
}

export function resolveSelectedVariant(
  variants: Product[],
  storage: string,
  color: string
): Product | undefined {
  return findVariantByOptions(variants, storage, color);
}
