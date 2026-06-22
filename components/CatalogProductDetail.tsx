"use client";

import { useState } from "react";
import Link from "next/link";
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
import { productBrowseHref } from "@/lib/product-path";
import { getEffectivePrice } from "@/lib/product-pricing";
import { Product } from "@/types";

function browseLabel(
  product: Product,
  t: ReturnType<typeof useLanguage>["t"]
): string {
  switch (product.category) {
    case "accessories":
      return t.accessoriesCatalog.breadcrumb;
    case "protection":
      return t.protection.breadcrumb;
    case "phones":
      return t.shop.breadcrumbPhones;
    default:
      return t.nav.shop;
  }
}

export default function CatalogProductDetail({ product }: { product: Product }) {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { index: conditionIndex } = usePhoneConditions();
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = product.stock <= 0;
  const salePrice = getEffectivePrice(product);
  const conditionBadge =
    product.category === "phones"
      ? getPhoneConditionBadge(product.condition, conditionIndex)
      : null;
  const backHref = productBrowseHref(product);
  const backLabel = browseLabel(product, t);

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
      goToInstantCheckout({
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
      });
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
            <Link href={backHref} className="hover:text-brand-electric">
              {backLabel}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-brand-navy">
            {getProductBrandLabel(product)}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 border border-brand-gray-200 bg-white p-4 sm:p-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square max-h-[520px] w-full bg-[#fafafa] p-6 sm:p-10">
          <SafeImage
            src={product.image_url}
            alt={getProductDisplayName(product, locale)}
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
          <PromotionBadge product={product} />
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">
            {getProductBrandLabel(product)}
          </p>
          <h1 className="mt-2 text-xl font-bold uppercase tracking-tight text-brand-navy sm:text-2xl">
            {getProductDisplayName(product, locale)}
          </h1>

          <div className="mt-4">
            <ProductPriceDisplay product={product} size="lg" />
          </div>

          <p className="mt-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                outOfStock
                  ? "bg-red-500"
                  : product.stock <= 5
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />
            <span className={outOfStock ? "text-red-600" : "text-emerald-700"}>
              {outOfStock
                ? t.common.soldOut
                : t.shop.stockAvailable.replace("{count}", String(product.stock))}
            </span>
          </p>

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
            href={backHref}
            className="mt-6 text-xs font-bold uppercase tracking-wide text-brand-electric hover:underline"
          >
            ← {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
