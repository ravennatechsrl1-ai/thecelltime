"use client";

import { useCatalogBrandsContext } from "@/components/CatalogBrandsProvider";

export function useCatalogBrands() {
  return useCatalogBrandsContext();
}
