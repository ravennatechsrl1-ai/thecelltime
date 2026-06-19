"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";

let sharedPromise: Promise<Product[]> | null = null;

function fetchProductsOnce(): Promise<Product[]> {
  if (!sharedPromise) {
    sharedPromise = fetch("/api/products")
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products?: Product[] }) => data.products ?? [])
      .catch(() => [] as Product[]);
  }
  return sharedPromise;
}

/** Fetch the product catalog once per session (deduped). Pass enabled=true to start loading. */
export function useLazyProducts(enabled: boolean) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setLoading(true);

    void fetchProductsOnce().then((data) => {
      if (!cancelled) {
        setProducts(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { products, loading };
}

/** Invalidate shared cache after admin product changes (optional). */
export function resetProductsCache() {
  sharedPromise = null;
}
