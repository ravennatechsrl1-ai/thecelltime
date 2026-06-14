import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import { LOCALE_STORAGE_KEY, isValidLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import { Locale } from "@/lib/i18n/types";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TheCellTime — Telefonia & Riparazioni",
  description:
    "Distributore tecnico di telefoni, accessori e servizi di riparazione professionale in Italia.",
};

async function getInitialLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_STORAGE_KEY)?.value;
  if (value && isValidLocale(value)) return value;
  return DEFAULT_LOCALE;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = await getInitialLocale();

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans flex min-h-screen flex-col`}>
        <AppProviders initialLocale={initialLocale}>{children}</AppProviders>
      </body>
    </html>
  );
}
