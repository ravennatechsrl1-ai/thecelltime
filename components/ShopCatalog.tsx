"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import MobilaxCatalogToolbar from "@/components/MobilaxCatalogToolbar";
import MobilaxGridProductCard from "@/components/MobilaxGridProductCard";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ACCESSORY_TYPES,
  AccessoryType,
  accessoryTypeToSlug,
  productMatchesAccessoryType,
} from "@/lib/admin-catalog";
import { PHONE_BRANDS, productMatchesBrand } from "@/lib/phone-brands";
import {
  getShopBrand,
  isAccessoryShopView,
  isPhoneShopView,
  isPromotionShopView,
  parseShopSegments,
  shopBrandPath,
  ShopView,
} from "@/lib/shop-routes";
import { Product } from "@/types";
import { getEffectivePrice, isOnPromotion } from "@/lib/product-pricing";

type SortOption = "featured" | "price-asc" | "price-desc";

const PER_PAGE = 50;

function filterByView(products: Product[], view: ShopView): Product[] {
  switch (view.type) {
    case "promotions":
      return products.filter((product) => isOnPromotion(product));
    case "phones":
      return products.filter((product) => product.category === "phones");
    case "phones-new":
      return products.filter(
        (product) =>
          product.category === "phones" && product.condition === "new"
      );
    case "phones-used":
      return products.filter(
        (product) =>
          product.category === "phones" && product.condition === "used"
      );
    case "phones-new-brand":
      return products.filter(
        (product) =>
          product.category === "phones" &&
          product.condition === "new" &&
          productMatchesBrand(product.brand, view.brand)
      );
    case "phones-used-brand":
      return products.filter(
        (product) =>
          product.category === "phones" &&
          product.condition === "used" &&
          productMatchesBrand(product.brand, view.brand)
      );
    case "accessories":
      return products.filter((product) => product.category === "accessories");
    case "accessories-type":
      return products.filter(
        (product) =>
          product.category === "accessories" &&
          productMatchesAccessoryType(product.name, view.accessoryType)
      );
    default:
      return products;
  }
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  if (sort === "price-asc") {
    return sorted.sort(
      (a, b) => getEffectivePrice(a) - getEffectivePrice(b)
    );
  }
  if (sort === "price-desc") {
    return sorted.sort(
      (a, b) => getEffectivePrice(b) - getEffectivePrice(a)
    );
  }
  return sorted;
}

function getPageTitle(
  view: ShopView,
  t: ReturnType<typeof useLanguage>["t"]
): string {
  const brand = getShopBrand(view);
  if (brand) {
    const config = PHONE_BRANDS.find((item) => item.slug === brand);
    if (config) return t.nav[config.labelKey];
  }
  switch (view.type) {
    case "promotions":
      return t.shop.filterPromotions;
    case "phones-new":
    case "phones-new-brand":
      return t.shop.filterPhonesNew;
    case "phones-used":
    case "phones-used-brand":
      return t.shop.filterPhonesUsed;
    case "phones":
      return t.shop.phonesCategory;
    case "accessories":
      return t.shop.filterAccessories;
    case "accessories-type":
      return getAccessoryTypeLabel(view.accessoryType, t);
    default:
      return t.shop.title;
  }
}

function getAccessoryTypeLabel(
  type: AccessoryType,
  t: ReturnType<typeof useLanguage>["t"]
): string {
  const labels: Record<AccessoryType, string> = {
    charger: t.nav.chargers,
    cable: t.nav.cables,
    case: t.nav.cases,
    screenProtector: t.nav.screenProtectors,
    audio: t.admin.accessoryTypeAudio,
    other: t.admin.accessoryTypeOther,
  };
  return labels[type];
}

