"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  formatCurrency,
  getTranslations,
  resolveIssueLabel,
  translateStatus,
} from "@/lib/i18n";
import { Locale, Translations } from "@/lib/i18n/types";
import { persistLocale, readClientLocale } from "@/lib/locale-cookie";
import { RepairTicketStatus } from "@/types";

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  formatPrice: (amount: number) => string;
  tStatus: (status: RepairTicketStatus) => string;
  tIssue: (issue: string) => string;
  hydrated: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readClientLocale();
    if (stored !== initialLocale) {
      setLocaleState(stored);
    }
    setHydrated(true);
  }, [initialLocale]);

  useEffect(() => {
    if (!hydrated) return;
    persistLocale(locale);
    document.documentElement.lang = locale;
  }, [locale, hydrated]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const t = useMemo(() => getTranslations(locale), [locale]);

  const formatPrice = useCallback(
    (amount: number) => formatCurrency(amount, locale),
    [locale]
  );

  const tStatus = useCallback(
    (status: RepairTicketStatus) => translateStatus(status, t),
    [t]
  );

  const tIssue = useCallback(
    (issue: string) => resolveIssueLabel(issue, t),
    [t]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, t, setLocale, formatPrice, tStatus, tIssue, hydrated }),
    [locale, t, setLocale, formatPrice, tStatus, tIssue, hydrated]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
