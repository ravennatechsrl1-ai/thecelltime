import { AccessoryType, accessorySlugToType, accessoryTypeToSlug } from "@/lib/admin-catalog";
import { isPhoneBrandSlug, PhoneBrandSlug } from "@/lib/phone-brands";
import { ShopFilter } from "@/types";

export type ShopView =
  | { type: "all" }
  | { type: "promotions" }
  | { type: "phones" }
  | { type: "phones-new" }
  | { type: "phones-used" }
  | { type: "phones-new-brand"; brand: PhoneBrandSlug }
  | { type: "phones-used-brand"; brand: PhoneBrandSlug }
  | { type: "accessories" }
  | { type: "accessories-type"; accessoryType: AccessoryType };

export function parseShopSegments(segments?: string[]): ShopView | null {
  if (!segments || segments.length === 0) {
    return { type: "all" };
  }

  if (segments.length === 1 && segments[0] === "promotions") {
    return { type: "promotions" };
  }

  if (segments.length === 1 && segments[0] === "phones") {
    return { type: "phones" };
  }

  if (segments.length === 1 && segments[0] === "accessories") {
    return { type: "accessories" };
  }

  if (segments[0] === "accessories" && segments.length === 2) {
    const accessoryType = accessorySlugToType(segments[1]);
    if (accessoryType) {
      return { type: "accessories-type", accessoryType };
    }
  }

  if (segments[0] === "phones" && segments.length === 2) {
    if (segments[1] === "new") return { type: "phones-new" };
    if (segments[1] === "used") return { type: "phones-used" };
  }

  if (segments[0] === "phones" && segments.length === 3) {
    const condition = segments[1];
    const brand = segments[2];
    if (!isPhoneBrandSlug(brand)) return null;
    if (condition === "new") return { type: "phones-new-brand", brand };
    if (condition === "used") return { type: "phones-used-brand", brand };
  }

  return null;
}

export function shopViewToPath(view: ShopView): string {
  switch (view.type) {
    case "all":
      return "/shop";
    case "promotions":
      return "/shop/promotions";
    case "phones":
      return "/shop/phones";
    case "phones-new":
      return "/shop/phones/new";
    case "phones-used":
      return "/shop/phones/used";
    case "phones-new-brand":
      return `/shop/phones/new/${view.brand}`;
    case "phones-used-brand":
      return `/shop/phones/used/${view.brand}`;
    case "accessories":
      return "/shop/accessories";
    case "accessories-type":
      return `/shop/accessories/${accessoryTypeToSlug(view.accessoryType)}`;
  }
}

export function shopViewToFilter(view: ShopView): ShopFilter {
  switch (view.type) {
    case "phones-new":
    case "phones-new-brand":
      return "phones-new";
    case "phones-used":
    case "phones-used-brand":
      return "phones-used";
    case "accessories":
    case "accessories-type":
      return "accessories";
    case "phones":
      return "all";
    default:
      return "all";
  }
}

export function isAccessoryShopView(view: ShopView): boolean {
  return view.type === "accessories" || view.type === "accessories-type";
}

export function isPromotionShopView(view: ShopView): boolean {
  return view.type === "promotions";
}

export function isPhoneShopView(view: ShopView): boolean {
  return (
    view.type === "phones" ||
    view.type === "phones-new" ||
    view.type === "phones-used" ||
    view.type === "phones-new-brand" ||
    view.type === "phones-used-brand"
  );
}

export function getShopBrand(view: ShopView): PhoneBrandSlug | null {
  if (view.type === "phones-new-brand" || view.type === "phones-used-brand") {
    return view.brand;
  }
  return null;
}

export function shopBrandPath(
  condition: "new" | "used",
  brand: PhoneBrandSlug
): string {
  return `/shop/phones/${condition}/${brand}`;
}

export function legacyShopQueryToPath(
  searchParams: Record<string, string | string[] | undefined>
): string | null {
  const filterRaw = searchParams.filter;
  const brandRaw = searchParams.brand;
  const filter = Array.isArray(filterRaw) ? filterRaw[0] : filterRaw;
  const brand = Array.isArray(brandRaw) ? brandRaw[0] : brandRaw;

  if (!filter && !brand) return null;

  if (filter === "accessories") return "/shop/accessories";
  if (filter === "phones-new" && brand && isPhoneBrandSlug(brand)) {
    return shopBrandPath("new", brand);
  }
  if (filter === "phones-used" && brand && isPhoneBrandSlug(brand)) {
    return shopBrandPath("used", brand);
  }
  if (filter === "phones-new") return "/shop/phones/new";
  if (filter === "phones-used") return "/shop/phones/used";

  return null;
}
