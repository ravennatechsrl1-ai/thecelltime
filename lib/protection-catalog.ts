import { Product } from "@/types";

export const PROTECTION_DEVICE_TYPES = [
  "mobiles",
  "tablets",
  "computers",
  "watch",
] as const;

export type ProtectionDeviceType = (typeof PROTECTION_DEVICE_TYPES)[number];

export const PROTECTION_SUBTYPES = [
  "case",
  "screenProtector",
  "film",
  "lens",
  "pack",
  "other",
] as const;

export type ProtectionSubtype = (typeof PROTECTION_SUBTYPES)[number];

export interface ProtectionModelDef {
  slug: string;
  label: string;
  seriesSlug: string;
  seriesLabel: string;
  isRecent?: boolean;
}

export interface ProtectionBrandDef {
  slug: string;
  label: string;
  models: ProtectionModelDef[];
}

export interface ProtectionSeriesGroup {
  seriesSlug: string;
  seriesLabel: string;
  recent: ProtectionModelDef[];
  all: ProtectionModelDef[];
}

const appleMobileModels: ProtectionModelDef[] = [
  { slug: "iphone-17", label: "iPhone 17", seriesSlug: "series-17", seriesLabel: "Series 17/16/15", isRecent: true },
  { slug: "iphone-17-pro", label: "iPhone 17 Pro", seriesSlug: "series-17", seriesLabel: "Series 17/16/15", isRecent: true },
  { slug: "iphone-17-pro-max", label: "iPhone 17 Pro Max", seriesSlug: "series-17", seriesLabel: "Series 17/16/15", isRecent: true },
  { slug: "iphone-16", label: "iPhone 16", seriesSlug: "series-17", seriesLabel: "Series 17/16/15" },
  { slug: "iphone-16-plus", label: "iPhone 16 Plus", seriesSlug: "series-17", seriesLabel: "Series 17/16/15" },
  { slug: "iphone-16-pro", label: "iPhone 16 Pro", seriesSlug: "series-17", seriesLabel: "Series 17/16/15" },
  { slug: "iphone-16-pro-max", label: "iPhone 16 Pro Max", seriesSlug: "series-17", seriesLabel: "Series 17/16/15" },
  { slug: "iphone-15", label: "iPhone 15", seriesSlug: "series-17", seriesLabel: "Series 17/16/15" },
  { slug: "iphone-15-plus", label: "iPhone 15 Plus", seriesSlug: "series-17", seriesLabel: "Series 17/16/15" },
  { slug: "iphone-15-pro", label: "iPhone 15 Pro", seriesSlug: "series-17", seriesLabel: "Series 17/16/15" },
  { slug: "iphone-15-pro-max", label: "iPhone 15 Pro Max", seriesSlug: "series-17", seriesLabel: "Series 17/16/15" },
  { slug: "iphone-14", label: "iPhone 14", seriesSlug: "series-14-13", seriesLabel: "Series 14/13", isRecent: true },
  { slug: "iphone-14-plus", label: "iPhone 14 Plus", seriesSlug: "series-14-13", seriesLabel: "Series 14/13", isRecent: true },
  { slug: "iphone-14-pro", label: "iPhone 14 Pro", seriesSlug: "series-14-13", seriesLabel: "Series 14/13", isRecent: true },
  { slug: "iphone-14-pro-max", label: "iPhone 14 Pro Max", seriesSlug: "series-14-13", seriesLabel: "Series 14/13", isRecent: true },
  { slug: "iphone-13", label: "iPhone 13", seriesSlug: "series-14-13", seriesLabel: "Series 14/13" },
  { slug: "iphone-13-mini", label: "iPhone 13 mini", seriesSlug: "series-14-13", seriesLabel: "Series 14/13" },
  { slug: "iphone-13-pro", label: "iPhone 13 Pro", seriesSlug: "series-14-13", seriesLabel: "Series 14/13" },
  { slug: "iphone-13-pro-max", label: "iPhone 13 Pro Max", seriesSlug: "series-14-13", seriesLabel: "Series 14/13" },
  { slug: "iphone-12", label: "iPhone 12", seriesSlug: "series-12-11-x", seriesLabel: "Series 12/11/X", isRecent: true },
  { slug: "iphone-12-mini", label: "iPhone 12 mini", seriesSlug: "series-12-11-x", seriesLabel: "Series 12/11/X" },
  { slug: "iphone-12-pro", label: "iPhone 12 Pro", seriesSlug: "series-12-11-x", seriesLabel: "Series 12/11/X" },
  { slug: "iphone-12-pro-max", label: "iPhone 12 Pro Max", seriesSlug: "series-12-11-x", seriesLabel: "Series 12/11/X" },
  { slug: "iphone-11", label: "iPhone 11", seriesSlug: "series-12-11-x", seriesLabel: "Series 12/11/X" },
  { slug: "iphone-se-3", label: "iPhone SE (3rd gen)", seriesSlug: "series-se", seriesLabel: "SE Series", isRecent: true },
  { slug: "iphone-se-2", label: "iPhone SE (2nd gen)", seriesSlug: "series-se", seriesLabel: "SE Series" },
];

