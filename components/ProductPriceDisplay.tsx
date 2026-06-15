"use client";

import { useLanguage } from "@/components/LanguageProvider";
import {
  getEffectivePrice,
  isOnPromotion,
} from "@/lib/product-pricing";
import { Product } from "@/types";

export default function ProductPriceDisplay({
  product,
  size = "md",
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
}) {
  const { formatPrice } = useLanguage();
  const onPromo = isOnPromotion(product);
  const salePrice = getEffectivePrice(product);

  const saleSize =
    size === "lg"
      ? "text-base font-bold sm:text-lg"
      : size === "sm"
        ? "text-sm font-bold sm:text-base"
        : "text-base font-bold sm:text-lg";

  const originalSize =
    size === "lg"
      ? "text-[11px] sm:text-xs"
      : size === "sm"
        ? "text-[10px]"
        : "text-xs";

  if (!onPromo) {
    return (
      <p className={`${saleSize} text-brand-navy`}>
        {formatPrice(product.price)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className={`${originalSize} leading-none text-brand-gray-400 line-through`}>
        {formatPrice(product.price)}
      </p>
      <p className={`${saleSize} leading-tight text-brand-electric`}>
        {formatPrice(salePrice)}
      </p>
    </div>
  );
}

export function PromotionBadge({ product }: { product: Product }) {
  const { t } = useLanguage();
  if (!isOnPromotion(product)) return null;

  return (
    <span className="absolute bottom-2 left-2 z-10 rounded bg-rose-500 px-1.5 py-0.5 text-[8px] font-black uppercase leading-none tracking-wide text-white shadow-sm sm:text-[9px]">
      {t.shop.promotionBadge.replace("{percent}", String(product.promotion_percent))}
    </span>
  );
}

export function ProductPriceInline({ product }: { product: Product }) {
  const { formatPrice } = useLanguage();
  const onPromo = isOnPromotion(product);
  const salePrice = getEffectivePrice(product);

  if (!onPromo) {
    return <p className="text-sm text-brand-gray-600">{formatPrice(product.price)}</p>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] leading-none text-brand-gray-400 line-through">
        {formatPrice(product.price)}
      </span>
      <span className="text-sm font-semibold leading-tight text-brand-electric">
        {formatPrice(salePrice)}
      </span>
    </div>
  );
}
