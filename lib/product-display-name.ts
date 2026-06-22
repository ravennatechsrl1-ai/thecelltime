import { Locale } from "@/lib/i18n/types";
import { resolveLocalizedText } from "@/lib/product-i18n";
import { getPhoneListingTitle } from "@/lib/phone-listings";
import { Product } from "@/types";

/**
 * Customer-facing product title for the active locale.
 */
export function getProductDisplayName(
  product: Product,
  locale: Locale,
  titleOverride?: string | null
): string {
  const override = titleOverride?.trim();
  if (override) {
    return resolveLocalizedText(locale, override, product.name_i18n);
  }

  if (product.category === "phones") {
    return getPhoneListingTitle(product, locale);
  }

  return resolveLocalizedText(locale, product.name, product.name_i18n);
}

/** Brand label on product cards — stored value, not translated. */
export function getProductBrandLabel(product: Product): string {
  return product.brand.trim();
}