function samsungMobileModels(): ProtectionModelDef[] {
  const series = { seriesSlug: "galaxy-s", seriesLabel: "Galaxy S Series" };
  return [
    { slug: "galaxy-s25-ultra", label: "Galaxy S25 Ultra", ...series, isRecent: true },
    { slug: "galaxy-s25-plus", label: "Galaxy S25+", ...series, isRecent: true },
    { slug: "galaxy-s25", label: "Galaxy S25", ...series, isRecent: true },
    { slug: "galaxy-s24-ultra", label: "Galaxy S24 Ultra", ...series },
    { slug: "galaxy-s24", label: "Galaxy S24", ...series },
    { slug: "galaxy-a55", label: "Galaxy A55", seriesSlug: "galaxy-a", seriesLabel: "Galaxy A Series" },
  ];
}

function brandList(
  brands: { slug: string; label: string; models: ProtectionModelDef[] }[]
): ProtectionBrandDef[] {
  return brands;
}

export const PROTECTION_CATALOG: Record<
  ProtectionDeviceType,
  ProtectionBrandDef[]
> = {
  mobiles: brandList([
    { slug: "apple", label: "Apple", models: appleMobileModels },
    { slug: "samsung", label: "Samsung", models: samsungMobileModels() },
    { slug: "xiaomi", label: "Xiaomi", models: [
      { slug: "redmi-note-14", label: "Redmi Note 14", seriesSlug: "redmi", seriesLabel: "Redmi Note", isRecent: true },
      { slug: "poco-x7", label: "POCO X7", seriesSlug: "poco", seriesLabel: "POCO X" },
    ]},
    { slug: "huawei", label: "Huawei", models: [
      { slug: "pura-70", label: "Pura 70", seriesSlug: "pura", seriesLabel: "Pura Series", isRecent: true },
    ]},
    { slug: "honor", label: "Honor", models: [
      { slug: "magic-7", label: "Honor Magic 7", seriesSlug: "magic", seriesLabel: "Magic Series", isRecent: true },
    ]},
    { slug: "oppo", label: "OPPO", models: [
      { slug: "find-x8", label: "Find X8", seriesSlug: "find-x", seriesLabel: "Find X", isRecent: true },
    ]},
    { slug: "realme", label: "Realme", models: [
      { slug: "gt-7", label: "GT 7", seriesSlug: "gt", seriesLabel: "GT Series", isRecent: true },
    ]},
    { slug: "oneplus", label: "OnePlus", models: [
      { slug: "oneplus-13", label: "OnePlus 13", seriesSlug: "flagship", seriesLabel: "Flagship", isRecent: true },
    ]},
    { slug: "motorola", label: "Motorola", models: [
      { slug: "edge-50", label: "Edge 50", seriesSlug: "edge", seriesLabel: "Edge Series", isRecent: true },
    ]},
    { slug: "google", label: "Google", models: [
      { slug: "pixel-9-pro", label: "Pixel 9 Pro", seriesSlug: "pixel", seriesLabel: "Pixel Series", isRecent: true },
      { slug: "pixel-9", label: "Pixel 9", seriesSlug: "pixel", seriesLabel: "Pixel Series" },
    ]},
    { slug: "vivo", label: "Vivo", models: [
      { slug: "x200", label: "X200", seriesSlug: "x-series", seriesLabel: "X Series", isRecent: true },
    ]},
  ]),
  tablets: brandList([
    { slug: "apple", label: "Apple", models: [
      { slug: "ipad-pro-13-m4", label: 'iPad Pro 13" M4', seriesSlug: "ipad-pro", seriesLabel: "iPad Pro", isRecent: true },
      { slug: "ipad-air-m2", label: "iPad Air M2", seriesSlug: "ipad-air", seriesLabel: "iPad Air" },
    ]},
    { slug: "samsung", label: "Samsung", models: [
      { slug: "galaxy-tab-s10", label: "Galaxy Tab S10", seriesSlug: "tab-s", seriesLabel: "Tab S", isRecent: true },
    ]},
  ]),
  computers: brandList([
    { slug: "apple", label: "Apple", models: [
      { slug: "macbook-air-m3", label: "MacBook Air M3", seriesSlug: "macbook-air", seriesLabel: "MacBook Air", isRecent: true },
    ]},
    { slug: "dell", label: "Dell", models: [
      { slug: "xps-15", label: "XPS 15", seriesSlug: "xps", seriesLabel: "XPS", isRecent: true },
    ]},
    { slug: "hp", label: "HP", models: [
      { slug: "spectre-x360", label: "Spectre x360", seriesSlug: "spectre", seriesLabel: "Spectre", isRecent: true },
    ]},
    { slug: "lenovo", label: "Lenovo", models: [
      { slug: "thinkpad-x1", label: "ThinkPad X1", seriesSlug: "thinkpad", seriesLabel: "ThinkPad", isRecent: true },
    ]},
  ]),
  watch: brandList([
    { slug: "apple", label: "Apple", models: [
      { slug: "watch-ultra-2", label: "Apple Watch Ultra 2", seriesSlug: "ultra", seriesLabel: "Ultra", isRecent: true },
      { slug: "watch-series-10", label: "Apple Watch Series 10", seriesSlug: "series", seriesLabel: "Series", isRecent: true },
    ]},
    { slug: "samsung", label: "Samsung", models: [
      { slug: "galaxy-watch-7", label: "Galaxy Watch 7", seriesSlug: "galaxy-watch", seriesLabel: "Galaxy Watch", isRecent: true },
    ]},
  ]),
};

