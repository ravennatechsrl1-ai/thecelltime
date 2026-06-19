"use client";



import Link from "next/link";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Suspense, useEffect, useMemo, useState } from "react";

import MobilaxGridProductCard from "@/components/MobilaxGridProductCard";

import { useLanguage } from "@/components/LanguageProvider";

import {

  ACCESSORY_SUBTYPES,

  accessorySubtypeToSlug,

  AccessoryDeviceType,

  AccessorySubtype,

  accessoriesShopPath,

  buildAccessoriesNavFromProducts,

  getAccessoryBrand,

  getAccessoryBrandsWithProducts,

  getAccessoryModel,

  productMatchesAccessoryHierarchy,

} from "@/lib/accessories-catalog";

import { getEffectivePrice } from "@/lib/product-pricing";

import {

  getAccessorySubtypeFromSearch,

  parseShopSegments,

  AccessoriesHierarchyView,

  ShopView,

} from "@/lib/shop-routes";

import { Product } from "@/types";



type SortOption = "featured" | "price-asc" | "price-desc";

const PER_PAGE = 48;



function accessoryViewToFilters(

  view: ShopView,

  subtype: AccessorySubtype | null

) {

  const base = { subtype: subtype ?? undefined };

  switch (view.type) {

    case "accessories":

      return base;

    case "accessories-device":

      return { ...base, deviceType: view.deviceType };

    case "accessories-brand":

      return {

        ...base,

        deviceType: view.deviceType,

        brandSlug: view.brandSlug,

      };

    case "accessories-model":

      return {

        ...base,

        deviceType: view.deviceType,

        brandSlug: view.brandSlug,

        modelSlug: view.modelSlug,

      };

    default:

      return base;

  }

}



