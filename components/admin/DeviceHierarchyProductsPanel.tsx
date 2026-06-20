"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import AdminProductInventory from "@/components/admin/AdminProductInventory";
import { useLanguage } from "@/components/LanguageProvider";
import {
  DeviceCatalogTree,
  getDeviceSeriesGroups,
  normalizeDeviceCatalog,
} from "@/lib/catalog-service";
import {
  PROTECTION_DEVICE_TYPES,
  ProtectionDeviceType,
} from "@/lib/protection-catalog";
import { Product, ProductCategory } from "@/types";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
    >
      {children}
    </label>
  );
}

type SubtypeOption = { value: string; label: string };

interface DeviceHierarchyProductsPanelProps {
  category: Extract<ProductCategory, "protection" | "accessories">;
  subtypeOptions: SubtypeOption[];
  buildName: (
    subtypeLabel: string,
    brandLabel: string,
    modelLabel: string,
    customName?: string
  ) => string;
  labels: {
    uploadTitle: string;
    catalogTitle: string;
    publishProduct: string;
    filterDeviceType: string;
    filterBrand: string;
    filterType: string;
    seriesLabel: string;
    modelLabel: string;
    customNameOptional: string;
    deviceMobiles: string;
    deviceTablets: string;
    deviceComputers: string;
    deviceWatch: string;
  };
  getHierarchyFields: (product: Product) => {
    deviceType?: string | null;
    brandSlug?: string | null;
    modelSlug?: string | null;
    series?: string | null;
    subtype?: string | null;
  };
  matchProduct: (product: Product) => boolean;
}

