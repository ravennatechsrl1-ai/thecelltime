"use client";

import { useState } from "react";
import SafeImage from "@/components/SafeImage";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { getCheckoutCustomer, redirectToCheckout } from "@/lib/client-checkout";
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
  const { t, formatPrice } = useLanguage();
  const { user } = useAuth();
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conditionLabel =
    product.condition === "new"
      ? t.conditions.new
      : product.condition === "used"
        ? t.conditions.usedA
        : null;
  const outOfStock = product.stock <= 0;

  const widthClass =
    variant === "carousel"
      ? "w-[160px] shrink-0 sm:w-[200px]"
      : "w-full";

  async function handleBuyNow() {
    if (outOfStock) return;
    setBuying(true);
    setError(null);

    try {
      await redirectToCheckout(
        {
          lineItems: [
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              imageUrl: product.image_url,
            },
          ],
          totalAmount: product.price,
          customer: getCheckoutCustomer(user),
        },
        t.cart.checkoutError
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t.cart.checkoutError);
    } finally {
      setBuying(false);
    }
  }

  return (
    <article
      className={`mobilax-product-card flex flex-col ${widthClass}`}
    >
      <div className="relative flex aspect-square items-center justify-center bg-[#fafafa] p-4">
        <SafeImage
          src={product.image_url}
          alt={product.name}
          fill
          className="object-contain p-3"
          sizes={variant === "carousel" ? "200px" : "(max-width: 640px) 50vw, 25vw"}
        />
        {conditionLabel && (
          <span
            className={`absolute left-0 top-0 ${
              product.condition === "new" ? "badge-new" : "badge-used"
            }`}
          >
            {conditionLabel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-brand-gray-200 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-brand-gray-400">
          {product.brand}
        </p>
        <h2 className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs font-medium leading-snug text-brand-black sm:text-sm">
          {product.name}
        </h2>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <p className="text-base font-bold text-brand-black sm:text-lg">
            {formatPrice(product.price)}
          </p>
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              outOfStock ? "bg-red-500" : "bg-emerald-500"
            }`}
          />
          <span className={outOfStock ? "text-red-600" : "text-emerald-700"}>
            {outOfStock ? t.common.soldOut : t.shop.inStockLabel}
          </span>
        </p>

        {error && (
          <p className="mt-2 text-[10px] text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={outOfStock}
            className="btn-secondary text-[10px] sm:text-xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.shop.addToCart}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={outOfStock || buying}
            className="btn-primary text-[10px] sm:text-xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            {buying ? t.cart.redirecting : t.shop.buyNow}
          </button>
        </div>
      </div>
    </article>
  );
}
