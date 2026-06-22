"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import ProductPriceDisplay, { PromotionBadge } from "@/components/ProductPriceDisplay";
import { IconUser } from "@/components/icons/NavIcons";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { usePhoneConditions } from "@/hooks/usePhoneConditions";
import { getCheckoutCustomer, goToInstantCheckout } from "@/lib/client-checkout";
import { getPhoneConditionBadge } from "@/lib/phone-conditions";
import {
  getProductBrandLabel,
  getProductDisplayName,
} from "@/lib/product-display-name";
import { productDetailPath } from "@/lib/product-path";
import { getEffectivePrice } from "@/lib/product-pricing";
import { Product } from "@/types";

interface MobilaxGridProductCardProps {
  product: Product;
  listingId?: string;
  title?: string;
  variantCount?: number;
}

export default function MobilaxGridProductCard({
  product,
  listingId,
  title,
  variantCount = 0,
}: MobilaxGridProductCardProps) {
  const { t, formatPrice, locale } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { index: conditionIndex } = usePhoneConditions();
  const [buying, setBuying] = useState(false);

  const isPhone = product.category === "phones";
  const displayName = getProductDisplayName(product, locale, title);
  const brandLabel = getProductBrandLabel(product);
  const detailHref = productDetailPath(product, listingId);
  const outOfStock = product.stock <= 0;
  const salePrice = getEffectivePrice(product);
  const conditionBadge = getPhoneConditionBadge(product.condition, conditionIndex);
  const showFromPrice = isPhone && variantCount > 1;

  function stopNav(e: React.MouseEvent) {
    e.stopPropagation();
  }

  function handleSignIn(e: React.MouseEvent) {
    stopNav(e);
    router.push("/login");
  }

  function handleAddToCart(e: React.MouseEvent) {
    stopNav(e);
    if (outOfStock) return;
    addItem(product);
  }

  async function handleBuyNow(e: React.MouseEvent) {
    stopNav(e);
    if (outOfStock || buying) return;
    setBuying(true);
    try {
      goToInstantCheckout(
        {
          lineItems: [
            {
              productId: product.id,
              name: getProductDisplayName(product, locale),
              price: salePrice,
              quantity: 1,
              imageUrl: product.image_url,
            },
          ],
          totalAmount: salePrice,
          customer: getCheckoutCustomer(user),
        }
      );
    } catch {
      // checkout errors are surfaced by redirectToCheckout throw; keep card clean
    } finally {
      setBuying(false);
    }
  }

  const actionButtons = outOfStock ? null : user ? (
    <div className="relative z-10 mt-auto space-y-1.5 pt-2">
      <button
        type="button"
        onClick={handleAddToCart}
        className="flex min-h-[34px] w-full items-center justify-center border border-brand-gray-300 bg-white px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide text-brand-navy transition-all duration-200 hover:border-brand-electric hover:text-brand-electric sm:text-[10px]"
      >
        {t.shop.addToCart}
      </button>
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={buying}
        className="flex min-h-[34px] w-full items-center justify-center bg-brand-electric px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white transition-all duration-200 hover:bg-brand-electric-dark disabled:cursor-not-allowed disabled:opacity-50 sm:text-[10px]"
      >
        {buying ? t.cart.redirecting : t.shop.buyNow}
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={handleSignIn}
      className="relative z-10 mt-auto flex min-h-[36px] items-center justify-center gap-1.5 border border-brand-gray-300 bg-white px-2 py-2 pt-2 text-[10px] font-bold uppercase tracking-wide text-brand-navy transition-all duration-200 hover:border-brand-electric hover:text-brand-electric"
    >
      <IconUser className="h-3.5 w-3.5" />
      {t.nav.signIn}
    </button>
  );

  const cardBody = (
    <>
      <div className="relative aspect-square bg-[#fafafa] p-3">
        <SafeImage
          src={product.image_url}
          alt={displayName}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 33vw, 180px"
        />
        <span
          className="absolute left-2 top-2 max-w-[70%] truncate bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-gray-600"
        >
          {brandLabel}
        </span>
        {conditionBadge && (
          <span
            className={`absolute right-2 top-2 max-w-[45%] truncate px-1.5 py-0.5 text-[9px] font-bold uppercase ${
              conditionBadge.variant === "used"
                ? "bg-emerald-500 text-white"
                : "bg-brand-electric text-white"
            }`}
          >
            {conditionBadge.text}
          </span>
        )}
        <PromotionBadge product={product} />
      </div>

      <div className="flex flex-1 flex-col border-t border-brand-gray-100 p-2.5">
        <h3
          className="line-clamp-3 min-h-[2.75rem] text-[10px] leading-snug text-brand-gray-700 transition-colors group-hover:text-brand-electric sm:text-[11px]"
        >
          {displayName}
        </h3>

        <div className="mt-2.5">
          {showFromPrice ? (
            <p className="text-sm font-bold text-brand-navy sm:text-base">
              {t.common.from} {formatPrice(salePrice)}
            </p>
          ) : (
            <ProductPriceDisplay product={product} size="sm" />
          )}
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              outOfStock
                ? "bg-red-500"
                : product.stock <= 5
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            }`}
          />
          <span
            className={
              outOfStock
                ? "text-red-600"
                : product.stock <= 5
                  ? "text-amber-600"
                  : "text-emerald-700"
            }
          >
            {outOfStock
              ? t.common.soldOut
              : isPhone && variantCount > 1
                ? t.shop.variantsAvailable.replace("{count}", String(variantCount))
                : t.shop.stockAvailable.replace("{count}", String(product.stock))}
          </span>
        </p>

        {actionButtons}
      </div>
    </>
  );

  return (
    <article className="group relative flex h-full flex-col bg-white transition-shadow duration-200 hover:shadow-md">
      <Link
        href={detailHref}
        className="absolute inset-0 z-0"
        aria-label={displayName}
      />
      {cardBody}
    </article>
  );
}
