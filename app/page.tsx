import HomePageClient from "@/components/HomePageClient";
import { getPromotionStripCached } from "@/lib/promotion-strip";
import { getProductsCached } from "@/lib/server/products";

export const revalidate = 60;

export default async function HomePage() {
  const [products, promotionStrip] = await Promise.all([
    getProductsCached(),
    getPromotionStripCached(),
  ]);
  return (
    <HomePageClient
      initialProducts={products}
      promotionStrip={promotionStrip}
    />
  );
}
