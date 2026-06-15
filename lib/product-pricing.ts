import { Product } from "@/types";

export function isOnPromotion(product: Product): boolean {
  return (
    product.promotion_percent != null &&
    product.promotion_percent > 0 &&
    product.promotion_percent <= 100
  );
}

export function calculatePromoPrice(
  originalPrice: number,
  promotionPercent: number
): number {
  const discounted = originalPrice * (1 - promotionPercent / 100);
  return Math.round(discounted * 100) / 100;
}

export function getEffectivePrice(product: Product): number {
  if (!isOnPromotion(product)) return product.price;
  return calculatePromoPrice(product.price, product.promotion_percent!);
}

export function getPromotionSavings(product: Product): number {
  if (!isOnPromotion(product)) return 0;
  return Math.round((product.price - getEffectivePrice(product)) * 100) / 100;
}
