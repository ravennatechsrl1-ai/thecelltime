"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteLogo from "@/components/SiteLogo";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { getCheckoutCustomer } from "@/lib/client-checkout";
import { loadCartFromStorage } from "@/lib/cart-storage";
import {
  clearInstantCheckout,
  readInstantCheckout,
} from "@/lib/instant-checkout";
import { getProductDisplayName } from "@/lib/product-display-name";
import { getEffectivePrice } from "@/lib/product-pricing";
import {
  CartItem,
  CheckoutLineItem,
  CheckoutPrepareBody,
  ShippingAddress,
} from "@/types";
import { Locale } from "@/lib/i18n/types";

function cartItemsToLineItems(
  cartItems: CartItem[],
  locale: Locale
): CheckoutLineItem[] {
  return cartItems.map(({ product, quantity }) => ({
    productId: product.id,
    name: getProductDisplayName(product, locale),
    price: getEffectivePrice(product),
    quantity,
    imageUrl: product.image_url,
  }));
}

function resolveCartItems(items: CartItem[]): CartItem[] {
  const fromStorage = loadCartFromStorage();
  if (fromStorage.length > items.length) return fromStorage;
  if (items.length > fromStorage.length) return items;
  return items.length > 0 ? items : fromStorage;
}

const EU_COUNTRIES = [
  { code: "IT", label: "Italy" },
  { code: "FR", label: "France" },
  { code: "DE", label: "Germany" },
  { code: "ES", label: "Spain" },
  { code: "CH", label: "Switzerland" },
  { code: "AT", label: "Austria" },
  { code: "BE", label: "Belgium" },
  { code: "NL", label: "Netherlands" },
  { code: "PT", label: "Portugal" },
  { code: "GB", label: "United Kingdom" },
];

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function CheckoutPaymentForm({
  lineItems,
  totalAmount,
  paymentIntentId,
  email,
  setEmail,
  shipping,
  setShipping,
}: {
  lineItems: CheckoutLineItem[];
  totalAmount: number;
  paymentIntentId: string;
  email: string;
  setEmail: (value: string) => void;
  shipping: ShippingAddress;
  setShipping: React.Dispatch<React.SetStateAction<ShippingAddress>>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t, formatPrice } = useLanguage();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const customer = getCheckoutCustomer(user);
    const fullName =
      `${shipping.firstName.trim()} ${shipping.lastName.trim()}`.trim();

    const prepareBody: CheckoutPrepareBody = {
      paymentIntentId,
      lineItems,
      totalAmount,
      customer: {
        name: fullName || customer.name,
        email: email.trim(),
        phone: shipping.phone.trim(),
      },
      shippingAddress: shipping,
    };

    try {
      const prepareRes = await fetch("/api/checkout/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prepareBody),
      });
      const prepareData: { error?: string; returnUrl?: string } =
        await prepareRes.json();

      if (!prepareRes.ok || !prepareData.returnUrl) {
        throw new Error(prepareData.error ?? t.checkout.paymentError);
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: prepareData.returnUrl,
          receipt_email: email.trim(),
          payment_method_data: {
            billing_details: {
              name: fullName,
              email: email.trim(),
              phone: shipping.phone.trim() || undefined,
              address: {
                line1: shipping.addressLine1,
                line2: shipping.addressLine2 || undefined,
                city: shipping.city,
                postal_code: shipping.postalCode || undefined,
                country: shipping.country,
              },
            },
          },
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message ?? t.checkout.paymentError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.checkout.paymentError);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-brand-navy">
          {t.checkout.contactTitle}
        </h2>
        <div className="mt-4">
          <label htmlFor="checkout-email" className="checkout-label">
            {t.checkout.email}
          </label>
          <input
            id="checkout-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="checkout-input"
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-brand-navy">
          {t.checkout.deliveryTitle}
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="checkout-country" className="checkout-label">
              {t.checkout.country}
            </label>
            <select
              id="checkout-country"
              required
              value={shipping.country}
              onChange={(e) =>
                setShipping((prev) => ({ ...prev, country: e.target.value }))
              }
              className="checkout-input"
            >
              {EU_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="checkout-first-name" className="checkout-label">
                {t.checkout.firstName}
              </label>
              <input
                id="checkout-first-name"
                required
                autoComplete="given-name"
                value={shipping.firstName}
                onChange={(e) =>
                  setShipping((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="checkout-input"
              />
            </div>
            <div>
              <label htmlFor="checkout-last-name" className="checkout-label">
                {t.checkout.lastName}
              </label>
              <input
                id="checkout-last-name"
                required
                autoComplete="family-name"
                value={shipping.lastName}
                onChange={(e) =>
                  setShipping((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className="checkout-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkout-address" className="checkout-label">
              {t.checkout.address}
            </label>
            <input
              id="checkout-address"
              required
              autoComplete="address-line1"
              value={shipping.addressLine1}
              onChange={(e) =>
                setShipping((prev) => ({
                  ...prev,
                  addressLine1: e.target.value,
                }))
              }
              className="checkout-input"
            />
          </div>

          <div>
            <label htmlFor="checkout-address2" className="checkout-label">
              {t.checkout.addressLine2}
            </label>
            <input
              id="checkout-address2"
              autoComplete="address-line2"
              value={shipping.addressLine2 ?? ""}
              onChange={(e) =>
                setShipping((prev) => ({
                  ...prev,
                  addressLine2: e.target.value,
                }))
              }
              className="checkout-input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="checkout-city" className="checkout-label">
                {t.checkout.city}
              </label>
              <input
                id="checkout-city"
                required
                autoComplete="address-level2"
                value={shipping.city}
                onChange={(e) =>
                  setShipping((prev) => ({ ...prev, city: e.target.value }))
                }
                className="checkout-input"
              />
            </div>
            <div>
              <label htmlFor="checkout-postal" className="checkout-label">
                {t.checkout.postalCode}
              </label>
              <input
                id="checkout-postal"
                autoComplete="postal-code"
                value={shipping.postalCode}
                onChange={(e) =>
                  setShipping((prev) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }))
                }
                className="checkout-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="checkout-phone" className="checkout-label">
              {t.checkout.phone}
            </label>
            <input
              id="checkout-phone"
              type="tel"
              required
              autoComplete="tel"
              value={shipping.phone}
              onChange={(e) =>
                setShipping((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="checkout-input"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-brand-navy">
          {t.checkout.shippingTitle}
        </h2>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-brand-gray-200 bg-brand-gray-50 px-4 py-3 text-sm">
          <span className="font-medium text-brand-navy">
            {t.checkout.freeShipping}
          </span>
          <span className="font-semibold uppercase text-emerald-700">
            {t.checkout.freeShippingPrice}
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-brand-navy">
          {t.checkout.paymentTitle}
        </h2>
        <p className="mt-1 text-sm text-brand-gray-500">
          {t.checkout.paymentSecure}
        </p>
        <div className="mt-4 rounded-lg border border-brand-gray-200 bg-white p-4">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      </section>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="flex min-h-[52px] w-full items-center justify-center rounded-md bg-brand-navy text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-electric disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? t.checkout.processing
          : t.checkout.payNow.replace("{amount}", formatPrice(totalAmount))}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { t, formatPrice, locale } = useLanguage();
  const { user } = useAuth();
  const { items, total: cartTotal, closeCart, hydrated: cartHydrated } = useCart();

  const [lineItems, setLineItems] = useState<CheckoutLineItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const customer = useMemo(() => getCheckoutCustomer(user), [user]);
  const { firstName, lastName } = useMemo(
    () => splitName(customer.name),
    [customer.name]
  );

  const [email, setEmail] = useState(customer.email);
  const [shipping, setShipping] = useState<ShippingAddress>({
    country: "IT",
    firstName,
    lastName,
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  useEffect(() => {
    setEmail(customer.email);
    setShipping((prev) => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || lastName,
    }));
  }, [customer.email, firstName, lastName]);

  useEffect(() => {
    closeCart();
  }, [closeCart]);

  useEffect(() => {
    if (!cartHydrated) return;

    const instant = readInstantCheckout();
    const cartItems = resolveCartItems(items);
    let payload: CheckoutLineItem[] = [];

    if (cartItems.length > 0) {
      clearInstantCheckout();
      payload = cartItemsToLineItems(cartItems, locale);
    } else if (instant?.lineItems?.length) {
      payload = instant.lineItems;
    }

    if (payload.length === 0) {
      router.replace("/shop");
      return;
    }

    setLoading(true);
    setInitError(null);

    const controller = new AbortController();

    fetch("/api/checkout/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineItems: payload }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? t.checkout.paymentError);
        }
        setLineItems(data.lineItems ?? payload);
        setTotalAmount(data.totalAmount ?? cartTotal);
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setPublishableKey(data.publishableKey);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setInitError(
          err instanceof Error ? err.message : t.checkout.paymentError
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [items, locale, router, cartHydrated, t.checkout.paymentError]);

  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  );

  const elementsOptions: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0066ff",
            borderRadius: "6px",
          },
        },
      }
    : undefined;

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-brand-gray-50">
        <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
      </div>
    );
  }

  if (initError || !clientSecret || !paymentIntentId || !stripePromise) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-brand-gray-50 px-4">
        <div className="max-w-md rounded-xl border border-brand-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-red-600">{initError ?? t.checkout.paymentError}</p>
          <Link href="/shop" className="btn-primary mt-6 inline-flex">
            {t.checkout.tryAgain}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      <header className="border-b border-brand-gray-200 bg-white">
        <div className="container-app flex min-h-[4rem] items-center justify-between py-3">
          <Link href="/" className="inline-flex shrink-0 items-center">
            <SiteLogo className="h-10 w-auto" linked={false} />
          </Link>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-wide text-brand-gray-500 hover:text-brand-electric"
          >
            {t.checkout.continueShopping}
          </Link>
        </div>
      </header>

      <div className="container-app py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          <div className="order-2 lg:order-1">
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CheckoutPaymentForm
                lineItems={lineItems}
                totalAmount={totalAmount}
                paymentIntentId={paymentIntentId}
                email={email}
                setEmail={setEmail}
                shipping={shipping}
                setShipping={setShipping}
              />
            </Elements>
          </div>

          <aside className="order-1 lg:order-2">
            <div className="sticky top-6 rounded-xl border border-brand-gray-200 bg-brand-gray-100/80 p-5 lg:p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand-gray-500">
                {t.checkout.orderSummary}
              </h2>

              <ul className="mt-4 space-y-4">
                {lineItems.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-brand-gray-200 bg-white">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : null}
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-navy px-1 text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-brand-navy">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-brand-navy">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2 border-t border-brand-gray-200 pt-4 text-sm">
                <div className="flex justify-between text-brand-gray-600">
                  <span>{t.checkout.subtotal}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-gray-600">
                  <span>{t.checkout.shippingLabel}</span>
                  <span>{t.checkout.freeShippingPrice}</span>
                </div>
                <div className="flex justify-between border-t border-brand-gray-200 pt-3 text-base font-bold text-brand-navy">
                  <span>{t.cart.total}</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
