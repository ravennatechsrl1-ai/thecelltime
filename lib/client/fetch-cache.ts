import { CatalogBrand } from "@/lib/catalog-brands-sync";
import { Product } from "@/types";

let productsPromise: Promise<Product[]> | null = null;
let brandsPromise: Promise<CatalogBrand[]> | null = null;

export function fetchProductsCached(): Promise<Product[]> {
  if (!productsPromise) {
    productsPromise = fetch("/api/products")
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products?: Product[] }) => data.products ?? [])
      .catch(() => [] as Product[]);
  }
  return productsPromise;
}

export function fetchBrandsCached(): Promise<CatalogBrand[]> {
  if (!brandsPromise) {
    brandsPromise = fetch("/api/catalog/brands")
      .then((response) => (response.ok ? response.json() : { brands: [] }))
      .then((data: { brands?: CatalogBrand[] }) => data.brands ?? [])
      .catch(() => [] as CatalogBrand[]);
  }
  return brandsPromise;
}

export function invalidateClientFetchCache() {
  productsPromise = null;
  brandsPromise = null;
}
