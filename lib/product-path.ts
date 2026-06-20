import { getListingId, phoneProductPath } from "@/lib/phone-listings";
import { Product } from "@/types";

export function productDetailPath(
  product: Product,
  listingId?: string
): string {
  if (product.category === "phones") {
    return phoneProductPath(listingId ?? getListingId(product));
  }
  return `/shop/product/${product.id}`;
}

export function productBrowseHref(product: Product): string {
  switch (product.category) {
    case "phones":
      return product.condition === "used"
        ? "/shop/phones/used"
        : "/shop/phones/new";
    case "accessories":
      return "/shop/accessories";
    case "protection":
      return "/shop/protection";
    default:
      return "/shop";
  }
}
