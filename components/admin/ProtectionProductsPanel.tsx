"use client";

import { useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import DeviceHierarchyProductsPanel from "@/components/admin/DeviceHierarchyProductsPanel";
import {
  buildProtectionProductName,
  PROTECTION_SUBTYPES,
  ProtectionSubtype,
} from "@/lib/protection-catalog";
import { Product } from "@/types";

export default function ProtectionProductsPanel() {
  const { t } = useLanguage();

  const subtypeOptions = useMemo(
    () =>
      PROTECTION_SUBTYPES.map((subtype) => ({
        value: subtype,
        label: {
          case: t.protection.subtypeCase,
          screenProtector: t.protection.subtypeScreen,
          film: t.protection.subtypeFilm,
          lens: t.protection.subtypeLens,
          pack: t.protection.subtypePack,
          other: t.protection.subtypeOther,
        }[subtype as ProtectionSubtype],
      })),
    [t]
  );

  return (
    <DeviceHierarchyProductsPanel
      category="protection"
      subtypeOptions={subtypeOptions}
      buildName={buildProtectionProductName}
      labels={{
        uploadTitle: t.protection.adminTitle,
        catalogTitle: t.protection.catalogTitle,
        publishProduct: t.protection.publishProduct,
        filterDeviceType: t.protection.filterDeviceType,
        filterBrand: t.protection.filterBrand,
        filterType: t.protection.filterType,
        seriesLabel: t.protection.seriesLabel,
        modelLabel: t.protection.modelLabel,
        customNameOptional: t.protection.customNameOptional,
        deviceMobiles: t.protection.deviceMobiles,
        deviceTablets: t.protection.deviceTablets,
        deviceComputers: t.protection.deviceComputers,
        deviceWatch: t.protection.deviceWatch,
      }}
      matchProduct={(product) => product.category === "protection"}
      getHierarchyFields={(product: Product) => ({
        deviceType: product.protection_device_type,
        brandSlug: product.protection_brand_slug,
        modelSlug: product.protection_model_slug,
        series: product.protection_series,
        subtype: product.protection_subtype,
      })}
    />
  );
}
