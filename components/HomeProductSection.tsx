"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";
import { Product } from "@/types";

interface HomeProductSectionProps {
  title: string;
  seeAllHref: string;
  seeAllLabel: string;
  products: Product[];
}

export default function HomeProductSection({
  title,
  seeAllHref,
  seeAllLabel,
  products,
}: HomeProductSectionProps) {
  const { addItem } = useCart();

  if (products.length === 0) return null;

  return (
    <section className="border-b border-brand-gray-200 bg-white py-8 sm:py-10">
      <div className="container-app">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-1 shrink-0 bg-brand-electric"
              aria-hidden="true"
            />
            <div>
              <span className="inline-block bg-brand-electric/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-electric">
                {seeAllLabel}
              </span>
              <h2 className="mt-1 text-lg font-bold uppercase tracking-tight text-brand-navy sm:text-xl">
                {title}
              </h2>
            </div>
          </div>
          <Link
            href={seeAllHref}
            className="text-xs font-bold uppercase tracking-widest text-brand-electric transition-colors duration-200 hover:text-brand-electric-dark"
          >
            {seeAllLabel} →
          </Link>
        </div>

        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 xl:grid-cols-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="carousel"
              onAddToCart={() => addItem(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
