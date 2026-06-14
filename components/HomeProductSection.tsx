"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";
import { Product } from "@/types";

type SectionAccent = "cyan" | "emerald" | "coral";

const ACCENT_STYLES: Record<
  SectionAccent,
  { bar: string; badge: string; link: string; bg: string }
> = {
  cyan: {
    bar: "bg-brand-cyan",
    badge: "bg-cyan-100 text-cyan-800",
    link: "text-brand-cyan hover:text-cyan-700",
    bg: "bg-gradient-to-b from-cyan-50/80 to-white",
  },
  emerald: {
    bar: "bg-brand-emerald",
    badge: "bg-emerald-100 text-emerald-800",
    link: "text-brand-emerald hover:text-emerald-700",
    bg: "bg-gradient-to-b from-emerald-50/80 to-white",
  },
  coral: {
    bar: "bg-brand-coral",
    badge: "bg-orange-100 text-orange-800",
    link: "text-brand-coral hover:text-orange-600",
    bg: "bg-gradient-to-b from-orange-50/80 to-white",
  },
};

interface HomeProductSectionProps {
  title: string;
  seeAllHref: string;
  seeAllLabel: string;
  products: Product[];
  accent?: SectionAccent;
}

export default function HomeProductSection({
  title,
  seeAllHref,
  seeAllLabel,
  products,
  accent = "cyan",
}: HomeProductSectionProps) {
  const { addItem } = useCart();
  const styles = ACCENT_STYLES[accent];

  if (products.length === 0) return null;

  return (
    <section className={`border-b border-brand-gray-200 py-8 sm:py-10 ${styles.bg}`}>
      <div className="container-app">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`h-8 w-1 shrink-0 ${styles.bar}`} aria-hidden="true" />
            <div>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${styles.badge}`}>
                {seeAllLabel}
              </span>
              <h2 className="mt-1 text-lg font-bold uppercase tracking-tight text-brand-navy sm:text-xl">
                {title}
              </h2>
            </div>
          </div>
          <Link
            href={seeAllHref}
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${styles.link}`}
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
