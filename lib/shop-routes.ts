import { AccessoryType, accessorySlugToType, accessoryTypeToSlug } from "@/lib/admin-catalog";
import {
  accessorySlugToSubtype,
  AccessoryDeviceType,
  AccessorySubtype,
  isAccessoryBrandSlug,
  isAccessoryDeviceType,
  isAccessoryModelSlug,
} from "@/lib/accessories-catalog";
import {
  isProtectionBrandSlug,
  isProtectionDeviceType,
  isProtectionModelSlug,
  ProtectionDeviceType,
  protectionSlugToSubtype,
  ProtectionSubtype,
} from "@/lib/protection-catalog";
import { isBrandSlug, BrandSlug } from "@/lib/phone-brands";
import { ShopFilter } from "@/types";

export type ShopView =
  | { type: "all" }
  | { type: "promotions" }
  | { type: "phones" }
  | { type: "phones-new" }
  | { type: "phones-used" }
  | { type: "phones-new-brand"; brand: BrandSlug }
  | { type: "phones-used-brand"; brand: BrandSlug }
  | { type: "brands-all" }
  | { type: "brand"; brand: BrandSlug }
  | { type: "accessories" }
  | { type: "accessories-type"; accessoryType: AccessoryType }
  | { type: "accessories-device"; deviceType: AccessoryDeviceType }
  | { type: "accessories-brand"; deviceType: AccessoryDeviceType; brandSlug: string }
  | {
      type: "accessories-model";
      deviceType: AccessoryDeviceType;
      brandSlug: string;
      modelSlug: string;
    }
  | { type: "protection" }
  | { type: "protection-device"; deviceType: ProtectionDeviceType }
  | { type: "protection-brand"; deviceType: ProtectionDeviceType; brandSlug: string }
  | {
      type: "protection-model";
      deviceType: ProtectionDeviceType;
      brandSlug: string;
      modelSlug: string;
    };

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

  if (segments[0] === "brands") {
    if (segments.length === 1) {
      return { type: "brands-all" };
    }
    if (segments.length === 2) {
      const brand = segments[1];
      if (!isBrandSlug(brand)) return null;
      return { type: "brand", brand };
    }
    return null;
  }

  if (segments[0] === "accessories" && segments.length >= 2) {
    if (isAccessoryDeviceType(segments[1])) {
      const deviceType = segments[1];
      if (segments.length === 2) {
        return { type: "accessories-device", deviceType };
      }
      if (
        segments.length === 3 &&
        isAccessoryBrandSlug(deviceType, segments[2])
      ) {
        return {
          type: "accessories-brand",
          deviceType,
          brandSlug: segments[2],
        };
      }
      if (
        segments.length === 4 &&
        isAccessoryBrandSlug(deviceType, segments[2]) &&
        isAccessoryModelSlug(deviceType, segments[2], segments[3])
      ) {
        return {
          type: "accessories-model",
          deviceType,
          brandSlug: segments[2],
          modelSlug: segments[3],
        };
      }
      return null;
    }

    if (segments.length === 2) {
      const accessoryType = accessorySlugToType(segments[1]);
      if (accessoryType) {
        return { type: "accessories-type", accessoryType };
      }
    }
  }

  if (segments[0] === "phones" && segments.length === 2) {
    if (segments[1] === "new") return { type: "phones-new" };
    if (segments[1] === "used") return { type: "phones-used" };
  }

  if (segments[0] === "phones" && segments.length === 3) {
    const condition = segments[1];
    const brand = segments[2];
    if (!isBrandSlug(brand)) return null;
    if (condition === "new") return { type: "phones-new-brand", brand };
    if (condition === "used") return { type: "phones-used-brand", brand };
  }

  if (segments[0] === "protection") {
    if (segments.length === 1) return { type: "protection" };
    if (segments.length === 2 && isProtectionDeviceType(segments[1])) {
      return { type: "protection-device", deviceType: segments[1] };
    }
    if (
      segments.length === 3 &&
      isProtectionDeviceType(segments[1]) &&
      isProtectionBrandSlug(segments[1], segments[2])
    ) {
      return {
        type: "protection-brand",
        deviceType: segments[1],
        brandSlug: segments[2],
      };
    }
    if (
      segments.length === 4 &&
      isProtectionDeviceType(segments[1]) &&
      isProtectionBrandSlug(segments[1], segments[2]) &&
      isProtectionModelSlug(segments[1], segments[2], segments[3])
    ) {
      return {
        type: "protection-model",
        deviceType: segments[1],
        brandSlug: segments[2],
        modelSlug: segments[3],
      };
    }
    return null;
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
    case "brands-all":
      return "/shop/brands";
    case "brand":
      return `/shop/brands/${view.brand}`;
    case "accessories":
      return "/shop/accessories";
    case "accessories-type":
      return `/shop/accessories/${accessoryTypeToSlug(view.accessoryType)}`;
    case "accessories-device":
      return `/shop/accessories/${view.deviceType}`;
    case "accessories-brand":
      return `/shop/accessories/${view.deviceType}/${view.brandSlug}`;
    case "accessories-model":
      return `/shop/accessories/${view.deviceType}/${view.brandSlug}/${view.modelSlug}`;
    case "protection":
      return "/shop/protection";
    case "protection-device":
      return `/shop/protection/${view.deviceType}`;
    case "protection-brand":
      return `/shop/protection/${view.deviceType}/${view.brandSlug}`;
    case "protection-model":
      return `/shop/protection/${view.deviceType}/${view.brandSlug}/${view.modelSlug}`;
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

export type ProtectionShopView = Extract<
  ShopView,
  | { type: "protection" }
  | { type: "protection-device" }
  | { type: "protection-brand" }
  | { type: "protection-model" }
>;

export function isProtectionShopView(view: ShopView): view is ProtectionShopView {
  return (
    view.type === "protection" ||
    view.type === "protection-device" ||
    view.type === "protection-brand" ||
    view.type === "protection-model"
  );
}

export type AccessoriesHierarchyView = Extract<
  ShopView,
  | { type: "accessories" }
  | { type: "accessories-device" }
  | { type: "accessories-brand" }
  | { type: "accessories-model" }
>;

export function isAccessoriesHierarchyView(
  view: ShopView
): view is AccessoriesHierarchyView {
  return (
    view.type === "accessories" ||
    view.type === "accessories-device" ||
    view.type === "accessories-brand" ||
    view.type === "accessories-model"
  );
}

export function getAccessorySubtypeFromSearch(
  searchParams: URLSearchParams
): AccessorySubtype | null {
  const raw = searchParams.get("subtype");
  if (!raw) return null;
  return accessorySlugToSubtype(raw);
}

export function getProtectionSubtypeFromSearch(
  searchParams: URLSearchParams
): ProtectionSubtype | null {
  const raw = searchParams.get("subtype");
  if (!raw) return null;
  return protectionSlugToSubtype(raw);
}

export function isAccessoryShopView(view: ShopView): boolean {
  return (
    view.type === "accessories" ||
    view.type === "accessories-type" ||
    view.type === "accessories-device" ||
    view.type === "accessories-brand" ||
    view.type === "accessories-model"
  );
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

export function getShopBrand(view: ShopView): BrandSlug | null {
  if (
    view.type === "phones-new-brand" ||
    view.type === "phones-used-brand" ||
    view.type === "brand"
  ) {
    return view.brand;
  }
  return null;
}

export function isBrandShopView(view: ShopView): boolean {
  return view.type === "brand";
}

export function isBrandsAllShopView(view: ShopView): boolean {
  return view.type === "brands-all";
}

export function isBrandsCatalogView(view: ShopView): boolean {
  return view.type === "brand" || view.type === "brands-all";
}

export function shopBrandPath(
  condition: "new" | "used",
  brand: BrandSlug
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
  if (brand && isBrandSlug(brand)) {
    return `/shop/brands/${brand}`;
  }
  if (filter === "phones-new" && brand && isBrandSlug(brand)) {
    return shopBrandPath("new", brand);
  }
  if (filter === "phones-used" && brand && isBrandSlug(brand)) {
    return shopBrandPath("used", brand);
  }
  if (filter === "phones-new") return "/shop/phones/new";
  if (filter === "phones-used") return "/shop/phones/used";

  return null;
}
