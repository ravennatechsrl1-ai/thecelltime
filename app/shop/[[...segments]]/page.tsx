import { notFound, redirect } from "next/navigation";
import AccessoriesShopCatalog from "@/components/AccessoriesShopCatalog";
import ProtectionShopCatalog from "@/components/ProtectionShopCatalog";
import ShopCatalog from "@/components/ShopCatalog";
import {
  isAccessoriesHierarchyView,
  isProtectionShopView,
  legacyShopQueryToPath,
  parseShopSegments,
} from "@/lib/shop-routes";
import { getProductsCached } from "@/lib/server/products";

export const revalidate = 60;

interface ShopPageProps {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const legacyPath = legacyShopQueryToPath(resolvedSearchParams);
  if (legacyPath) {
    redirect(legacyPath);
  }

  const view = parseShopSegments(resolvedParams.segments);
  if (!view) {
    notFound();
  }

  const products = await getProductsCached();

  if (isProtectionShopView(view)) {
    return <ProtectionShopCatalog view={view} initialProducts={products} />;
  }

  if (isAccessoriesHierarchyView(view)) {
    return <AccessoriesShopCatalog view={view} initialProducts={products} />;
  }

  return <ShopCatalog view={view} initialProducts={products} />;
}
