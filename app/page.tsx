import HomePageClient from "@/components/HomePageClient";
import { getProductsCached } from "@/lib/server/products";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProductsCached();
  return <HomePageClient initialProducts={products} />;
}
