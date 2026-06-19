import {
  ACCESSORY_TYPES,
  AccessoryType,
  accessorySlugToType,
  accessoryTypeToSlug,
} from "@/lib/admin-catalog";
import {
  getProtectionBrand,
  getProtectionModel,
  getProtectionSeriesGroups,
  isProtectionBrandSlug,
  isProtectionDeviceType,
  isProtectionModelSlug,
  PROTECTION_CATALOG,
  PROTECTION_DEVICE_TYPES,
  ProtectionDeviceType,
  ProtectionNavBrand,
  ProtectionNavDevice,
  ProtectionNavModel,
  ProtectionNavSeriesGroup,
} from "@/lib/protection-catalog";
import { Product } from "@/types";

export const ACCESSORY_DEVICE_TYPES = PROTECTION_DEVICE_TYPES;
export type AccessoryDeviceType = ProtectionDeviceType;
export const ACCESSORY_CATALOG = PROTECTION_CATALOG;
export const ACCESSORY_SUBTYPES = ACCESSORY_TYPES;
export type AccessorySubtype = AccessoryType;

export const getAccessoryBrand = getProtectionBrand;
export const getAccessoryModel = getProtectionModel;
export const getAccessorySeriesGroups = getProtectionSeriesGroups;
export const isAccessoryBrandSlug = isProtectionBrandSlug;
export const isAccessoryDeviceType = isProtectionDeviceType;
export const isAccessoryModelSlug = isProtectionModelSlug;

export type AccessoryNavModel = ProtectionNavModel;
export type AccessoryNavSeriesGroup = ProtectionNavSeriesGroup;
export type AccessoryNavBrand = ProtectionNavBrand;
export type AccessoryNavDevice = ProtectionNavDevice;

export function isAccessorySubtype(value: string): value is AccessorySubtype {
  return (ACCESSORY_SUBTYPES as readonly string[]).includes(value);
}

export function accessorySubtypeToSlug(subtype: AccessorySubtype): string {
  return accessoryTypeToSlug(subtype);
}

export function accessorySlugToSubtype(slug: string): AccessorySubtype | null {
  return accessorySlugToType(slug);
}

export function accessoriesShopPath(
  deviceType?: AccessoryDeviceType,
  brandSlug?: string,
  modelSlug?: string
): string {
  const parts = ["/shop/accessories"];
  if (deviceType) parts.push(deviceType);
  if (brandSlug) parts.push(brandSlug);
  if (modelSlug) parts.push(modelSlug);
  return parts.join("/");
}

export function buildAccessoryProductName(
  subtypeLabel: string,
  brandLabel: string,
  modelLabel: string,
  customName?: string
): string {
  if (customName?.trim()) return customName.trim();
  return `${subtypeLabel} ${brandLabel} ${modelLabel}`;
}

export function isHierarchicalAccessory(product: Product): boolean {
  return (
    product.category === "accessories" &&
    !!product.accessory_device_type &&
    isAccessoryDeviceType(product.accessory_device_type)
  );
}

export function productMatchesAccessoryHierarchy(
  product: Product,
  filters: {
    deviceType?: AccessoryDeviceType;
    brandSlug?: string;
    modelSlug?: string;
    subtype?: AccessorySubtype;
  }
): boolean {
  if (!isHierarchicalAccessory(product)) return false;
  if (
    filters.deviceType &&
    product.accessory_device_type !== filters.deviceType
  ) {
    return false;
  }
  if (filters.brandSlug && product.accessory_brand_slug !== filters.brandSlug) {
    return false;
  }
  if (filters.modelSlug && product.accessory_model_slug !== filters.modelSlug) {
    return false;
  }
  if (filters.subtype && product.accessory_subtype !== filters.subtype) {
    return false;
  }
  return true;
}

/** Mega-menu tree: only paths that have hierarchical accessory products. */
export function buildAccessoriesNavFromProducts(
  products: Product[]
): AccessoryNavDevice[] {
  const modelKeys = new Map<
    string,
    {
      deviceType: AccessoryDeviceType;
      brandSlug: string;
      modelSlug: string;
      brandLabel: string;
    }
  >();

  for (const p of products) {
    if (!isHierarchicalAccessory(p)) continue;
    if (!p.accessory_brand_slug || !p.accessory_model_slug) continue;

    const key = `${p.accessory_device_type}|${p.accessory_brand_slug}|${p.accessory_model_slug}`;
    if (!modelKeys.has(key)) {
      modelKeys.set(key, {
        deviceType: p.accessory_device_type as AccessoryDeviceType,
        brandSlug: p.accessory_brand_slug,
        modelSlug: p.accessory_model_slug,
        brandLabel: p.brand,
      });
    }
  }

  const deviceMap = new Map<
    AccessoryDeviceType,
    Map<string, AccessoryNavBrand>
  >();

  for (const entry of modelKeys.values()) {
    const { deviceType, brandSlug, modelSlug, brandLabel } = entry;
    const catalogModel = getAccessoryModel(deviceType, brandSlug, modelSlug);
    const catalogBrand = getAccessoryBrand(deviceType, brandSlug);

    const model: AccessoryNavModel = {
      slug: modelSlug,
      label: catalogModel?.label ?? modelSlug.replace(/-/g, " "),
      isRecent: catalogModel?.isRecent ?? false,
    };

    const seriesSlug = catalogModel?.seriesSlug ?? "other";
    const seriesLabel = catalogModel?.seriesLabel ?? "Other";

    if (!deviceMap.has(deviceType)) {
      deviceMap.set(deviceType, new Map());
    }
    const brandMap = deviceMap.get(deviceType)!;

    if (!brandMap.has(brandSlug)) {
      brandMap.set(brandSlug, {
        slug: brandSlug,
        label: catalogBrand?.label ?? brandLabel,
        seriesGroups: [],
      });
    }

    const brand = brandMap.get(brandSlug)!;
    let group = brand.seriesGroups.find((g) => g.seriesSlug === seriesSlug);
    if (!group) {
      group = { seriesSlug, seriesLabel, recent: [], all: [] };
      brand.seriesGroups.push(group);
    }

    if (!group.all.some((m) => m.slug === model.slug)) {
      group.all.push(model);
      if (model.isRecent) {
        group.recent.push(model);
      }
    }
  }

  const devices: AccessoryNavDevice[] = [];
  for (const deviceType of ACCESSORY_DEVICE_TYPES) {
    const brandMap = deviceMap.get(deviceType);
    if (!brandMap || brandMap.size === 0) continue;

    const brands = Array.from(brandMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );

    for (const brand of brands) {
      brand.seriesGroups.sort((a, b) =>
        a.seriesLabel.localeCompare(b.seriesLabel)
      );
    }

    devices.push({ deviceType, brands });
  }

  return devices;
}

export function getAccessoryBrandsWithProducts(
  products: Product[],
  deviceType: AccessoryDeviceType
): AccessoryNavBrand[] {
  const device = buildAccessoriesNavFromProducts(products).find(
    (d) => d.deviceType === deviceType
  );
  return device?.brands ?? [];
}
