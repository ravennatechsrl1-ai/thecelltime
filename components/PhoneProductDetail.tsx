"use client";

import { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import PhoneVariantSelectors from "@/components/PhoneVariantSelectors";
import ProductPriceDisplay, { PromotionBadge } from "@/components/ProductPriceDisplay";
import { IconUser } from "@/components/icons/NavIcons";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { usePhoneConditions } from "@/hooks/usePhoneConditions";
import { getCheckoutCustomer, redirectToCheckout } from "@/lib/client-checkout";
import { getPhoneConditionBadge } from "@/lib/phone-conditions";
import { pickInitialVariant } from "@/lib/phone-listings";
import { getEffectivePrice } from "@/lib/product-pricing";
import { Product } from "@/types";

export default function PhoneProductDetail({
  title,
  variants,
  initialVariant,
}: {
  title: string;
  variants: Product[];
  initialVariant: Product;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { index: conditionIndex } = usePhoneConditions();
  const [selected, setSelected] = useState(() =>
    pickInitialVariant(variants, initialVariant.id)
  );
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = selected.stock <= 0;
  const salePrice = getEffectivePrice(selected);
  const conditionBadge = getPhoneConditionBadge(selected.condition, conditionIndex);

  function handleAddToCart() {
    if (outOfStock) return;
    setError(null);
    addItem(selected);
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
              productId: selected.id,
              name: selected.name,
              price: salePrice,
              quantity: 1,
              imageUrl: selected.image_url,
            },
          ],
          totalAmount: salePrice,
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
    <div className="container-app py-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-brand-gray-500">
          <li>
            <Link href="/" className="hover:text-brand-electric">
              {t.shop.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/shop/phones/new" className="hover:text-brand-electric">
              {t.shop.breadcrumbPhones}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-brand-navy">{selected.brand}</li>
        </ol>
      </nav>

      <div className="grid gap-8 border border-brand-gray-200 bg-white p-4 sm:p-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square max-h-[520px] w-full bg-[#fafafa] p-6 sm:p-10">
          <SafeImage
            src={selected.image_url}
            alt={title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 100vw, 520px"
            priority
          />
          {conditionBadge && (
            <span
              className={`absolute left-4 top-4 px-2 py-1 text-[10px] font-bold uppercase sm:text-xs ${
                conditionBadge.variant === "used"
                  ? "bg-emerald-500 text-white"
                  : "bg-brand-electric text-white"
              }`}
            >
              {conditionBadge.text}
            </span>
          )}
          <PromotionBadge product={selected} />
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">
            {selected.brand}
          </p>
          <h1 className="mt-2 text-xl font-bold uppercase tracking-tight text-brand-navy sm:text-2xl">
            {title}
          </h1>

          <div className="mt-4">
            <ProductPriceDisplay product={selected} size="lg" />
          </div>

          <p className="mt-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                outOfStock
                  ? "bg-red-500"
                  : selected.stock <= 5
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />
            <span className={outOfStock ? "text-red-600" : "text-emerald-700"}>
              {outOfStock
                ? t.common.soldOut
                : t.shop.stockAvailable.replace("{count}", String(selected.stock))}
            </span>
          </p>

          <PhoneVariantSelectors
            variants={variants}
            selected={selected}
            onSelect={setSelected}
          />

          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="btn-secondary min-h-[48px] flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.shop.addToCart}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={outOfStock || buying}
                  className="btn-primary min-h-[48px] flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {buying ? t.cart.redirecting : t.shop.buyNow}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn-primary flex min-h-[48px] flex-1 items-center justify-center gap-2"
              >
                <IconUser className="h-4 w-4" />
                {t.nav.signIn}
              </Link>
            )}
          </div>

          <Link
            href="/shop/phones/new"
            className="mt-6 text-xs font-bold uppercase tracking-wide text-brand-electric hover:underline"
          >
            ← {t.shop.backToPhones}
          </Link>
        </div>
      </div>
    </div>
  );
}