function ShopCatalogContent({ initialView }: { initialView: ShopView }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [sort, setSort] = useState<SortOption>("featured");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);

  const segments = pathname
    .replace(/^\/shop\/?/, "")
    .split("/")
    .filter(Boolean);
  const view = parseShopSegments(segments) ?? initialView;
  const phoneContext = isPhoneShopView(view);
  const accessoryContext = isAccessoryShopView(view);
  const promotionContext = isPromotionShopView(view);
  const activeBrand = getShopBrand(view);
  const phoneCondition =
    view.type === "phones-used" || view.type === "phones-used-brand"
      ? "used"
      : "new";

  useEffect(() => {
    setPage(1);
  }, [pathname]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      router.replace("/checkout/success");
    } else if (checkout === "cancelled") {
      router.replace("/checkout/cancelled");
    }
  }, [searchParams, router]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data: { products: Product[] } = await response.json();
          setProducts(data.products ?? []);
        }
      } catch {
        // keep empty catalog on failure
      }
    }
    fetchProducts();
  }, []);

  const searchQuery = searchParams.get("search")?.trim().toLowerCase() ?? "";

  const filteredProducts = useMemo(() => {
    let filtered = filterByView(products, view);
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        `${product.name} ${product.brand}`.toLowerCase().includes(searchQuery)
      );
    }
    return sortProducts(filtered, sort);
  }, [products, view, searchQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PER_PAGE;
  const pageEnd = Math.min(pageStart + PER_PAGE, filteredProducts.length);
  const pageProducts = filteredProducts.slice(pageStart, pageEnd);

  const pageTitle = getPageTitle(view, t);
  const brandConfig = activeBrand
    ? PHONE_BRANDS.find((brand) => brand.slug === activeBrand)
    : null;
  const toolbarLabel = brandConfig ? t.nav[brandConfig.labelKey] : pageTitle;

  const topCategories = [
    { href: "/shop", label: t.shop.filterAll, match: ["all"] as const },
    {
      href: "/shop/promotions",
      label: t.shop.filterPromotions,
      match: ["promotions"] as const,
    },
    {
      href: "/shop/phones/new",
      label: t.shop.filterPhonesNew,
      match: ["phones-new", "phones-new-brand"] as const,
    },
    {
      href: "/shop/phones/used",
      label: t.shop.filterPhonesUsed,
      match: ["phones-used", "phones-used-brand"] as const,
    },
    {
      href: "/shop/accessories",
      label: t.shop.filterAccessories,
      match: ["accessories", "accessories-type"] as const,
    },
  ];

  const phoneCategories = topCategories.filter(
    (item) =>
      item.label !== t.shop.filterAll && item.label !== t.shop.filterAccessories
  );

  const accessoryCategories = [
    {
      href: "/shop/accessories",
      label: t.shop.filterAll,
      match: ["accessories"] as const,
    },
    ...ACCESSORY_TYPES.map((type) => ({
      href: `/shop/accessories/${accessoryTypeToSlug(type)}`,
      label: getAccessoryTypeLabel(type, t),
      match: ["accessories-type"] as const,
      accessoryType: type,
    })),
  ];

  function isCategoryActive(
    match: readonly string[],
    accessoryType?: AccessoryType
  ) {
    if (accessoryType) {
      return (
        view.type === "accessories-type" && view.accessoryType === accessoryType
      );
    }
    return match.includes(view.type);
  }

  function categoryHref(baseHref: string) {
    if (phoneContext && activeBrand) {
      return baseHref.includes("used")
        ? shopBrandPath("used", activeBrand)
        : baseHref.includes("new")
          ? shopBrandPath("new", activeBrand)
          : baseHref;
    }
    return baseHref;
  }

  const visibleCategories = phoneContext
    ? phoneCategories
    : accessoryContext
      ? accessoryCategories
      : promotionContext
        ? topCategories.filter((item) => item.match.includes("promotions"))
        : topCategories;

  return (
    <div className="container-app py-4 sm:py-6">
      <nav className="mb-4 text-xs text-brand-gray-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-brand-black hover:underline">
              {t.shop.breadcrumbHome}
            </Link>
          </li>
          {phoneContext && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                {activeBrand ? (
                  <Link
                    href={
                      phoneCondition === "used"
                        ? "/shop/phones/used"
                        : "/shop/phones/new"
                    }
                    className="hover:text-brand-black hover:underline"
                  >
                    {t.shop.breadcrumbPhones}
                  </Link>
                ) : (
                  <span className="font-semibold uppercase tracking-wide text-brand-black">
                    {t.shop.breadcrumbPhones}
                  </span>
                )}
              </li>
            </>
          )}
          {activeBrand && (
            <>
              <li aria-hidden="true">/</li>
              <li className="font-semibold uppercase tracking-wide text-brand-black">
                {pageTitle}
              </li>
            </>
          )}
          {!phoneContext && !accessoryContext && view.type !== "all" && (
            <>
              <li aria-hidden="true">/</li>
              <li className="font-semibold uppercase tracking-wide text-brand-black">
                {pageTitle}
              </li>
            </>
          )}
          {!phoneContext && !accessoryContext && view.type === "all" && (
            <>
              <li aria-hidden="true">/</li>
              <li className="font-semibold uppercase tracking-wide text-brand-black">
                {t.shop.title}
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="mb-4 flex flex-col gap-3 border border-brand-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h1 className="text-xl font-bold uppercase tracking-tight sm:text-2xl">
          {pageTitle}
        </h1>
        <MobilaxCatalogToolbar filterAllLabel={toolbarLabel} />
      </div>

      <div className="lg:flex lg:items-start lg:gap-5">
        <div className="mb-4 lg:hidden">
          <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto bg-white px-4 py-3">
            {visibleCategories.map((item) => (
              <Link
                key={item.href}
                href={categoryHref(item.href)}
                className={`shrink-0 whitespace-nowrap border px-4 py-2 text-[11px] font-bold uppercase tracking-wide ${
                  isCategoryActive(
                    item.match,
                    "accessoryType" in item ? item.accessoryType : undefined
                  )
                    ? "border-brand-electric bg-brand-electric text-white"
                    : "border-brand-gray-300 bg-white text-brand-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <aside className="mobilax-sidebar hidden w-56 shrink-0 lg:block">
          <div className="border-b border-brand-gray-200 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-500">
              {t.shop.categories}
            </p>
          </div>
          <ul>
            {visibleCategories.map((item) => (
              <li key={item.href}>
                <Link
                  href={categoryHref(item.href)}
                  className={`mobilax-sidebar-link ${
                    isCategoryActive(
                      item.match,
                      "accessoryType" in item ? item.accessoryType : undefined
                    )
                      ? "bg-brand-electric text-white"
                      : "text-brand-gray-700 hover:bg-brand-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {phoneContext && (
            <>
              <div className="border-b border-t border-brand-gray-200 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-500">
                  {t.shop.brandsSidebar}
                </p>
              </div>
              <ul className="max-h-[320px] overflow-y-auto">
                {PHONE_BRANDS.map((brand) => {
                  const href = shopBrandPath(phoneCondition, brand.slug);
                  const isActive = activeBrand === brand.slug;
                  return (
                    <li key={brand.slug}>
                      <Link
                        href={href}
                        className={`mobilax-sidebar-link ${
                          isActive
                            ? "bg-brand-gray-100 font-bold text-brand-black"
                            : "text-brand-gray-700 hover:bg-brand-gray-50"
                        }`}
                      >
                        {t.nav[brand.labelKey]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mobilax-toolbar mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray-600">
              {filteredProducts.length === 0
                ? `0 ${t.common.products}`
                : `${pageStart + 1}-${pageEnd} / ${filteredProducts.length}`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                {t.shop.filters}
              </span>
              <label htmlFor="sort" className="sr-only">
                {t.shop.sortLabel}
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="min-h-[40px] border border-brand-gray-300 bg-white px-3 text-xs font-semibold uppercase"
              >
                <option value="featured">{t.shop.sortFeatured}</option>
                <option value="price-asc">{t.shop.sortPriceAsc}</option>
                <option value="price-desc">{t.shop.sortPriceDesc}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-brand-gray-200 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {pageProducts.map((product) => (
              <MobilaxGridProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="border border-brand-gray-200 bg-white py-20 text-center">
              <p className="text-sm text-brand-gray-500">{t.common.noneFound}</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 border border-brand-gray-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
                className="min-h-[36px] border border-brand-gray-300 px-4 text-xs font-bold uppercase disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-xs font-semibold uppercase text-brand-gray-600">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={safePage >= totalPages}
                className="min-h-[36px] border border-brand-gray-300 px-4 text-xs font-bold uppercase disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopCatalog({ view }: { view: ShopView }) {
  const { t } = useLanguage();

  return (
    <Suspense
      fallback={
        <div className="container-app py-20 text-center text-sm text-brand-gray-500">
          {t.shop.loadingCatalog}
        </div>
      }
    >
      <ShopCatalogContent initialView={view} />
    </Suspense>
  );
}
