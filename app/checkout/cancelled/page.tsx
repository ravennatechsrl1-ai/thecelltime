"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function CheckoutCancelledPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-gray-50 py-12 sm:py-16">
      <div className="container-app mx-auto max-w-lg">
        <div className="border border-brand-gray-200 bg-white p-8 text-center sm:p-10">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl text-brand-coral"
            aria-hidden="true"
          >
            ×
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-coral">
            {t.checkout.cancelledBadge}
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-brand-navy">
            {t.checkout.cancelledTitle}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-gray-600">
            {t.checkout.cancelledDesc}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="btn-primary mx-auto w-full sm:mx-0 sm:w-auto sm:min-w-[220px]"
            >
              {t.checkout.tryAgain}
            </Link>
            <Link
              href="/"
              className="btn-secondary mx-auto w-full sm:mx-0 sm:w-auto sm:min-w-[220px]"
            >
              {t.checkout.backHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
