"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/types";
import { useLanguage } from "@/components/LanguageProvider";
import { FlagIcon } from "@/components/icons/FlagIcons";

const LOCALE_META: Record<
  Locale,
  { code: string; name: string }
> = {
  it: { code: "IT", name: "Italia" },
  en: { code: "EN", name: "English" },
};

export default function LanguageSwitcher({ inverted = false }: { inverted?: boolean }) {
  const { locale, setLocale, t, hydrated } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectLocale(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  const current = LOCALE_META[locale];

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-9 items-center gap-2 rounded-md px-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${
          inverted
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-brand-gray-100 text-brand-black hover:bg-brand-gray-200"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t.language.label}
        suppressHydrationWarning
      >
        <FlagIcon locale={locale} className="h-3.5 w-5 shrink-0" />
        <span suppressHydrationWarning>{current.code}</span>
      </button>

      {hydrated && open && (
        <div
          role="listbox"
          aria-label={t.language.label}
          className="absolute left-0 top-[calc(100%+8px)] z-[60] min-w-[240px] rounded-2xl border border-brand-gray-100 bg-white p-5 shadow-xl"
        >
          <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
            {LOCALES.map((entry) => {
              const meta = LOCALE_META[entry.code];
              const selected = entry.code === locale;

              return (
                <li key={entry.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectLocale(entry.code)}
                    className={`flex w-full items-center gap-2.5 text-left text-sm transition-colors ${
                      selected
                        ? "font-semibold text-brand-black"
                        : "font-medium text-brand-gray-700 hover:text-brand-black"
                    }`}
                  >
                    <FlagIcon
                      locale={entry.code}
                      className="h-3.5 w-5 shrink-0"
                    />
                    <span>{meta.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
