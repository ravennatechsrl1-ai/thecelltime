"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileDrawer from "@/components/MobileDrawer";
import NavDropdown from "@/components/NavDropdown";
import { useAuth } from "@/components/AuthProvider";
import { useHydrated } from "@/hooks/useHydrated";
import { buildPhoneNavGroups } from "@/lib/nav-phone-brands";
import {
  IconAccessories,
  IconAdmin,
  IconBrands,
  IconCart,
  IconEquipment,
  IconPhone,
  IconPromotions,
  IconProtection,
  IconRepair,
  IconSearch,
  IconUser,
  LogoMark,
  NavIconWrap,
} from "@/components/icons/NavIcons";

export default function Header() {
  const router = useRouter();
  const { itemCount, openCart } = useCart();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const hydrated = useHydrated();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  const navCategories = useMemo(
    () => [
      {
        id: "brands",
        label: t.nav.brands,
        icon: (
          <NavIconWrap>
            <IconBrands className="h-4 w-4" />
          </NavIconWrap>
        ),
        items: [
          { href: "/shop/phones/new/apple", label: t.nav.brandApple },
          { href: "/shop/phones/new/samsung", label: t.nav.brandSamsung },
          { href: "/shop/phones/new", label: t.nav.allBrands },
        ],
      },
      {
        id: "repair",
        label: t.nav.repair,
        icon: (
          <NavIconWrap>
            <IconRepair className="h-4 w-4" />
          </NavIconWrap>
        ),
        items: [
          { href: "/repair", label: t.nav.bookRepair },
          { href: "/track", label: t.nav.trackRepair },
        ],
      },
      {
        id: "protection",
        label: t.nav.protection,
        icon: (
          <NavIconWrap>
            <IconProtection className="h-4 w-4" />
          </NavIconWrap>
        ),
        items: [
          { href: "/shop/accessories", label: t.nav.cases },
          { href: "/shop/accessories", label: t.nav.screenProtectors },
        ],
      },
      {
        id: "accessories",
        label: t.nav.accessoriesNav,
        icon: (
          <NavIconWrap>
            <IconAccessories className="h-4 w-4" />
          </NavIconWrap>
        ),
        items: [
          { href: "/shop/accessories", label: t.nav.cables },
          { href: "/shop/accessories", label: t.nav.chargers },
        ],
      },
      {
        id: "equipment",
        label: t.nav.equipment,
        icon: (
          <NavIconWrap>
            <IconEquipment className="h-4 w-4" />
          </NavIconWrap>
        ),
        items: [
          { href: "/shop/accessories", label: t.nav.chargers },
          { href: "/shop/accessories", label: t.nav.cables },
        ],
      },
      {
        id: "phone",
        label: t.nav.phone,
        icon: (
          <NavIconWrap>
            <IconPhone className="h-4 w-4" />
          </NavIconWrap>
        ),
        groups: buildPhoneNavGroups(t),
      },
      {
        id: "promotions",
        label: t.nav.promotionsNav,
        icon: (
          <NavIconWrap>
            <IconPromotions className="h-4 w-4" />
          </NavIconWrap>
        ),
        items: [
          { href: "/shop/phones/used", label: t.nav.viewPromotions },
          { href: "/shop/accessories", label: t.nav.accessoriesNav },
        ],
      },
    ],
    [t]
  );

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
  }

  async function handleSignOut() {
    setAuthOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  const accountLabel =
    user?.user_metadata?.full_name &&
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name.split(" ")[0]
      : user?.email?.split("@")[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        {/* Top row — logo, search, actions */}
        <div className="border-b border-brand-gray-100">
          <div className="container-app flex h-16 items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="flex h-10 w-10 flex-col items-center justify-center gap-1 lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label={t.nav.openMenu}
            >
              <span className="block h-0.5 w-5 bg-brand-black" />
              <span className="block h-0.5 w-5 bg-brand-black" />
              <span className="block h-0.5 w-5 bg-brand-black" />
            </button>

            <Link href="/" className="flex shrink-0 items-center gap-2">
              <LogoMark className="h-9 w-9" />
              <span className="text-xl font-black uppercase tracking-tight text-brand-navy">
                TheCellTime
              </span>
            </Link>

            <LanguageSwitcher />

            <form
              onSubmit={handleSearch}
              className="mx-auto hidden max-w-xl flex-1 items-center lg:flex"
              suppressHydrationWarning
            >
              <div className="relative flex w-full items-center">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.nav.searchPlaceholder}
                  className="h-11 w-full rounded-full border border-brand-gray-200 bg-brand-gray-50 pl-5 pr-12 text-sm text-brand-black placeholder:text-brand-gray-400 focus:border-brand-electric focus:outline-none focus:ring-1 focus:ring-brand-electric"
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  className="absolute right-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray-400 text-white transition-colors hover:bg-brand-navy"
                  aria-label={t.common.search}
                  suppressHydrationWarning
                >
                  <IconSearch className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAuthOpen((v) => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gray-100 text-brand-gray-600 transition-colors hover:bg-brand-gray-200"
                  aria-label={t.nav.account}
                  aria-expanded={authOpen}
                >
                  <IconUser className="h-4 w-4" />
                </button>
                {authOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAuthOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-brand-gray-200 bg-white py-2 shadow-lg">
                      {user ? (
                        <>
                          <div className="border-b border-brand-gray-100 px-4 py-2.5">
                            <p className="text-xs font-bold text-brand-navy">
                              {accountLabel}
                            </p>
                            <p className="truncate text-[11px] text-brand-gray-500">
                              {user.email}
                            </p>
                          </div>
                          <Link
                            href="/account"
                            className="block px-4 py-2.5 text-sm font-medium text-brand-gray-800 transition-colors hover:bg-brand-gray-50"
                            onClick={() => setAuthOpen(false)}
                          >
                            {t.auth.myAccount}
                          </Link>
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-brand-gray-50"
                          >
                            {t.auth.logout}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="block px-4 py-2.5 text-sm font-medium text-brand-gray-800 transition-colors hover:bg-brand-gray-50"
                            onClick={() => setAuthOpen(false)}
                          >
                            {t.nav.signIn}
                          </Link>
                          <Link
                            href="/signup"
                            className="block px-4 py-2.5 text-sm font-medium text-brand-gray-800 transition-colors hover:bg-brand-gray-50"
                            onClick={() => setAuthOpen(false)}
                          >
                            {t.nav.signUp}
                          </Link>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              <Link
                href="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gray-100 text-brand-gray-600 transition-colors hover:bg-brand-gray-200"
                aria-label={t.nav.admin}
              >
                <IconAdmin className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={openCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-gray-100 text-brand-gray-600 transition-colors hover:bg-brand-gray-200"
                aria-label={`${t.cart.cartLabel}, ${itemCount}`}
              >
                <IconCart className="h-4 w-4" />
                {hydrated && itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-coral px-1 text-[9px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form
            onSubmit={handleSearch}
            className="container-app pb-3 lg:hidden"
            suppressHydrationWarning
          >
            <div className="relative flex items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="h-11 w-full rounded-full border border-brand-gray-200 bg-brand-gray-50 pl-5 pr-12 text-sm focus:border-brand-electric focus:outline-none"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="absolute right-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray-400 text-white"
                aria-label={t.common.search}
                suppressHydrationWarning
              >
                <IconSearch className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Bottom row — category nav with icons + dropdowns */}
        <nav
          className="hidden border-b border-brand-gray-100 bg-white lg:block"
          aria-label={t.nav.mainNav}
        >
          <div className="container-app flex items-center justify-center gap-1 py-1">
            {navCategories.map((cat) => (
              <NavDropdown
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                items={"items" in cat ? cat.items : undefined}
                groups={"groups" in cat ? cat.groups : undefined}
              />
            ))}
          </div>
        </nav>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={navCategories}
      />
    </>
  );
}
