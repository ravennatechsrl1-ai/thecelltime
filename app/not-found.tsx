"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="container-app flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-6xl font-black text-brand-gray-200">404</p>
      <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-brand-navy sm:text-3xl">
        {t.errors.notFoundTitle}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-gray-600">
        {t.errors.notFoundDescription}
      </p>
      <Link
        href="/"
        className="mt-8 min-h-[44px] rounded-full bg-brand-electric px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-navy"
      >
        {t.errors.home}
      </Link>
    </div>
  );
}
