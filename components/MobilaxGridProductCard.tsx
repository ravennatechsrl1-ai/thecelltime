"use client";

import { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { IconUser } from "@/components/icons/NavIcons";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { getCheckoutCustomer, redirectToCheckout } from "@/lib/client-checkout";
import { Product } from "@/types";

interface MobilaxGridProductCardProps {
  product: Product;
}

export default function MobilaxGridProductCard({
  product,
}: MobilaxGridProductCardProps) {
  const { t, formatPrice } = useLanguage();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = product.stock <= 0;
  const gradeBadge =
    product.condition === "used"
      ? "A"
      : product.condition === "new"
        ? "NEW"
        : null;

  function handleAddToCart() {
    if (outOfStock) return;
    setError(null);
    addItem(product);
  }

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
    <article className="flex h-full flex-col bg-white">
      <div className="relative aspect-square bg-[#fafafa] p-3">
        <SafeImage
          src={product.image_url}
          alt={product.name}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 33vw, 180px"
        />
        <span className="absolute left-2 top-2 max-w-[70%] truncate bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-gray-600">
          {product.brand}
        </span>
        {gradeBadge && (
          <span
            className={`absolute right-2 top-2 px-1.5 py-0.5 text-[9px] font-bold uppercase ${
              product.condition === "used"
                ? "bg-emerald-500 text-white"
                : "bg-brand-black text-white"
            }`}
          >
            {gradeBadge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-brand-gray-100 p-2.5">
        <h3 className="line-clamp-3 min-h-[2.75rem] text-[10px] leading-snug text-brand-gray-700 sm:text-[11px]">
          {product.name}
        </h3>

        {user ? (
          <>
            <p className="mt-2 text-sm font-bold text-brand-navy">
              {formatPrice(product.price)}
            </p>

            {outOfStock ? (
              <p className="mt-auto pt-2 text-[10px] font-bold uppercase tracking-wide text-red-600">
                {t.common.soldOut}
              </p>
            ) : (
              <div className="mt-auto space-y-1.5 pt-2">
                {error && (
                  <p className="text-[9px] leading-snug text-red-600" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex min-h-[34px] w-full items-center justify-center border border-brand-gray-300 bg-white px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide text-brand-gray-700 transition-colors hover:border-brand-black hover:text-brand-black sm:text-[10px]"
                >
                  {t.shop.addToCart}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buying}
                  className="flex min-h-[34px] w-full items-center justify-center bg-brand-black px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[10px]"
                >
                  {buying ? t.cart.redirecting : t.shop.buyNow}
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            href="/login"
            className="mt-auto flex min-h-[36px] items-center justify-center gap-1.5 border border-brand-gray-300 bg-white px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-brand-gray-700 transition-colors hover:border-brand-black hover:text-brand-black"
          >
            <IconUser className="h-3.5 w-3.5" />
            {t.nav.signIn}
          </Link>
        )}
      </div>
    </article>
  );
}
