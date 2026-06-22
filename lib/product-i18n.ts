import { DEFAULT_LOCALE } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/types";
import { ProductNameI18n } from "@/types";

export function parseNameI18n(raw: unknown): ProductNameI18n | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const record = raw as Record<string, unknown>;
  const parsed: ProductNameI18n = {};

  for (const locale of ["it", "en"] as const) {
    const value = record[locale];
    if (typeof value === "string" && value.trim()) {
      parsed[locale] = value.trim();
    }
  }

  return Object.keys(parsed).length > 0 ? parsed : null;
}

export function resolveLocalizedText(
  locale: Locale,
  fallback: string,
  i18n?: ProductNameI18n | null
): string {
  const trimmedFallback = fallback.trim();

  const fromLocale = i18n?.[locale]?.trim();
  if (fromLocale) return fromLocale;

  const fromDefault = i18n?.[DEFAULT_LOCALE]?.trim();
  if (fromDefault) return fromDefault;

  const fromAny = i18n
    ? Object.values(i18n).find((value) => value?.trim())?.trim()
    : undefined;
  if (fromAny) return fromAny;

  return trimmedFallback;
}

export function buildNameI18nFromForm(
  primaryName: string,
  englishName?: string | null
): ProductNameI18n {
  const it = primaryName.trim();
  const en = englishName?.trim() || it;
  return { it, en };
}

export function readNameI18nFromFormData(
  formData: FormData
): ProductNameI18n | null {
  const raw = formData.get("name_i18n")?.toString();
  if (raw?.trim()) {
    try {
      return parseNameI18n(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  const primary = formData.get("name")?.toString().trim();
  if (!primary) return null;

  const english = formData.get("name_en")?.toString();
  return buildNameI18nFromForm(primary, english);
}

export function getProductSearchText(product: {
  name: string;
  brand: string;
  name_i18n?: ProductNameI18n | null;
  phone_listing_base_name?: string | null;
  phone_listing_base_name_i18n?: ProductNameI18n | null;
}): string {
  const parts = [product.name, product.brand];

  if (product.name_i18n) {
    parts.push(...Object.values(product.name_i18n));
  }
  if (product.phone_listing_base_name) {
    parts.push(product.phone_listing_base_name);
  }
  if (product.phone_listing_base_name_i18n) {
    parts.push(...Object.values(product.phone_listing_base_name_i18n));
  }

  return parts.join(" ").toLowerCase();
}
