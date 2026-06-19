"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Product } from "@/types";
import { fetchProductsCached } from "@/lib/client/fetch-cache";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  ensureLoaded: () => void;
}

const ProductsContext = createContext<ProductsContextValue>({
  products: [],
  loading: false,
  ensureLoaded: () => {},
});

let sharedFetch: Promise<Product[]> | null = null;

function fetchProductsOnce(): Promise<Product[]> {
  if (!sharedFetch) {
    sharedFetch = fetchProductsCached();
  }
  return sharedFetch;
}

export function ProductsProvider({
  children,
  initialProducts,
}: {
  children: ReactNode;
  initialProducts?: Product[];
}) {
  const hasInitial = initialProducts !== undefined;
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(false);
  const startedRef = useRef(hasInitial);

  const ensureLoaded = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setLoading(true);
    void fetchProductsOnce().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      products,
      loading,
      ensureLoaded,
    }),
    [products, loading, ensureLoaded]
  );

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
