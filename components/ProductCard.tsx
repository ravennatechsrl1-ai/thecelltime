"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import ProductPriceDisplay, { PromotionBadge } from "@/components/ProductPriceDisplay";
import { IconUser } from "@/components/icons/NavIcons";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { getCheckoutCustomer, goToInstantCheckout } from "@/lib/client-checkout";
import { productDetailPath } from "@/lib/product-path";
import {
  getProductBrandLabel,
  getProductDisplayName,
} from "@/lib/product-display-name";
import { getEffectivePrice } from "@/lib/product-pricing";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  variant?: "grid" | "carousel";
}

export default function ProductCard({
  product,
  onAddToCart,
  variant = "grid",
}: ProductCardProps) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conditionLabel =
    product.condition === "new"
      ? t.conditions.new
      : product.condition === "used"
        ? t.conditions.usedA
        : null;
  const detailHref = productDetailPath(product);
  const displayName = getProductDisplayName(product, locale);
  const brandLabel = getProductBrandLabel(product);
  const outOfStock = product.stock <= 0;
  const salePrice = getEffectivePrice(product);

  const widthClass =
    variant === "carousel"
      ? "w-[160px] shrink-0 sm:w-[200px]"
      : "w-full";

  async function handleBuyNow() {
    if (outOfStock) return;
    setBuying(true);
    setError(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : t.cart.checkoutError);
    } finally {
      setBuying(false);
    }
  }

  const cardBody = (
    <>
      <div className="relative flex aspect-square items-center justify-center bg-[#fafafa] p-4">
        <SafeImage
          src={product.image_url}
          alt={displayName}
          fill
          className="object-contain p-3"
          sizes={variant === "carousel" ? "200px" : "(max-width: 640px) 50vw, 25vw"}
        />
        {conditionLabel && (
          <span
            className={`absolute left-0 top-0 z-10 ${
              product.condition === "new" ? "badge-new" : "badge-used"
            }`}
          >
            {conditionLabel}
          </span>
        )}
        <PromotionBadge product={product} />
      </div>

      <div className="flex flex-1 flex-col border-t border-brand-gray-200 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-brand-gray-400">
          {brandLabel}
        </p>
        <h2 className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs font-medium leading-snug text-brand-black sm:text-sm">
          {displayName}
        </h2>

        <div className="mt-2.5">
          <ProductPriceDisplay product={product} size="lg" />
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
          <span className={outOfStock ? "text-red-600" : product.stock <= 5 ? "text-amber-600" : "text-emerald-700"}>
            {outOfStock
              ? t.common.soldOut
              : t.shop.stockAvailable.replace("{count}", String(product.stock))}
          </span>
        </p>

        {error && (
          <p className="mt-2 text-[10px] text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="relative z-10 mt-3">
          {outOfStock ? null : user ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={onAddToCart}
                className="btn-secondary w-full text-[10px] sm:text-xs"
              >
                {t.shop.addToCart}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={buying}
                className="btn-primary w-full text-[10px] sm:text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                {buying ? t.cart.redirecting : t.shop.buyNow}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex min-h-[44px] w-full items-center justify-center gap-1.5 border border-brand-gray-300 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-brand-navy transition-all duration-200 hover:border-brand-electric hover:text-brand-electric sm:text-xs"
            >
              <IconUser className="h-3.5 w-3.5" />
              {t.nav.signIn}
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <article
      className={`mobilax-product-card group relative flex flex-col transition-shadow duration-200 hover:shadow-md ${widthClass}`}
    >
      <Link
        href={detailHref}
        className="absolute inset-0 z-0"
        aria-label={displayName}
      />
      {cardBody}
    </article>
  );
}
