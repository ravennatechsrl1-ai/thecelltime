"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-brand-gray-200 bg-brand-gray-50">
      <div className="container-app py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-black uppercase tracking-tighter">
              TheCellTime
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-brand-gray-600">
              {t.footer.desc}
            </p>
          </div>

          <div>
            <p className="section-title mb-3">{t.footer.navigation}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-brand-gray-600 hover:text-brand-black">
                  {t.nav.shop}
                </Link>
              </li>
              <li>
                <Link href="/repair" className="text-brand-gray-600 hover:text-brand-black">
                  {t.nav.repair}
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-brand-gray-600 hover:text-brand-black">
                  {t.nav.track}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="section-title mb-3">{t.footer.contacts}</p>
            <ul className="space-y-2 text-sm text-brand-gray-600">
              <li>Via Roma 42, Milano</li>
              <li>+39 02 1234 5678</li>
              <li>info@thecelltime.it</li>
            </ul>
          </div>

          <div>
            <p className="section-title mb-3">{t.footer.hours}</p>
            <ul className="space-y-2 text-sm text-brand-gray-600">
              <li>{t.footer.weekdays}</li>
              <li>{t.footer.saturday}</li>
              <li>{t.footer.sunday}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-brand-gray-200 pt-6 text-xs text-brand-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TheCellTime. {t.footer.rights}</p>
          <p>{t.footer.payments}</p>
        </div>
      </div>
    </footer>
  );
}
