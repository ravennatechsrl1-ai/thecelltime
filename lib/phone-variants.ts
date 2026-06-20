import { Product } from "@/types";

const STORAGE_PATTERN = /\b(\d+(?:GB|TB))\b/i;

export function getPhoneStorageLabel(product: Product): string | null {
  if (product.storage?.trim()) return product.storage.trim();
  const match = product.name.match(STORAGE_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

export function getPhoneColorLabel(product: Product): string | null {
  if (product.color?.trim()) return product.color.trim();
  return null;
}

/** Base product name without color suffix. */
export function getPhoneBaseName(product: Product): string {
  const name = product.name.trim();
  const color = getPhoneColorLabel(product);
  if (color && name.endsWith(` ${color}`)) {
    return name.slice(0, -(color.length + 1)).trim();
  }
  const parts = name.split(/\s+/);
  if (parts.length >= 4) {
    return parts.slice(0, -1).join(" ");
  }
  return name;
}

export function getPhoneVariantKey(product: Product): string | null {
  if (product.category !== "phones") return null;
  const baseName = getPhoneBaseName(product);
  const storage = getPhoneStorageLabel(product);
  if (storage) {
    return `${product.brand}|${product.condition ?? ""}|${storage}|${baseName}`;
  }
  if (baseName !== product.name.trim()) {
    return `${product.brand}|${product.condition ?? ""}|${baseName}`;
  }
  return null;
}

export function findPhoneColorVariants(
  product: Product,
  allProducts: Product[]
): Product[] {
  if (product.category !== "phones") return [product];

  const phones = allProducts.filter((p) => p.category === "phones");
  const key = getPhoneVariantKey(product);

  if (key) {
    const siblings = phones.filter((p) => getPhoneVariantKey(p) === key);
    if (siblings.length > 0) {
      return siblings.sort((a, b) =>
        (getPhoneColorLabel(a) ?? a.name).localeCompare(
          getPhoneColorLabel(b) ?? b.name
        )
      );
    }
  }

  return [product];
}

/** Product title without trailing color (shown separately in color picker). */
export function getPhoneDisplayName(product: Product): string {
  return getPhoneBaseName(product);
}

export function getColorSwatchHex(
  label: string,
  hexByLabel: Map<string, string>
): string {
  const fromCatalog = hexByLabel.get(label.trim().toLowerCase());
  if (fromCatalog) return fromCatalog;

  const normalized = label.trim().toLowerCase();
  const defaults: Record<string, string> = {
    black: "#1a1a1a",
    white: "#f5f5f5",
    blue: "#2563eb",
    pink: "#ec4899",
    green: "#22c55e",
    gold: "#d4af37",
    silver: "#c0c0c0",
    purple: "#7c3aed",
    red: "#ef4444",
    titanium: "#8b8b8b",
    natural: "#e8dcc8",
    graphite: "#4a4a4a",
  };

  return defaults[normalized] ?? "#64748b";
}