export function isProtectionDeviceType(value: string): value is ProtectionDeviceType {
  return PROTECTION_DEVICE_TYPES.includes(value as ProtectionDeviceType);
}

export function isProtectionBrandSlug(
  deviceType: ProtectionDeviceType,
  slug: string
): boolean {
  return PROTECTION_CATALOG[deviceType].some((b) => b.slug === slug);
}

export function isProtectionModelSlug(
  deviceType: ProtectionDeviceType,
  brandSlug: string,
  modelSlug: string
): boolean {
  const brand = getProtectionBrand(deviceType, brandSlug);
  return brand?.models.some((m) => m.slug === modelSlug) ?? false;
}

export function isProtectionSubtype(value: string): value is ProtectionSubtype {
  return PROTECTION_SUBTYPES.includes(value as ProtectionSubtype);
}

export function getProtectionBrand(
  deviceType: ProtectionDeviceType,
  brandSlug: string
): ProtectionBrandDef | undefined {
  return PROTECTION_CATALOG[deviceType].find((b) => b.slug === brandSlug);
}

export function getProtectionModel(
  deviceType: ProtectionDeviceType,
  brandSlug: string,
  modelSlug: string
): ProtectionModelDef | undefined {
  return getProtectionBrand(deviceType, brandSlug)?.models.find(
    (m) => m.slug === modelSlug
  );
}

export function getProtectionSeriesGroups(
  deviceType: ProtectionDeviceType,
  brandSlug: string
): ProtectionSeriesGroup[] {
  const brand = getProtectionBrand(deviceType, brandSlug);
  if (!brand) return [];

  const bySeries = new Map<string, ProtectionSeriesGroup>();
  for (const model of brand.models) {
    let group = bySeries.get(model.seriesSlug);
    if (!group) {
      group = {
        seriesSlug: model.seriesSlug,
        seriesLabel: model.seriesLabel,
        recent: [],
        all: [],
      };
      bySeries.set(model.seriesSlug, group);
    }
    group.all.push(model);
    if (model.isRecent) group.recent.push(model);
  }
  return Array.from(bySeries.values());
}

export function protectionSubtypeToSlug(subtype: ProtectionSubtype): string {
  const map: Record<ProtectionSubtype, string> = {
    case: "cases",
    screenProtector: "screen-protectors",
    film: "films",
    lens: "lens-protection",
    pack: "packs",
    other: "other",
  };
  return map[subtype];
}

export function protectionSlugToSubtype(slug: string): ProtectionSubtype | null {
  const map: Record<string, ProtectionSubtype> = {
    cases: "case",
    "screen-protectors": "screenProtector",
    films: "film",
    "lens-protection": "lens",
    packs: "pack",
    other: "other",
  };
  return map[slug] ?? null;
}