export default function DeviceHierarchyProductsPanel({
  category,
  subtypeOptions,
  buildName,
  labels,
  getHierarchyFields,
  matchProduct,
}: DeviceHierarchyProductsPanelProps) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [tree, setTree] = useState<DeviceCatalogTree>({
    brands: [],
    series: [],
    models: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deviceType, setDeviceType] = useState<ProtectionDeviceType>("mobiles");
  const [brandId, setBrandId] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [modelId, setModelId] = useState("");
  const [subtype, setSubtype] = useState(subtypeOptions[0]?.value ?? "");
  const [customName, setCustomName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const deviceLabels: Record<ProtectionDeviceType, string> = {
    mobiles: labels.deviceMobiles,
    tablets: labels.deviceTablets,
    computers: labels.deviceComputers,
    watch: labels.deviceWatch,
  };

  const prefix = category === "protection" ? "protection" : "accessory";

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products");
      const data: { products?: Product[] } = await response.json();
      setProducts((data.products ?? []).filter(matchProduct));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [matchProduct]);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const response = await fetch(
        `/api/admin/catalog/devices?deviceType=${deviceType}`
      );
      const data: unknown = await response.json();
      setTree(normalizeDeviceCatalog(data));
    } catch {
      setTree({ brands: [], series: [], models: [] });
    } finally {
      setCatalogLoading(false);
    }
  }, [deviceType]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const brands = tree.brands ?? [];
  const selectedBrand = brands.find((b) => b.id === brandId);
  const seriesGroups = selectedBrand
    ? getDeviceSeriesGroups(tree, selectedBrand.id)
    : [];
  const selectedSeriesGroup = seriesGroups.find((g) => g.series.id === seriesId);
  const modelsInSeries = selectedSeriesGroup?.models ?? [];

  useEffect(() => {
    if (brands[0] && !brands.some((b) => b.id === brandId)) {
      setBrandId(brands[0].id);
    }
  }, [brands, brandId]);

  useEffect(() => {
    const groups = selectedBrand
      ? getDeviceSeriesGroups(tree, selectedBrand.id)
      : [];
    if (groups[0] && !groups.some((g) => g.series.id === seriesId)) {
      setSeriesId(groups[0].series.id);
    }
  }, [selectedBrand, tree, seriesId]);

  useEffect(() => {
    if (modelsInSeries[0] && !modelsInSeries.some((m) => m.id === modelId)) {
      setModelId(modelsInSeries[0].id);
    }
  }, [modelsInSeries, modelId]);

  const selectedModel = modelsInSeries.find((m) => m.id === modelId);
  const subtypeLabel =
    subtypeOptions.find((s) => s.value === subtype)?.label ?? subtype;

  const previewName = useMemo(() => {
    if (!selectedBrand || !selectedModel) return "";
    return buildName(
      subtypeLabel,
      selectedBrand.label,
      selectedModel.label,
      customName
    );
  }, [selectedBrand, selectedModel, subtypeLabel, customName, buildName]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageFile || !selectedBrand || !selectedModel || !selectedSeriesGroup) {
      setError(t.admin.uploadError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name", previewName);
    formData.append("brand", selectedBrand.label);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("image", imageFile);
    formData.append(`${prefix}_device_type`, deviceType);
    formData.append(`${prefix}_brand_slug`, selectedBrand.slug);
    formData.append(`${prefix}_model_slug`, selectedModel.slug);
    formData.append(`${prefix}_series`, selectedSeriesGroup.series.slug);
    formData.append(`${prefix}_subtype`, subtype);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      setSuccess(`${previewName} — ${t.admin.uploadSuccess}`);
      setPrice("");
      setStock("");
      setCustomName("");
      setImageFile(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={labels.uploadTitle}>
        {catalogLoading ? (
          <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {brands.length === 0 ||
            seriesGroups.length === 0 ||
            modelsInSeries.length === 0 ? (
              <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p>{t.admin.catalogTabHint}</p>
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <FieldLabel htmlFor={`${prefix}-device`}>
                  {labels.filterDeviceType}
                </FieldLabel>
                <select
                  id={`${prefix}-device`}
                  value={deviceType}
                  onChange={(e) =>
                    setDeviceType(e.target.value as ProtectionDeviceType)
                  }
                  className="input-field"
                >
                  {PROTECTION_DEVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {deviceLabels[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor={`${prefix}-brand`}>
                  {labels.filterBrand}
                </FieldLabel>
                <select
                  id={`${prefix}-brand`}
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="input-field"
                  disabled={brands.length === 0}
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor={`${prefix}-series`}>
                  {labels.seriesLabel}
                </FieldLabel>
                <select
                  id={`${prefix}-series`}
                  value={seriesId}
                  onChange={(e) => setSeriesId(e.target.value)}
                  className="input-field"
                  disabled={seriesGroups.length === 0}
                >
                  {seriesGroups.map((group) => (
                    <option key={group.series.id} value={group.series.id}>
                      {group.series.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor={`${prefix}-model`}>
                  {labels.modelLabel}
                </FieldLabel>
                <select
                  id={`${prefix}-model`}
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="input-field"
                  disabled={modelsInSeries.length === 0}
                >
                  {modelsInSeries.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor={`${prefix}-subtype`}>
                  {labels.filterType}
                </FieldLabel>
                <select
                  id={`${prefix}-subtype`}
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value)}
                  className="input-field"
                >
                  {subtypeOptions.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor={`${prefix}-price`}>{t.admin.price}</FieldLabel>
                <input
                  id={`${prefix}-price`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <FieldLabel htmlFor={`${prefix}-stock`}>{t.admin.stock}</FieldLabel>
                <input
                  id={`${prefix}-stock`}
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor={`${prefix}-custom`}>
                {labels.customNameOptional}
              </FieldLabel>
              <input
                id={`${prefix}-custom`}
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={previewName}
                className="input-field"
              />
              <p className="mt-1 text-xs text-brand-gray-500">
                {t.admin.productName}: <strong>{previewName || "—"}</strong>
              </p>
            </div>

            <div>
              <FieldLabel htmlFor={`${prefix}-image`}>{t.admin.image}</FieldLabel>
              <input
                id={`${prefix}-image`}
                type="file"
                accept="image/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setImageFile(e.target.files?.[0] ?? null)
                }
                required
                className="input-field"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-700">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary max-w-xs disabled:opacity-50"
            >
              {submitting ? t.admin.uploading : labels.publishProduct}
            </button>
          </form>
        )}
      </Panel>

      <Panel title={labels.catalogTitle}>
        <AdminProductInventory
          products={products}
          loading={loading}
          onReload={loadProducts}
          extraColumns={[
            { key: "device", label: labels.filterDeviceType },
            { key: "model", label: labels.modelLabel },
          ]}
          renderExtraCells={(product) => {
            const h = getHierarchyFields(product);
            return (
              <>
                <td className="px-3 py-3 text-brand-gray-600">
                  {h.deviceType
                    ? deviceLabels[h.deviceType as ProtectionDeviceType]
                    : "—"}
                </td>
                <td className="px-3 py-3 text-brand-gray-600">
                  {h.modelSlug ?? "—"}
                </td>
              </>
            );
          }}
        />
      </Panel>
    </div>
  );
}
