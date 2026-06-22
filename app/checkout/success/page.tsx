"use client";



import Link from "next/link";

import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useRef, useState } from "react";

import { useCart } from "@/components/CartProvider";

import { useLanguage } from "@/components/LanguageProvider";

import { clearInstantCheckout } from "@/lib/instant-checkout";



type ConfirmState = "idle" | "loading" | "success" | "error";



function CheckoutSuccessContent() {

  const { t } = useLanguage();

  const { clearCart, closeCart } = useCart();

  const searchParams = useSearchParams();

  const cleared = useRef(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>("idle");

  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [confirmError, setConfirmError] = useState<string | null>(null);



  useEffect(() => {

    if (cleared.current) return;

    cleared.current = true;

    clearCart();

    closeCart();

    clearInstantCheckout();

  }, [clearCart, closeCart]);



  useEffect(() => {

    const redirectStatus = searchParams.get("redirect_status");

    if (redirectStatus === "failed") {

      setConfirmState("error");

      setConfirmError(t.checkout.paymentError);

      return;

    }



    const sessionId = searchParams.get("session_id");

    const paymentIntentId =

      searchParams.get("payment_intent") ??

      searchParams.get("payment_intent_client_secret")?.split("_secret")[0];



    if (!sessionId && !paymentIntentId) {

      setConfirmState("error");

      setConfirmError(t.checkout.confirmFailed);

      return;

    }



    let cancelled = false;

    setConfirmState("loading");



    fetch("/api/checkout/confirm", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({

        sessionId: sessionId ?? undefined,

        paymentIntentId: paymentIntentId ?? undefined,

      }),

    })

      .then(async (res) => {

        const data: { orderNumber?: string; error?: string } = await res.json();

        if (cancelled) return;



        if (!res.ok || !data.orderNumber) {

          throw new Error(data.error ?? t.checkout.confirmFailed);

        }



        setOrderNumber(data.orderNumber);

        setConfirmState("success");

      })

      .catch((err) => {

        if (cancelled) return;

        setConfirmState("error");

        setConfirmError(

          err instanceof Error ? err.message : t.checkout.confirmFailed

        );

      });



    return () => {

      cancelled = true;

    };

  }, [searchParams, t.checkout.confirmFailed, t.checkout.paymentError]);



  return (

    <div className="bg-brand-gray-50 py-12 sm:py-16">

      <div className="container-app mx-auto max-w-lg">

        <div className="border border-brand-gray-200 bg-white p-8 text-center sm:p-10">

          <div

            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600"

            aria-hidden="true"

          >

            ✓

          </div>



          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-600">

            {t.checkout.successBadge}

          </p>

          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-brand-navy">

            {t.checkout.successTitle}

          </h1>

          <p className="mt-4 text-sm leading-relaxed text-brand-gray-600">

            {t.checkout.successDesc}

          </p>



          {confirmState === "loading" ? (

            <p className="mt-3 text-sm text-brand-gray-500">

              {t.checkout.confirmingOrder}

            </p>

          ) : null}



          {orderNumber ? (

            <p className="mt-3 text-sm font-semibold text-brand-navy">

              {t.checkout.orderNumber.replace("{number}", orderNumber)}

            </p>

          ) : null}



          {confirmState === "error" && confirmError ? (

            <p className="mt-3 text-sm text-red-600" role="alert">

              {confirmError}

            </p>

          ) : null}



          <p className="mt-2 text-xs text-brand-gray-500">

            {t.checkout.successOrderNote}

          </p>



          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Link

              href="/shop"

              className="btn-primary mx-auto w-full sm:mx-0 sm:w-auto sm:min-w-[220px]"

            >

              {t.checkout.continueShopping}

            </Link>

            <Link

              href="/"

              className="btn-secondary mx-auto w-full sm:mx-0 sm:w-auto sm:min-w-[220px]"

            >

              {t.checkout.backHome}

            </Link>

          </div>

        </div>

      </div>

    </div>

  );

}



export default function CheckoutSuccessPage() {

  return (

    <Suspense fallback={null}>

      <CheckoutSuccessContent />

    </Suspense>

  );

}


