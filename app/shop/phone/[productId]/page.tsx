import { notFound } from "next/navigation";
import PhoneProductDetail from "@/components/PhoneProductDetail";
import {
  pickInitialVariant,
  resolveListingVariants,
} from "@/lib/phone-listings";
import { getProductsCached } from "@/lib/server/products";

export const revalidate = 60;

interface PhoneProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function PhoneProductPage({ params }: PhoneProductPageProps) {
  const { productId } = await params;
  const products = await getProductsCached();
  const variants = resolveListingVariants(productId, products);

  if (variants.length === 0) {
    notFound();
  }

  const initialVariant = pickInitialVariant(variants, productId);

  return (
    <PhoneProductDetail
      variants={variants}
      initialVariant={initialVariant}
    />
  );
}
