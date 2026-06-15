"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data: { products: Product[] } = await response.json();
          setProducts(data.products ?? []);
        }
      } catch {
        // keep empty catalog on failure
      }
    }
    fetchProducts();
  }, []);

  const newArrivals = useMemo(
    () => products.filter((p) => p.condition === "new").slice(0, 9),
    [products]
  );

  const inStock = useMemo(
    () => products.filter((p) => p.stock > 0).slice(0, 9),
    [products]
  );

  const promotions = useMemo(
    () => products.filter((p) => isOnPromotion(p)).slice(0, 6),
    [products]
  );

  return (
    <>
      <ErrorBoundary fallback={null}>
        <HeroCarousel />
      </ErrorBoundary>

      <HomeMobilaxDualCatalog
        newArrivals={newArrivals}
        inStock={inStock}
      />

      <HomeCategoryNav />

      <HomeProductSection
        title={t.home.promotions}
        seeAllHref="/shop/promotions"
        seeAllLabel={t.home.seeAll}
        products={promotions}
      />

      <HomeBrandLogosSlider />

      <HomeTrustSection />
    </>
  );
}
