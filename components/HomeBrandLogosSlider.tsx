"use client";

import { useMemo } from "react";
import { PhoneBrandLogo } from "@/components/brand-logos/PhoneBrandLogos";
import { useLanguage } from "@/components/LanguageProvider";
import { PHONE_BRANDS } from "@/lib/phone-brands";

function BrandLogoTile({ slug, label }: { slug: string; label: string }) {
  return (
    <div
      className="flex h-[4.5rem] w-[9.5rem] shrink-0 items-center justify-center rounded-xl border border-brand-gray-200/80 bg-white px-5 shadow-sm sm:h-20 sm:w-[11rem]"
      aria-hidden
    >
      <PhoneBrandLogo
        brand={slug}
        label={label}
        className="h-8 w-auto max-w-[112px] object-contain opacity-90 sm:h-9 sm:max-w-[128px]"
      />
    </div>
  );
}

export default function HomeBrandLogosSlider() {
  const { t } = useLanguage();

  const brands = useMemo(
    () =>
      PHONE_BRANDS.map((brand) => ({
        slug: brand.slug,
        label: t.nav[brand.labelKey],
      })),
    [t]
  );

  const track = [...brands, ...brands];

  return (
    <section
      className="relative overflow-hidden border-b border-brand-gray-200 bg-gradient-to-b from-white via-[#f8faff] to-white py-8 sm:py-10"
      aria-label={t.home.brandsSliderTitle}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24" />

      <div className="container-app mb-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-electric">
          {t.home.brandsSliderBadge}
        </p>
        <h2 className="mt-2 text-lg font-bold uppercase tracking-tight text-brand-navy sm:text-xl">
          {t.home.brandsSliderTitle}
        </h2>
      </div>

      <div className="relative overflow-hidden motion-reduce:hidden">
        <div className="flex w-max animate-marquee gap-4 px-4 sm:gap-5">
          {track.map((brand, index) => (
            <BrandLogoTile
              key={`${brand.slug}-${index}`}
              slug={brand.slug}
              label={brand.label}
            />
          ))}
        </div>
      </div>

      <div className="hidden flex-wrap justify-center gap-4 px-4 motion-reduce:flex sm:gap-5">
        {brands.map((brand) => (
          <BrandLogoTile
            key={brand.slug}
            slug={brand.slug}
            label={brand.label}
          />
        ))}
      </div>
    </section>
  );
}
