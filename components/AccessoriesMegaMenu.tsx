"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { IconChevronDown } from "@/components/icons/NavIcons";
import { useLanguage } from "@/components/LanguageProvider";
import { useProducts } from "@/components/ProductsProvider";
import {
  accessoriesShopPath,
  AccessoryDeviceType,
  AccessoryNavBrand,
  buildAccessoriesNavFromProducts,
} from "@/lib/accessories-catalog";

interface AccessoriesMegaMenuProps {
  label: string;
  icon: ReactNode;
  inverted?: boolean;
}

export default function AccessoriesMegaMenu({
  label,
  icon,
  inverted = false,
}: AccessoriesMegaMenuProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<AccessoryDeviceType | null>(null);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const { products, ensureLoaded } = useProducts();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      ensureLoaded();
    }
  }, [open, ensureLoaded]);

  const navTree = useMemo(
    () => buildAccessoriesNavFromProducts(products),
    [products]
  );

  const activeDevice = useMemo(() => {
    if (navTree.length === 0) return null;
    const match = navTree.find((d) => d.deviceType === deviceType);
    return match ?? navTree[0];
  }, [navTree, deviceType]);

  const activeBrand: AccessoryNavBrand | null = useMemo(() => {
    if (!activeDevice || activeDevice.brands.length === 0) return null;
    const match = activeDevice.brands.find((b) => b.slug === brandSlug);
    return match ?? activeDevice.brands[0];
  }, [activeDevice, brandSlug]);

  useEffect(() => {
    if (navTree.length === 0) {
      setDeviceType(null);
      setBrandSlug(null);
      return;
    }
    if (!deviceType || !navTree.some((d) => d.deviceType === deviceType)) {
      setDeviceType(navTree[0].deviceType);
    }
  }, [navTree, deviceType]);

  useEffect(() => {
    if (!activeDevice) {
      setBrandSlug(null);
      return;
    }
    if (!brandSlug || !activeDevice.brands.some((b) => b.slug === brandSlug)) {
      setBrandSlug(activeDevice.brands[0]?.slug ?? null);
    }
  }, [activeDevice, brandSlug]);

  const deviceLabels: Record<AccessoryDeviceType, string> = {
    mobiles: t.accessoriesCatalog.deviceMobiles,
    tablets: t.accessoriesCatalog.deviceTablets,
    computers: t.accessoriesCatalog.deviceComputers,
    watch: t.accessoriesCatalog.deviceWatch,
  };

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  function selectDevice(next: AccessoryDeviceType) {
    setDeviceType(next);
    const device = navTree.find((d) => d.deviceType === next);
    setBrandSlug(device?.brands[0]?.slug ?? null);
  }

  const hasProducts = navTree.length > 0;
  const seriesGroups = activeBrand?.seriesGroups ?? [];

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
          inverted
            ? "text-gray-300 hover:text-white"
            : "text-brand-gray-700 hover:text-brand-black"
        }`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        <span>{label}</span>
        <IconChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 flex w-[min(96vw,920px)] overflow-hidden border border-brand-gray-200 bg-white shadow-2xl">
          {!hasProducts ? (
            <div className="w-full px-8 py-12 text-center">
              <p className="text-sm font-medium text-brand-gray-600">
                {t.accessoriesCatalog.menuEmpty}
              </p>
              <Link
                href="/shop/accessories"
                className="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-brand-electric hover:underline"
                onClick={() => setOpen(false)}
              >
                {t.accessoriesCatalog.title}
              </Link>
            </div>
          ) : (
            <>
              <aside className="w-36 shrink-0 border-r border-brand-gray-100 bg-brand-gray-50 py-2">
                {navTree.map((device) => (
                  <button
                    key={device.deviceType}
                    type="button"
                    onClick={() => selectDevice(device.deviceType)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      activeDevice?.deviceType === device.deviceType
                        ? "bg-white text-brand-electric shadow-sm"
                        : "text-brand-gray-700 hover:bg-white/80"
                    }`}
                  >
                    {deviceLabels[device.deviceType]}
                    {activeDevice?.deviceType === device.deviceType ? (
                      <span className="text-brand-electric">›</span>
                    ) : null}
                  </button>
                ))}
              </aside>

              <div className="min-w-0 flex-1">
                <div className="flex gap-1 overflow-x-auto border-b border-brand-gray-100 px-4 py-3 scrollbar-hide">
                  {activeDevice?.brands.map((brand) => (
                    <button
                      key={brand.slug}
                      type="button"
                      onClick={() => setBrandSlug(brand.slug)}
                      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                        activeBrand?.slug === brand.slug
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "text-brand-gray-600 hover:bg-brand-gray-50"
                      }`}
                    >
                      {brand.label}
                    </button>
                  ))}
                </div>

                {seriesGroups.length === 0 ? (
                  <p className="px-6 py-10 text-center text-sm text-brand-gray-500">
                    {t.accessoriesCatalog.menuEmptyBrand}
                  </p>
                ) : (
                  <div className="grid max-h-[360px] grid-cols-2 gap-4 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {seriesGroups.map((group) => (
                      <div key={group.seriesSlug} className="min-w-0">
                        <p className="mb-2 rounded-md bg-emerald-50 px-2 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                          {group.seriesLabel}
                        </p>
                        {group.recent.length > 0 ? (
                          <div className="mb-2">
                            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-brand-gray-400">
                              {t.accessoriesCatalog.mostRecent}
                            </p>
                            <ul className="space-y-0.5">
                              {group.recent.map((model) => (
                                <li key={`r-${model.slug}`}>
                                  <Link
                                    href={accessoriesShopPath(
                                      activeDevice!.deviceType,
                                      activeBrand!.slug,
                                      model.slug
                                    )}
                                    className="block truncate text-xs font-semibold text-brand-navy transition-colors hover:text-brand-electric"
                                    onClick={() => setOpen(false)}
                                  >
                                    {model.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        <div>
                          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-brand-gray-400">
                            {t.accessoriesCatalog.allModels}
                          </p>
                          <ul className="space-y-0.5">
                            {group.all.map((model) => (
                              <li key={model.slug}>
                                <Link
                                  href={accessoriesShopPath(
                                    activeDevice!.deviceType,
                                    activeBrand!.slug,
                                    model.slug
                                  )}
                                  className="block truncate text-xs font-semibold text-brand-navy transition-colors hover:text-brand-electric"
                                  onClick={() => setOpen(false)}
                                >
                                  {model.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeDevice && activeBrand ? (
                  <div className="border-t border-brand-gray-100 px-4 py-2 text-right">
                    <Link
                      href={accessoriesShopPath(
                        activeDevice.deviceType,
                        activeBrand.slug
                      )}
                      className="text-xs font-bold uppercase tracking-wide text-brand-electric hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      {t.accessoriesCatalog.viewAll}
                    </Link>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
