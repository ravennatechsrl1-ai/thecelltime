"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  IconAccessories,
  IconChevronRight,
  IconPhone,
  IconPromotions,
  IconRepair,
  NavIconWrap,
} from "@/components/icons/NavIcons";

export default function HomeCategoryNav() {
  const { t } = useLanguage();

  const categories = useMemo(
    () => [
      {
        href: "/shop/phones/new",
        title: t.home.ctaPhonesTitle,
        subtitle: t.home.ctaPhonesSubtitle,
        desc: t.home.ctaPhonesDesc,
        icon: <IconPhone className="h-4 w-4" />,
      },
      {
        href: "/shop/phones/used",
        title: t.shop.filterPhonesUsed,
        subtitle: t.conditions.usedA,
        desc: t.home.trustWarrantyText,
        icon: <IconPromotions className="h-4 w-4" />,
      },
      {
        href: "/shop/accessories",
        title: t.home.ctaAccessoriesTitle,
        subtitle: t.home.ctaAccessoriesSubtitle,
        desc: t.home.ctaAccessoriesDesc,
        icon: <IconAccessories className="h-4 w-4" />,
      },
      {
        href: "/repair",
        title: t.home.ctaRepairTitle,
        subtitle: t.home.ctaRepairSubtitle,
        desc: t.home.ctaRepairDesc,
        icon: <IconRepair className="h-4 w-4" />,
      },
    ],
    [t]
  );

  const brands = useMemo(
    () => [
      { href: "/shop/phones/new/apple", label: t.nav.brandApple },
      { href: "/shop/phones/new/samsung", label: t.nav.brandSamsung },
      { href: "/shop/phones/new", label: t.nav.allBrands },
    ],
    [t]
  );

  return (
    <section className="border-y border-brand-gray-200 bg-brand-gray-50 py-10 sm:py-12">
      <div className="container-app">
        <div className="mobilax-section-header mb-6 border-b-0 pb-0">
          <div>
            <p className="section-title">{t.home.catalogTitle}</p>
            <h2 className="mt-1 text-lg font-bold uppercase tracking-tight text-brand-navy sm:text-xl">
              {t.home.catalogHeading}
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="mobilax-category-tile group flex min-h-[104px] flex-row items-center gap-3 sm:min-h-[112px] sm:gap-4"
            >
              <NavIconWrap className="transition-colors duration-200 group-hover:bg-brand-electric/10 group-hover:text-brand-electric">
                {cat.icon}
              </NavIconWrap>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                  {cat.subtitle}
                </p>
                <p className="mt-0.5 text-sm font-bold uppercase tracking-wide text-brand-navy transition-colors duration-200 group-hover:text-brand-electric">
                  {cat.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-brand-gray-500">
                  {cat.desc}
                </p>
              </div>
              <IconChevronRight className="h-4 w-4 shrink-0 text-brand-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-electric" />
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-brand-gray-200 pt-6">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
            {t.shop.brandsSidebar}:
          </span>
          {brands.map((brand) => (
            <Link
              key={brand.href}
              href={brand.href}
              className="inline-flex min-h-[36px] items-center border border-brand-gray-200 bg-white px-4 text-xs font-semibold uppercase tracking-wide text-brand-gray-700 transition-all duration-200 hover:border-brand-electric hover:text-brand-electric"
            >
              {brand.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
