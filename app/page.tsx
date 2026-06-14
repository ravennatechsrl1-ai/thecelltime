"use client";

import { useEffect, useMemo, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import HeroCarousel from "@/components/HeroCarousel";
import HomeCategoryNav from "@/components/HomeCategoryNav";
import HomeMobilaxDualCatalog from "@/components/HomeMobilaxDualCatalog";
import HomeProductSection from "@/components/HomeProductSection";
import HomeTrustSection from "@/components/HomeTrustSection";
import { useLanguage } from "@/components/LanguageProvider";
import { MOCK_PRODUCTS } from "@/lib/constants";
import { Product } from "@/types";

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data: { products: Product[] } = await response.json();
          if (data.products.length > 0) setProducts(data.products);
        }
      } catch {
        // fallback mock
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
    () =>
      products
        .filter((p) => p.condition === "used" || p.category === "accessories")
        .slice(0, 6),
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
        seeAllHref="/shop/phones/used"
        seeAllLabel={t.home.seeAll}
        products={promotions}
        accent="coral"
      />

      <HomeTrustSection />
    </>
  );
}
