"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import AdminProductInventory from "@/components/admin/AdminProductInventory";
import { useLanguage } from "@/components/LanguageProvider";
import { buildPhoneProductName } from "@/lib/admin-catalog";
import {
  normalizePhoneCatalog,
  PhoneBrandOption,
  PhoneColorOption,
  PhoneConditionOption,
  PhoneModelOption,
  PhoneStorageOption,
} from "@/lib/catalog-service";
import { Product, ProductCondition } from "@/types";

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

const CUSTOM_MODEL = "__custom__";

interface PhoneCatalog {
  brands: PhoneBrandOption[];
  models: PhoneModelOption[];
  conditions: PhoneConditionOption[];
  storage: PhoneStorageOption[];
  colors: PhoneColorOption[];
}

interface VariantDraft {
  key: string;
  storage: string;
  color: string;
  price: string;
  stock: string;
  imageFile: File | null;
}

function createVariantDraft(
  storage = "",
  color = ""
): VariantDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    storage,
    color,
    price: "",
    stock: "",
    imageFile: null,
  };
}

export default function MobilesProductsPanel() {
  const { t } = useLanguage();
  const [catalog, setCatalog] = useState<PhoneCatalog>({
    brands: [],
    models: [],
    conditions: [],
    storage: [],
    colors: [],
  });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogLoadError, setCatalogLoadError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [condition, setCondition] = useState<ProductCondition>("new");
  const [variants, setVariants] = useState<VariantDraft[]>([createVariantDraft()]);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogLoadError(null);
    try {
      const response = await fetch("/api/admin/catalog/phones");
      const data: unknown = await response.json();
      const normalized = normalizePhoneCatalog(data);
      if ("error" in (data as object) && (data as { error?: string }).error) {
        setCatalogLoadError((data as { error: string }).error);
      }
      if (
        !response.ok &&
        normalized.brands.length === 0 &&
        normalized.conditions.length === 0
      ) {
        setCatalogLoadError(t.admin.uploadError);
      }
      setCatalog(normalized);
    } catch {
      setCatalog({ brands: [], models: [], conditions: [], storage: [], colors: [] });
      setCatalogLoadError(t.admin.uploadError);
    } finally {
      setCatalogLoading(false);
    }
  }, [t.admin.uploadError]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products");
      const data: { products?: Product[] } = await response.json();
      setProducts((data.products ?? []).filter((p) => p.category === "phones"));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
    loadProducts();
  }, [loadCatalog, loadProducts]);

  useEffect(() => {
    const brands = catalog.brands ?? [];
    if (brands[0] && !brandId) {
      setBrandId(brands[0].id);
    }
  }, [catalog.brands, brandId]);

  useEffect(() => {
    const conditions = catalog.conditions ?? [];
    if (conditions.length === 0) return;
    if (!conditions.some((c) => c.slug === condition)) {
      setCondition(conditions[0].slug);
    }
  }, [catalog.conditions, condition]);

  useEffect(() => {
    const storageOptions = catalog.storage ?? [];
    const colorOptions = catalog.colors ?? [];
    if (storageOptions.length === 0 && colorOptions.length === 0) return;

    setVariants((current) => {
      if (current.length === 0) {
        return [
          createVariantDraft(
            storageOptions[0]?.label ?? "",
            colorOptions[0]?.label ?? ""
          ),
        ];
      }

      return current.map((row, index) => ({
        ...row,
        storage: row.storage || storageOptions[index % storageOptions.length]?.label || "",
        color: row.color || colorOptions[index % colorOptions.length]?.label || "",
      }));
    });
  }, [catalog.storage, catalog.colors]);

  const selectedBrand = (catalog.brands ?? []).find((b) => b.id === brandId);
  const modelsForBrand = useMemo(
    () => (catalog.models ?? []).filter((m) => m.brand_id === brandId),
    [catalog.models, brandId]
  );

  useEffect(() => {
    if (modelsForBrand.length === 0) {
      setModelId(CUSTOM_MODEL);
      return;
    }
    if (!modelsForBrand.some((m) => m.id === modelId)) {
      setModelId(modelsForBrand[0].id);
    }
  }, [modelsForBrand, modelId]);

  const modelLabel = useMemo(() => {
    if (modelId === CUSTOM_MODEL) return customModel.trim();
    return modelsForBrand.find((m) => m.id === modelId)?.label ?? "";
  }, [modelId, customModel, modelsForBrand]);

  const baseName = useMemo(() => {
    if (!selectedBrand || !modelLabel) return "";
    return buildPhoneProductName(selectedBrand.label, modelLabel, "", "");
  }, [selectedBrand, modelLabel]);

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function addVariantRow() {
    const storageOptions = catalog.storage ?? [];
    const colorOptions = catalog.colors ?? [];
    setVariants((rows) => [
      ...rows,
      createVariantDraft(
        storageOptions[rows.length % storageOptions.length]?.label ?? "",
        colorOptions[rows.length % colorOptions.length]?.label ?? ""
      ),
    ]);
  }

  function removeVariantRow(key: string) {
    setVariants((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.key !== key)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedBrand || !modelLabel) {
      setError(t.admin.uploadError);
      return;
    }

    for (const row of variants) {
      if (!row.storage || !row.color || !row.price || !row.stock || !row.imageFile) {
        setError(t.admin.uploadError);
        return;
      }
    }

    const comboKeys = variants.map(
      (row) => `${row.storage.toLowerCase()}|${row.color.toLowerCase()}`
    );
    if (new Set(comboKeys).size !== comboKeys.length) {
      setError(t.admin.uploadError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("brand", selectedBrand.label);
    formData.append("phone_model", modelLabel);
    formData.append("condition", condition ?? "");
    formData.append(
      "variants",
      JSON.stringify(
        variants.map((row) => ({
          storage: row.storage,
          color: row.color,
          price: parseFloat(row.price),
          stock: parseInt(row.stock, 10),
        }))
      )
    );

    variants.forEach((row, index) => {
      if (row.imageFile) {
        formData.append(`image_${index}`, row.imageFile);
      }
    });

    try {
      const response = await fetch("/api/admin/phone-listings", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      setSuccess(`${baseName} — ${t.admin.uploadSuccess}`);
      setCustomModel("");
      setVariants([createVariantDraft()]);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={`${t.admin.uploadTitle} — ${t.admin.tabMobiles}`}>
        {catalogLoading ? (
          <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {catalogLoadError ? (
              <p className="text-sm text-amber-700" role="alert">
                {catalogLoadError}
              </p>
            ) : null}
            {(catalog.brands ?? []).length === 0 ? (
              <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p>{t.admin.catalogTabHint}</p>
              </div>
            ) : null}
            {(catalog.conditions ?? []).length === 0 ||
            (catalog.storage ?? []).length === 0 ||
            (catalog.colors ?? []).length === 0 ||
            (modelsForBrand.length === 0 && modelId !== CUSTOM_MODEL) ? (
              <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p>{t.admin.catalogEmptyHint}</p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <FieldLabel htmlFor="mob-brand">{t.admin.brand}</FieldLabel>
                <select
                  id="mob-brand"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="input-field"
                  required
                >
                  {(catalog.brands ?? []).length === 0 ? (
                    <option value="">{t.admin.selectBrand}</option>
                  ) : null}
                  {(catalog.brands ?? []).map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="mob-condition">{t.admin.condition}</FieldLabel>
                <select
                  id="mob-condition"
                  value={condition ?? ""}
                  onChange={(e) => setCondition(e.target.value)}
                  className="input-field"
                  required
                >
                  {(catalog.conditions ?? []).length === 0 ? (
                    <option value="">{t.admin.selectCondition}</option>
                  ) : null}
                  {(catalog.conditions ?? []).map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="mob-model">{t.admin.phoneModel}</FieldLabel>
                <select
                  id="mob-model"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="input-field"
                >
                  {modelsForBrand.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))}
                  <option value={CUSTOM_MODEL}>{t.admin.customModelOption}</option>
                </select>
                {modelId === CUSTOM_MODEL && (
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder={t.admin.phoneModelPlaceholder}
                    className="input-field mt-2"
                    required
                  />
                )}
              </div>
            </div>

            <div className="rounded border border-brand-gray-200 bg-brand-gray-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                {t.admin.productName}
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-navy">
                {baseName || "—"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-navy">
                  {t.admin.variantsSection}
                </p>
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="text-xs font-bold uppercase tracking-wide text-brand-electric hover:underline"
                >
                  + {t.admin.addVariant}
                </button>
              </div>

              {variants.map((row, index) => (
                <div
                  key={row.key}
                  className="space-y-4 rounded border border-brand-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-gray-500">
                      {t.admin.variantNumber.replace("{number}", String(index + 1))}
                    </p>
                    {variants.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeVariantRow(row.key)}
                        className="text-xs font-bold uppercase tracking-wide text-red-600 hover:underline"
                      >
                        {t.admin.removeVariant}
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <FieldLabel htmlFor={`mob-storage-${row.key}`}>
                        {t.admin.phoneStorage}
                      </FieldLabel>
                      <select
                        id={`mob-storage-${row.key}`}
                        value={row.storage}
                        onChange={(e) =>
                          updateVariant(row.key, { storage: e.target.value })
                        }
                        className="input-field"
                        required
                      >
                        {(catalog.storage ?? []).map((s) => (
                          <option key={s.id} value={s.label}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel htmlFor={`mob-color-${row.key}`}>
                        {t.admin.phoneColor}
                      </FieldLabel>
                      <select
                        id={`mob-color-${row.key}`}
                        value={row.color}
                        onChange={(e) =>
                          updateVariant(row.key, { color: e.target.value })
                        }
                        className="input-field"
                        required
                      >
                        {(catalog.colors ?? []).map((c) => (
                          <option key={c.id} value={c.label}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel htmlFor={`mob-price-${row.key}`}>
                        {t.admin.price}
                      </FieldLabel>
                      <input
                        id={`mob-price-${row.key}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.price}
                        onChange={(e) =>
                          updateVariant(row.key, { price: e.target.value })
                        }
                        required
                        className="input-field"
                      />
                    </div>

                    <div>
                      <FieldLabel htmlFor={`mob-stock-${row.key}`}>
                        {t.admin.stock}
                      </FieldLabel>
                      <input
                        id={`mob-stock-${row.key}`}
                        type="number"
                        min="0"
                        value={row.stock}
                        onChange={(e) =>
                          updateVariant(row.key, { stock: e.target.value })
                        }
                        required
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel htmlFor={`mob-image-${row.key}`}>
                      {t.admin.imageForColor.replace("{color}", row.color || "—")}
                    </FieldLabel>
                    <input
                      id={`mob-image-${row.key}`}
                      type="file"
                      accept="image/*"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateVariant(row.key, {
                          imageFile: e.target.files?.[0] ?? null,
                        })
                      }
                      required
                      className="input-field"
                    />
                  </div>

                  <p className="text-xs text-brand-gray-500">
                    {buildPhoneProductName(
                      selectedBrand?.label ?? "",
                      modelLabel,
                      row.storage,
                      row.color
                    )}
                  </p>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-700">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary max-w-xs disabled:opacity-50"
            >
              {submitting ? t.admin.uploading : t.admin.publish}
            </button>
          </form>
        )}
      </Panel>

      <Panel title={`${t.admin.catalogInventory} — ${t.admin.tabMobiles}`}>
        <AdminProductInventory
          products={products}
          loading={loading}
          onReload={loadProducts}
          showCondition
          conditionOptions={(catalog.conditions ?? []).map((c) => ({
            slug: c.slug,
            label: c.label,
          }))}
          storageOptions={(catalog.storage ?? []).map((s) => s.label)}
          colorOptions={(catalog.colors ?? []).map((c) => ({
            label: c.label,
            hex_color: c.hex_color,
          }))}
          extraColumns={[{ key: "color", label: t.admin.phoneColor }]}
          renderExtraCells={(product) => (
            <td className="px-3 py-3 text-brand-gray-600">{product.color ?? "—"}</td>
          )}
        />
      </Panel>
    </div>
  );
}
