"use client";

import { useLanguage } from "@/components/LanguageProvider";
import {
  getPromotionStripText,
  isPromotionStripVisible,
  PromotionStrip,
} from "@/lib/promotion-strip";

export default function PromotionStripBanner({ strip }: { strip: PromotionStrip }) {
  const { locale } = useLanguage();
  const text = getPromotionStripText(strip, locale);

  if (!isPromotionStripVisible(strip, locale)) return null;

  return (
    <div
      className="border-b border-brand-electric-dark/20 bg-gradient-to-r from-brand-electric to-brand-electric-dark"
      role="region"
      aria-label="Promotion announcement"
    >
      <div className="container-app py-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-white sm:text-base">
          {text}
        </p>
      </div>
    </div>
  );
}
