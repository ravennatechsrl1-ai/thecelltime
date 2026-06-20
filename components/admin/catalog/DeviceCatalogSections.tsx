"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CatalogOptionManager } from "@/components/admin/catalog/CatalogOptionManager";
import { useLanguage } from "@/components/LanguageProvider";
import {
  DeviceBrandOption,
  DeviceModelOption,
  DeviceSeriesOption,
  normalizeDeviceCatalog,
} from "@/lib/catalog-service";
import {
  PROTECTION_DEVICE_TYPES,
  ProtectionDeviceType,
} from "@/lib/protection-catalog";

function DeviceTypePills({
  deviceType,
  onChange,
}: {
  deviceType: ProtectionDeviceType;
  onChange: (type: ProtectionDeviceType) => void;
}) {
  const { t } = useLanguage();
  const deviceLabels: Record<ProtectionDeviceType, string> = {
    mobiles: t.protection.deviceMobiles,
    tablets: t.protection.deviceTablets,
    computers: t.protection.deviceComputers,
    watch: t.protection.deviceWatch,
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PROTECTION_DEVICE_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
            deviceType === type
              ? "bg-brand-electric text-white"
              : "border border-brand-gray-200 bg-white text-brand-gray-600 hover:border-brand-electric hover:text-brand-electric"
          }`}
        >
          {deviceLabels[type]}
        </button>
      ))}
    </div>
  );
}

function DeviceSeriesSection() {
  const { t } = useLanguage();
  const [deviceType, setDeviceType] = useState<ProtectionDeviceType>("mobiles");
  const [brands, setBrands] = useState<DeviceBrandOption[]>([]);
  const [series, setSeries] = useState<DeviceSeriesOption[]>([]);
  const [brandId, setBrandId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/catalog/devices?deviceType=${deviceType}`
      );
      const data = await response.json();
      const catalog = normalizeDeviceCatalog(data);
      setBrands(catalog.brands);
      setSeries(catalog.series);
    } catch {
      setBrands([]);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, [deviceType]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setBrandId("");
  }, [deviceType]);

  useEffect(() => {
    if (brands[0] && !brandId) setBrandId(brands[0].id);
  }, [brands, brandId]);

  const seriesForBrand = useMemo(
    () => series.filter((s) => s.brand_id === brandId),
    [series, brandId]
  );

  const brandLabel = brands.find((b) => b.id === brandId)?.label ?? "";

  const rows = seriesForBrand.map((s) => ({
    id: s.id,
    label: s.label,
    meta: s.slug,
  }));

  return (
    <div className="space-y-4">
      <DeviceTypePills deviceType={deviceType} onChange={setDeviceType} />

      {brands.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => setBrandId(brand.id)}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                brandId === brand.id
                  ? "bg-brand-electric text-white"
                  : "border border-brand-gray-200 bg-white text-brand-gray-600 hover:border-brand-electric hover:text-brand-electric"
              }`}
            >
              {brand.label}
            </button>
          ))}
        </div>
      ) : null}

      <CatalogOptionManager
        title={`${t.admin.manageSeries} — ${brandLabel || t.admin.brand}`}
        description={t.admin.seriesDesc}
        items={rows}
        loading={loading}
        addLabel={t.admin.addSeries}
        addPlaceholder="Series 17, Galaxy S…"
        emptyMessage={
          brands.length === 0 ? t.admin.brandsEmpty : t.admin.seriesEmpty
        }
        onAdd={async (label) => {
          if (!brandId) throw new Error(t.admin.brandsEmpty);
          const response = await fetch("/api/admin/catalog/devices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "series", brandId, label }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          await load();
        }}
        onEdit={async (id, label) => {
          const response = await fetch(`/api/admin/catalog/devices/series/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          await load();
        }}
        onDelete={async (id) => {
          const response = await fetch(`/api/admin/catalog/devices/series/${id}`, {
            method: "DELETE",
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          await load();
        }}
      />
    </div>
  );
}

function DeviceModelsSection() {
  const { t } = useLanguage();
  const [deviceType, setDeviceType] = useState<ProtectionDeviceType>("mobiles");
  const [brands, setBrands] = useState<DeviceBrandOption[]>([]);
  const [series, setSeries] = useState<DeviceSeriesOption[]>([]);
  const [models, setModels] = useState<DeviceModelOption[]>([]);
  const [brandId, setBrandId] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/catalog/devices?deviceType=${deviceType}`
      );
      const data = await response.json();
      const catalog = normalizeDeviceCatalog(data);
      setBrands(catalog.brands);
      setSeries(catalog.series);
      setModels(catalog.models);
    } catch {
      setBrands([]);
      setSeries([]);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [deviceType]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setBrandId("");
    setSeriesId("");
  }, [deviceType]);

  useEffect(() => {
    if (brands[0] && !brandId) setBrandId(brands[0].id);
  }, [brands, brandId]);

  const seriesForBrand = useMemo(
    () => series.filter((s) => s.brand_id === brandId),
    [series, brandId]
  );

  useEffect(() => {
    if (seriesForBrand[0] && !seriesForBrand.some((s) => s.id === seriesId)) {
      setSeriesId(seriesForBrand[0].id);
    }
  }, [seriesForBrand, seriesId]);

  const modelsInSeries = useMemo(
    () => models.filter((m) => m.series_id === seriesId),
    [models, seriesId]
  );

  const seriesLabel = seriesForBrand.find((s) => s.id === seriesId)?.label ?? "";

  const rows = modelsInSeries.map((m) => ({
    id: m.id,
    label: m.label,
    meta: m.slug,
  }));

  return (
    <div className="space-y-4">
      <DeviceTypePills deviceType={deviceType} onChange={setDeviceType} />

      {brands.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => {
                setBrandId(brand.id);
                setSeriesId("");
              }}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                brandId === brand.id
                  ? "bg-brand-electric text-white"
                  : "border border-brand-gray-200 bg-white text-brand-gray-600 hover:border-brand-electric hover:text-brand-electric"
              }`}
            >
              {brand.label}
            </button>
          ))}
        </div>
      ) : null}

      {seriesForBrand.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {seriesForBrand.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSeriesId(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                seriesId === s.id
                  ? "bg-brand-navy text-white"
                  : "border border-brand-gray-200 bg-white text-brand-gray-600 hover:border-brand-navy hover:text-brand-navy"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      <CatalogOptionManager
        title={`${t.admin.manageModels} — ${seriesLabel || t.admin.seriesLabel}`}
        description={t.admin.modelsDeviceDesc}
        items={rows}
        loading={loading}
        addLabel={t.admin.addModel}
        addPlaceholder="iPhone 17 Pro Max…"
        emptyMessage={
          seriesForBrand.length === 0 ? t.admin.seriesEmpty : t.admin.modelsEmpty
        }
        onAdd={async (label) => {
          if (!seriesId) throw new Error(t.admin.seriesEmpty);
          const response = await fetch("/api/admin/catalog/devices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "model", seriesId, label }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          await load();
        }}
        onEdit={async (id, label) => {
          const response = await fetch(`/api/admin/catalog/devices/models/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          await load();
        }}
        onDelete={async (id) => {
          const response = await fetch(`/api/admin/catalog/devices/models/${id}`, {
            method: "DELETE",
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          await load();
        }}
      />
    </div>
  );
}

export { DeviceSeriesSection, DeviceModelsSection };
