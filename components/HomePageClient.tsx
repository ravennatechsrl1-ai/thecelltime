"use client";

import { useMemo } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import HeroCarousel from "@/components/HeroCarousel";
import HomeCategoryNav from "@/components/HomeCategoryNav";
import HomeMobilaxDualCatalog from "@/components/HomeMobilaxDualCatalog";
import HomeProductSection from "@/components/HomeProductSection";
import HomeBrandLogosSlider from "@/components/HomeBrandLogosSlider";
import HomeTrustSection from "@/components/HomeTrustSection";
import { useLanguage } from "@/components/LanguageProvider";
import { isOnPromotion } from "@/lib/product-pricing";
import { Product } from "@/types";

export default function HomePageClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const { t } = useLanguage();

  const phones = useMemo(
    () =>
      initialProducts
        .filter((p) => p.category === "phones" && p.stock > 0)
        .slice(0, 9),
    [initialProducts]
  );

  const accessoriesAndProtection = useMemo(
    () =>
      initialProducts
        .filter(
          (p) =>
            (p.category === "accessories" || p.category === "protection") &&
            p.stock > 0
        )
        .slice(0, 9),
    [initialProducts]
  );

  const promotions = useMemo(
    () => initialProducts.filter((p) => isOnPromotion(p)).slice(0, 6),
    [initialProducts]
  );

  return (
    <>
      <HomeProductSection
        title={t.home.promotions}
        seeAllHref="/shop/promotions"
        seeAllLabel={t.home.seeAll}
        products={promotions}
      />

      <HomeMobilaxDualCatalog
        phones={phones}
        accessoriesAndProtection={accessoriesAndProtection}
      />

      <HomeCategoryNav />

      <ErrorBoundary fallback={null}>
        <HeroCarousel />
      </ErrorBoundary>

      <HomeBrandLogosSlider />

      <HomeTrustSection />
    </>
  );
}
