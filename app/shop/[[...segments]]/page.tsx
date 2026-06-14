import { notFound, redirect } from "next/navigation";
import ShopCatalog from "@/components/ShopCatalog";
import {
  legacyShopQueryToPath,
  parseShopSegments,
} from "@/lib/shop-routes";

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

  return <ShopCatalog view={view} />;
}