export function protectionShopPath(
  deviceType?: ProtectionDeviceType,
  brandSlug?: string,
  modelSlug?: string
): string {
  const parts = ["/shop/protection"];
  if (deviceType) parts.push(deviceType);
  if (brandSlug) parts.push(brandSlug);
  if (modelSlug) parts.push(modelSlug);
  return parts.join("/");
}

export function buildProtectionProductName(
  subtypeLabel: string,
  brandLabel: string,
  modelLabel: string,
  customName?: string
): string {
  if (customName?.trim()) return customName.trim();
  return `${subtypeLabel} ${brandLabel} ${modelLabel}`;
}

export function productMatchesProtection(
  product: Product,
  filters: {
    deviceType?: ProtectionDeviceType;
    brandSlug?: string;
    modelSlug?: string;
    subtype?: ProtectionSubtype;
  }
): boolean {
  if (product.category !== "protection") return false;
  if (
    filters.deviceType &&
    product.protection_device_type !== filters.deviceType
  ) {
    return false;
  }
  if (filters.brandSlug && product.protection_brand_slug !== filters.brandSlug) {
    return false;
  }
  if (filters.modelSlug && product.protection_model_slug !== filters.modelSlug) {
    return false;
  }
  if (filters.subtype && product.protection_subtype !== filters.subtype) {
    return false;
  }
  return true;
}

export function getProtectionPathsWithProducts(
  products: Product[]
): Set<string> {
  const paths = new Set<string>();
  for (const p of products) {
    if (p.category !== "protection") continue;
    if (!p.protection_device_type) continue;
    if (!isProtectionDeviceType(p.protection_device_type)) continue;
    const deviceType = p.protection_device_type;
    paths.add(protectionShopPath(deviceType));
    if (p.protection_brand_slug) {
      paths.add(protectionShopPath(deviceType, p.protection_brand_slug));
    }
    if (p.protection_brand_slug && p.protection_model_slug) {
      paths.add(
        protectionShopPath(
          deviceType,
          p.protection_brand_slug,
          p.protection_model_slug
        )
      );
    }
  }
  return paths;
}

export interface ProtectionNavModel {
  slug: string;
  label: string;
  isRecent: boolean;
}

export interface ProtectionNavSeriesGroup {
  seriesSlug: string;
  seriesLabel: string;
  recent: ProtectionNavModel[];
  all: ProtectionNavModel[];
}

export interface ProtectionNavBrand {
  slug: string;
  label: string;
  seriesGroups: ProtectionNavSeriesGroup[];
}

export interface ProtectionNavDevice {
  deviceType: ProtectionDeviceType;
  brands: ProtectionNavBrand[];
}

/** Mega-menu tree: only device / brand / model paths that have protection products. */
export function buildProtectionNavFromProducts(
  products: Product[]
): ProtectionNavDevice[] {
  const modelKeys = new Map<
    string,
    { deviceType: ProtectionDeviceType; brandSlug: string; modelSlug: string; brandLabel: string }
  >();

  for (const p of products) {
    if (p.category !== "protection") continue;
    if (!p.protection_device_type || !isProtectionDeviceType(p.protection_device_type)) {
      continue;
    }
    if (!p.protection_brand_slug || !p.protection_model_slug) continue;

    const key = `${p.protection_device_type}|${p.protection_brand_slug}|${p.protection_model_slug}`;
    if (!modelKeys.has(key)) {
      modelKeys.set(key, {
        deviceType: p.protection_device_type,
        brandSlug: p.protection_brand_slug,
        modelSlug: p.protection_model_slug,
        brandLabel: p.brand,
      });
    }
  }

  const deviceMap = new Map<ProtectionDeviceType, Map<string, ProtectionNavBrand>>();

  for (const entry of modelKeys.values()) {
    const { deviceType, brandSlug, modelSlug, brandLabel } = entry;
    const catalogModel = getProtectionModel(deviceType, brandSlug, modelSlug);
    const catalogBrand = getProtectionBrand(deviceType, brandSlug);

    const model: ProtectionNavModel = {
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

  const devices: ProtectionNavDevice[] = [];
  for (const deviceType of PROTECTION_DEVICE_TYPES) {
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

export function getProtectionBrandsWithProducts(
  products: Product[],
  deviceType: ProtectionDeviceType
): ProtectionNavBrand[] {
  const device = buildProtectionNavFromProducts(products).find(
    (d) => d.deviceType === deviceType
  );
  return device?.brands ?? [];
}
