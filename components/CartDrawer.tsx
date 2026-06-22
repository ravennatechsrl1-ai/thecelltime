"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { clearInstantCheckout } from "@/lib/instant-checkout";
import { getProductDisplayName } from "@/lib/product-display-name";
import ProductPriceDisplay, { ProductPriceInline } from "@/components/ProductPriceDisplay";

export default function CartDrawer() {
  const {
    items,
    itemCount,
    total,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCart();
  const { t, formatPrice, locale } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-brand-gray-200 bg-white shadow-2xl"
        role="dialog"
        aria-label={t.cart.title}
      >
        <header className="flex items-center justify-between border-b border-brand-gray-200 px-4 py-4">
          <div>
            <p className="section-title">{t.cart.title}</p>
            <h2 className="text-lg font-bold uppercase">
              {itemCount} {itemCount === 1 ? t.common.item : t.common.items}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center border border-brand-gray-300 text-xl hover:border-brand-black"
            aria-label={t.cart.close}
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-brand-gray-500">
              {t.cart.empty}
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3 border border-brand-gray-200 p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 bg-brand-gray-50">
                    <Image
                      src={product.image_url}
                      alt={getProductDisplayName(product, locale)}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-semibold">
                      {getProductDisplayName(product, locale)}
                    </p>
                    <ProductPriceInline product={product} />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center border border-brand-gray-300 text-sm"
                        aria-label={t.cart.decreaseQty}
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-medium">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center border border-brand-gray-300 text-sm"
                        aria-label={t.cart.increaseQty}
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="ml-auto text-xs uppercase tracking-wide text-brand-gray-500 hover:text-brand-black"
                      >
                        {t.cart.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-brand-gray-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium uppercase tracking-wide">
                {t.cart.total}
              </span>
              <span className="text-xl font-bold">{formatPrice(total)}</span>
            </div>
            <CheckoutButton />
          </footer>
        )}
      </aside>
    </>
  );
}

function CheckoutButton() {
  const router = useRouter();
  const { closeCart } = useCart();
  const { t } = useLanguage();

  function handleCheckout() {
    clearInstantCheckout();
    closeCart();
    router.push("/checkout");
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      className="btn-primary w-full"
    >
      {t.cart.checkout}
    </button>
  );
}
