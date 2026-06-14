"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[app/error]", error);
    }
  }, [error]);

  return (
    <div className="container-app flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-coral">
        Error
      </p>
      <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-brand-navy sm:text-3xl">
        {t.errors.title}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-gray-600">
        {t.errors.description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-[44px] rounded-full bg-brand-electric px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-navy"
        >
          {t.errors.retry}
        </button>
        <Link
          href="/"
          className="min-h-[44px] rounded-full border border-brand-gray-300 px-6 py-2.5 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-gray-50"
        >
          {t.errors.home}
        </Link>
      </div>
    </div>
  );
}
