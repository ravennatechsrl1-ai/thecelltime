"use client";

import { useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import DeviceHierarchyProductsPanel from "@/components/admin/DeviceHierarchyProductsPanel";
import {
  ACCESSORY_SUBTYPES,
  AccessorySubtype,
  buildAccessoryProductName,
  isHierarchicalAccessory,
} from "@/lib/accessories-catalog";
import { Product } from "@/types";

export default function AccessoriesProductsPanel() {
  const { t } = useLanguage();

  const subtypeOptions = useMemo(
    () =>
      ACCESSORY_SUBTYPES.map((subtype) => ({
        value: subtype,
        label: {
          charger: t.accessoriesCatalog.subtypeCharger,
          cable: t.accessoriesCatalog.subtypeCable,
          case: t.accessoriesCatalog.subtypeCase,
          screenProtector: t.accessoriesCatalog.subtypeScreen,
          audio: t.accessoriesCatalog.subtypeAudio,
          other: t.accessoriesCatalog.subtypeOther,
        }[subtype as AccessorySubtype],
      })),
    [t]
  );

  return (
    <DeviceHierarchyProductsPanel
      category="accessories"
      subtypeOptions={subtypeOptions}
      buildName={buildAccessoryProductName}
      labels={{
        uploadTitle: t.accessoriesCatalog.adminTitle,
        catalogTitle: t.accessoriesCatalog.catalogTitle,
        publishProduct: t.accessoriesCatalog.publishProduct,
        filterDeviceType: t.accessoriesCatalog.filterDeviceType,
        filterBrand: t.accessoriesCatalog.filterBrand,
        filterType: t.accessoriesCatalog.filterType,
        seriesLabel: t.accessoriesCatalog.seriesLabel,
        modelLabel: t.accessoriesCatalog.modelLabel,
        customNameOptional: t.accessoriesCatalog.customNameOptional,
        deviceMobiles: t.accessoriesCatalog.deviceMobiles,
        deviceTablets: t.accessoriesCatalog.deviceTablets,
        deviceComputers: t.accessoriesCatalog.deviceComputers,
        deviceWatch: t.accessoriesCatalog.deviceWatch,
      }}
      matchProduct={isHierarchicalAccessory}
      getHierarchyFields={(product: Product) => ({
        deviceType: product.accessory_device_type,
        brandSlug: product.accessory_brand_slug,
        modelSlug: product.accessory_model_slug,
        series: product.accessory_series,
        subtype: product.accessory_subtype,
      })}
    />
  );
}
