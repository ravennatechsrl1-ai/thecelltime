import { notFound, redirect } from "next/navigation";
import CatalogProductDetail from "@/components/CatalogProductDetail";
import { phoneProductPath } from "@/lib/phone-listings";
import { getProductsCached } from "@/lib/server/products";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const products = await getProductsCached();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

  if (product.category === "phones") {
    redirect(phoneProductPath(product.phone_listing_id ?? product.id));
  }

  return <CatalogProductDetail product={product} />;
}
