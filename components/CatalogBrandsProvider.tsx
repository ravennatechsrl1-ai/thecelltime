"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { CatalogBrand } from "@/lib/catalog-brands-sync";

interface CatalogBrandsContextValue {
  brands: CatalogBrand[];
  loading: boolean;
}

const CatalogBrandsContext = createContext<CatalogBrandsContextValue>({
  brands: [],
  loading: true,
});

export function CatalogBrandsProvider({
  children,
  initialBrands = [],
}: {
  children: ReactNode;
  initialBrands?: CatalogBrand[];
}) {
  const value = useMemo(
    () => ({
      brands: initialBrands,
      loading: false,
    }),
    [initialBrands]
  );

  return (
    <CatalogBrandsContext.Provider value={value}>
      {children}
    </CatalogBrandsContext.Provider>
  );
}

export function useCatalogBrandsContext() {
  return useContext(CatalogBrandsContext);
}
