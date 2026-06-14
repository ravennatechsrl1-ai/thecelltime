"use client";

import Link from "next/link";
import MobilaxCatalogToolbar from "@/components/MobilaxCatalogToolbar";
import MobilaxGridProductCard from "@/components/MobilaxGridProductCard";
import { useLanguage } from "@/components/LanguageProvider";
import { Product } from "@/types";

interface MobilaxCatalogPanelProps {
  title: string;
  products: Product[];
  seeMoreHref: string;
}

function MobilaxCatalogPanel({
  title,
  products,
  seeMoreHref,
}: MobilaxCatalogPanelProps) {
  const { t } = useLanguage();
  const displayProducts = products.slice(0, 9);

  if (displayProducts.length === 0) return null;

  return (
    <div className="overflow-hidden border border-brand-gray-200 bg-white">
      <div className="mobilax-section-header px-3 pt-4 sm:px-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-navy sm:text-sm">
          {title}
        </h2>
        <MobilaxCatalogToolbar filterAllLabel={t.home.filterAll} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-px bg-brand-gray-200">
        {displayProducts.map((product) => (
          <MobilaxGridProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex justify-center border-t border-brand-gray-200 px-4 py-4">
        <Link
          href={seeMoreHref}
          className="inline-flex min-h-[40px] items-center rounded-full border border-brand-gray-300 bg-white px-8 text-xs font-bold uppercase tracking-wide text-brand-gray-700 transition-colors hover:border-brand-black hover:text-brand-black"
        >
          {t.home.showMore}
        </Link>
      </div>
    </div>
  );
}

interface HomeMobilaxDualCatalogProps {
  newArrivals: Product[];
  inStock: Product[];
}

export default function HomeMobilaxDualCatalog({
  newArrivals,
  inStock,
}: HomeMobilaxDualCatalogProps) {
  const { t } = useLanguage();

  return (
    <section className="border-t border-brand-gray-200 bg-[#f7f7f7] py-6 sm:py-8">
      <div className="container-app">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <MobilaxCatalogPanel
            title={t.home.newArrivals}
            products={newArrivals}
            seeMoreHref="/shop/phones/new"
          />
          <MobilaxCatalogPanel
            title={t.home.backInStock}
            products={inStock}
            seeMoreHref="/shop"
          />
        </div>
      </div>
    </section>
  );
}
