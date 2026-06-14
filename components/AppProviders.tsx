"use client";

import Link from "next/link";
import { ReactNode } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { LanguageProvider, useLanguage } from "@/components/LanguageProvider";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Locale } from "@/lib/i18n/types";

function SectionFallback({ message }: { message: string }) {
  return (
    <div className="container-app py-8 text-center text-sm text-brand-gray-500">
      {message}
    </div>
  );
}

function AppChrome({ children }: { children: ReactNode }) {
  const { t } = useLanguage();

  return (
    <>
      <ErrorBoundary
        fallback={
          <header className="border-b border-brand-gray-200 bg-white py-4">
            <div className="container-app">
              <Link href="/" className="text-lg font-black uppercase text-brand-navy">
                TheCellTime
              </Link>
            </div>
          </header>
        }
      >
        <Header />
      </ErrorBoundary>

      <ErrorBoundary fallback={<SectionFallback message={t.errors.sectionUnavailable} />}>
        <main className="flex-1">{children}</main>
      </ErrorBoundary>

      <ErrorBoundary fallback={null}>
        <Footer />
      </ErrorBoundary>

      <ErrorBoundary fallback={null}>
        <CartDrawer />
      </ErrorBoundary>
    </>
  );
}

export default function AppProviders({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <AuthProvider>
        <CartProvider>
          <AppChrome>{children}</AppChrome>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