function AccessoriesShopContent({
  initialView,
  initialProducts = [],
}: {
  initialView: ShopView;
  initialProducts?: Product[];
}) {

  const pathname = usePathname();

  const router = useRouter();

  const searchParams = useSearchParams();

  const { t } = useLanguage();

  const [sort, setSort] = useState<SortOption>("featured");

  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [brandSearch, setBrandSearch] = useState("");



  const segments = pathname

    .replace(/^\/shop\/?/, "")

    .split("/")

    .filter(Boolean);



  const view: ShopView = useMemo(() => {

    return parseShopSegments(segments) ?? initialView;

  }, [segments, initialView]);



  const subtypeFilter = getAccessorySubtypeFromSearch(searchParams);



  useEffect(() => {

    setProducts(initialProducts);

  }, [initialProducts]);



  useEffect(() => {

    setPage(1);

  }, [pathname, searchParams.toString()]);



  const filters = accessoryViewToFilters(view, subtypeFilter);



  const filtered = useMemo(() => {

    let list = products.filter((p) =>

      productMatchesAccessoryHierarchy(p, filters)

    );

    const q = searchParams.get("search")?.trim().toLowerCase();

    if (q) {

      list = list.filter(

        (p) =>

          p.name.toLowerCase().includes(q) ||

          p.brand.toLowerCase().includes(q)

      );

    }

    if (sort === "price-asc") {

      list = [...list].sort(

        (a, b) => getEffectivePrice(a) - getEffectivePrice(b)

      );

    } else if (sort === "price-desc") {

      list = [...list].sort(

        (a, b) => getEffectivePrice(b) - getEffectivePrice(a)

      );

    }

    return list;

  }, [products, filters, sort, searchParams]);



  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);



  const deviceLabels: Record<AccessoryDeviceType, string> = {

    mobiles: t.accessoriesCatalog.deviceMobiles,

    tablets: t.accessoriesCatalog.deviceTablets,

    computers: t.accessoriesCatalog.deviceComputers,

    watch: t.accessoriesCatalog.deviceWatch,

  };



  const subtypeLabels: Record<AccessorySubtype, string> = {

    charger: t.accessoriesCatalog.subtypeCharger,

    cable: t.accessoriesCatalog.subtypeCable,

    case: t.accessoriesCatalog.subtypeCase,

    screenProtector: t.accessoriesCatalog.subtypeScreen,

    audio: t.accessoriesCatalog.subtypeAudio,

    other: t.accessoriesCatalog.subtypeOther,

  };



  const title = useMemo(() => {

    if (view.type === "accessories-model") {

      const model = getAccessoryModel(

        view.deviceType,

        view.brandSlug,

        view.modelSlug

      );

      const brand = getAccessoryBrand(view.deviceType, view.brandSlug);

      return model?.label ?? brand?.label ?? t.accessoriesCatalog.title;

    }

    if (view.type === "accessories-brand") {

      return (

        getAccessoryBrand(view.deviceType, view.brandSlug)?.label ??

        t.accessoriesCatalog.title

      );

    }

    if (view.type === "accessories-device") {

      return deviceLabels[view.deviceType];

    }

    return t.accessoriesCatalog.title;

  }, [view, t, deviceLabels]);



  const accessoriesNav = useMemo(

    () => buildAccessoriesNavFromProducts(products),

    [products]

  );



  const activeDevice =

    view.type === "accessories-device" ||

    view.type === "accessories-brand" ||

    view.type === "accessories-model"

      ? view.deviceType

      : null;



  const activeBrandSlug =

    view.type === "accessories-brand" || view.type === "accessories-model"

      ? view.brandSlug

      : null;



  const brandList = activeDevice

    ? getAccessoryBrandsWithProducts(products, activeDevice)

    : [];



  const visibleBrands = brandList.filter((b) =>

    b.label.toLowerCase().includes(brandSearch.toLowerCase())

  );



  function toggleSubtype(subtype: AccessorySubtype) {

    const params = new URLSearchParams(searchParams.toString());

    if (subtypeFilter === subtype) {

      params.delete("subtype");

    } else {

      params.set("subtype", accessorySubtypeToSlug(subtype));

    }

    const qs = params.toString();

    router.push(qs ? `${pathname}?${qs}` : pathname);

  }



  return (

    <div className="bg-brand-gray-50 py-8 sm:py-10">

      <div className="container-app">

        <div className="mb-6 border-b border-brand-gray-200 pb-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gray-400">

            {t.accessoriesCatalog.breadcrumb}

          </p>

          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-brand-navy sm:text-3xl">

            {title}

          </h1>

          <p className="mt-2 text-sm text-brand-gray-600">

            {filtered.length} {t.accessoriesCatalog.productsFound}

          </p>

        </div>



        <div className="flex flex-col gap-6 lg:flex-row">

          <aside className="w-full shrink-0 lg:w-72">

            <div className="space-y-4 border border-brand-gray-200 bg-white p-4">

              <div>

                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-navy">

                  {t.accessoriesCatalog.filterDeviceType}

                </p>

                <ul className="space-y-1">

                  <li>

                    <Link

                      href="/shop/accessories"

                      className={`block rounded px-2 py-1.5 text-sm ${

                        view.type === "accessories"

                          ? "bg-brand-electric/10 font-semibold text-brand-electric"

                          : "text-brand-gray-700 hover:bg-brand-gray-50"

                      }`}

                    >

                      {t.accessoriesCatalog.allDevices}

                    </Link>

                  </li>

                  {accessoriesNav.map((device) => (

                    <li key={device.deviceType}>

                      <Link

                        href={accessoriesShopPath(device.deviceType)}

                        className={`block rounded px-2 py-1.5 text-sm ${

                          activeDevice === device.deviceType

                            ? "bg-brand-electric/10 font-semibold text-brand-electric"

                            : "text-brand-gray-700 hover:bg-brand-gray-50"

                        }`}

                      >

                        {deviceLabels[device.deviceType]}

                      </Link>

                    </li>

                  ))}

                </ul>

              </div>



              <div className="border-t border-brand-gray-100 pt-4">

                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-navy">

                  {t.accessoriesCatalog.filterType}

                </p>

                <ul className="space-y-2">

                  {ACCESSORY_SUBTYPES.map((subtype) => (

                    <li key={subtype}>

                      <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-gray-700">

                        <input

                          type="checkbox"

                          checked={subtypeFilter === subtype}

                          onChange={() => toggleSubtype(subtype)}

                          className="rounded border-brand-gray-300 text-brand-electric focus:ring-brand-electric"

                        />

                        {subtypeLabels[subtype]}

                      </label>

                    </li>

                  ))}

                </ul>

              </div>



              {activeDevice ? (

                <div className="border-t border-brand-gray-100 pt-4">

                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-navy">

                    {t.accessoriesCatalog.filterBrand}

                  </p>

                  <input

                    type="search"

                    value={brandSearch}

                    onChange={(e) => setBrandSearch(e.target.value)}

                    placeholder={t.accessoriesCatalog.searchBrand}

                    className="mb-2 w-full rounded border border-brand-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-electric"

                  />

                  <ul className="max-h-48 space-y-1 overflow-y-auto">

                    {visibleBrands.map((brand) => (

                      <li key={brand.slug}>

                        <Link

                          href={accessoriesShopPath(activeDevice, brand.slug)}

                          className={`block rounded px-2 py-1 text-sm ${

                            activeBrandSlug === brand.slug

                              ? "font-semibold text-brand-electric"

                              : "text-brand-gray-700 hover:text-brand-electric"

                          }`}

                        >

                          {brand.label}

                        </Link>

                      </li>

                    ))}

                  </ul>

                </div>

              ) : null}

            </div>

          </aside>



          <div className="min-w-0 flex-1">

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

              <select

                value={sort}

                onChange={(e) => setSort(e.target.value as SortOption)}

                className="rounded border border-brand-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-electric"

                aria-label={t.shop.sortLabel}

              >

                <option value="featured">{t.shop.sortFeatured}</option>

                <option value="price-asc">{t.shop.sortPriceAsc}</option>

                <option value="price-desc">{t.shop.sortPriceDesc}</option>

              </select>

            </div>



            {pageItems.length === 0 ? (

              <div className="border border-brand-gray-200 bg-white p-12 text-center">

                <p className="text-sm text-brand-gray-500">

                  {t.accessoriesCatalog.noProducts}

                </p>

              </div>

            ) : (

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">

                {pageItems.map((product) => (

                  <MobilaxGridProductCard key={product.id} product={product} />

                ))}

              </div>

            )}



            {totalPages > 1 ? (

              <div className="mt-8 flex items-center justify-center gap-2">

                <button

                  type="button"

                  disabled={page <= 1}

                  onClick={() => setPage((p) => p - 1)}

                  className="rounded border border-brand-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-40"

                >

                  {t.accessoriesCatalog.prevPage}

                </button>

                <span className="text-sm text-brand-gray-600">

                  {page} / {totalPages}

                </span>

                <button

                  type="button"

                  disabled={page >= totalPages}

                  onClick={() => setPage((p) => p + 1)}

                  className="rounded border border-brand-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-40"

                >

                  {t.accessoriesCatalog.nextPage}

                </button>

              </div>

            ) : null}

          </div>

        </div>

      </div>

    </div>

  );

}



export default function AccessoriesShopCatalog({

  view,

  initialProducts,

}: {

  view: AccessoriesHierarchyView;

  initialProducts?: Product[];

}) {

  return (

    <Suspense

      fallback={

        <div className="container-app py-20 text-center text-sm text-brand-gray-500">

          Loading…

        </div>

      }

    >

      <AccessoriesShopContent
        initialView={view}
        initialProducts={initialProducts}
      />

    </Suspense>

  );

}

