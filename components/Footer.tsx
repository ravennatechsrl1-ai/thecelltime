"use client";

import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { useLanguage } from "@/components/LanguageProvider";
import { COMPANY_INFO } from "@/lib/company-info";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-brand-navy-light bg-brand-navy text-brand-gray-300">
      <div className="container-app py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <SiteLogo className="h-10 w-auto brightness-110" linked={false} />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-gray-400">
              {t.footer.desc}
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-silver">
              {t.footer.navigation}
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/shop"
                  className="text-brand-gray-400 transition-colors duration-200 hover:text-brand-electric-light"
                >
                  {t.nav.shop}
                </Link>
              </li>
              <li>
                <Link
                  href="/repair"
                  className="text-brand-gray-400 transition-colors duration-200 hover:text-brand-electric-light"
                >
                  {t.nav.repair}
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="text-brand-gray-400 transition-colors duration-200 hover:text-brand-electric-light"
                >
                  {t.nav.track}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-silver">
              {t.footer.contacts}
            </p>
            <ul className="space-y-2 text-sm text-brand-gray-400">
              <li className="font-semibold text-brand-gray-300">
                {COMPANY_INFO.name}
              </li>
              <li>{COMPANY_INFO.addressLine1}</li>
              <li>{COMPANY_INFO.addressLine2}</li>
              <li>
                {t.footer.vatId}: {COMPANY_INFO.vatId}
              </li>
              <li>
                {t.footer.tel}:{" "}
                <a
                  href={`tel:${COMPANY_INFO.tel}`}
                  className="transition-colors hover:text-brand-electric-light"
                >
                  {COMPANY_INFO.tel}
                </a>
              </li>
              <li>
                {t.footer.mobile}:{" "}
                <a
                  href={`tel:${COMPANY_INFO.mobile}`}
                  className="transition-colors hover:text-brand-electric-light"
                >
                  {COMPANY_INFO.mobile}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-silver">
              {t.footer.hours}
            </p>
            <ul className="space-y-2 text-sm text-brand-gray-400">
              <li>{t.footer.weekdays}</li>
              <li>{t.footer.sunday}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-brand-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TheCellTime. {t.footer.rights}</p>
          <p>{t.footer.payments}</p>
        </div>
      </div>
    </footer>
  );
}
