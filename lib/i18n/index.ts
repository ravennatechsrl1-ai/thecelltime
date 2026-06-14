import { en } from "@/lib/i18n/translations/en";
import { fr } from "@/lib/i18n/translations/fr";
import { it } from "@/lib/i18n/translations/it";
import { Locale, LocaleConfig, Translations } from "@/lib/i18n/types";
import { RepairTicketStatus } from "@/types";

export const LOCALES: LocaleConfig[] = [
  { code: "it", label: "Italiano", htmlLang: "it", intlLocale: "it-IT" },
  { code: "en", label: "English", htmlLang: "en", intlLocale: "en-GB" },
  { code: "fr", label: "Français", htmlLang: "fr", intlLocale: "fr-FR" },
];

export const DEFAULT_LOCALE: Locale = "it";

export const LOCALE_STORAGE_KEY = "thecelltime-locale";

const dictionaries: Record<Locale, Translations> = { it, en, fr };

export function getTranslations(locale: Locale): Translations {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isValidLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

export function formatCurrency(amount: number, locale: Locale): string {
  const config = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
  return new Intl.NumberFormat(config.intlLocale, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/** DB stores Italian status strings — map to translation keys */
export const STATUS_DB_TO_KEY: Record<
  RepairTicketStatus,
  keyof Translations["status"]
> = {
  Ricevuto: "received",
  "In Diagnostica": "diagnostics",
  "In Riparazione": "repairing",
  "Pronto al Ritiro": "ready",
};

export const STATUS_KEY_TO_DB: Record<
  keyof Translations["status"],
  RepairTicketStatus
> = {
  received: "Ricevuto",
  diagnostics: "In Diagnostica",
  repairing: "In Riparazione",
  ready: "Pronto al Ritiro",
};

export type RepairIssueId = keyof Translations["repair"]["issues"];

export const REPAIR_ISSUE_IDS: RepairIssueId[] = [
  "screen",
  "battery",
  "charging",
];

/** Resolve issue label from DB value (id or legacy Italian text) */
export function resolveIssueLabel(
  issue: string,
  t: Translations
): string {
  if (issue in t.repair.issues) {
    return t.repair.issues[issue as RepairIssueId];
  }
  const legacyMap: Record<string, RepairIssueId> = {
    "Schermo Rotto": "screen",
    "Sostituzione Batteria": "battery",
    "Connettore di Ricarica": "charging",
  };
  const key = legacyMap[issue];
  return key ? t.repair.issues[key] : issue;
}

export function translateStatus(
  dbStatus: RepairTicketStatus,
  t: Translations
): string {
  const key = STATUS_DB_TO_KEY[dbStatus];
  return t.status[key];
}
