"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";

export default function CheckoutSuccessPage() {
  const { t } = useLanguage();
  const { clearCart, closeCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clearCart();
    closeCart();
  }, [clearCart, closeCart]);

  return (
    <div className="bg-brand-gray-50 py-12 sm:py-16">
      <div className="container-app mx-auto max-w-lg">
        <div className="border border-brand-gray-200 bg-white p-8 text-center sm:p-10">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600"
            aria-hidden="true"
          >
            ✓
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-600">
            {t.checkout.successBadge}
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-brand-navy">
            {t.checkout.successTitle}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-gray-600">
            {t.checkout.successDesc}
          </p>
          <p className="mt-2 text-xs text-brand-gray-500">
            {t.checkout.successOrderNote}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="btn-primary mx-auto w-full sm:mx-0 sm:w-auto sm:min-w-[220px]"
            >
              {t.checkout.continueShopping}
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
