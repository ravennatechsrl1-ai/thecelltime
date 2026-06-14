import { DEFAULT_LOCALE, isValidLocale, LOCALE_STORAGE_KEY } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/types";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function resolveLocale(value: string | null | undefined): Locale {
  if (value && isValidLocale(value)) return value;
  return DEFAULT_LOCALE;
}

export function persistLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale};path=/;max-age=${ONE_YEAR_SECONDS};SameSite=Lax`;
}

export function readClientLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && isValidLocale(stored)) return stored;
  return DEFAULT_LOCALE;
}
