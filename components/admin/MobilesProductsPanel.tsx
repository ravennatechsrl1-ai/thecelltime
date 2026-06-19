"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import AdminProductInventory from "@/components/admin/AdminProductInventory";
import { AddCatalogOption } from "@/components/admin/AddCatalogOption";
import { useLanguage } from "@/components/LanguageProvider";
import { buildPhoneProductName } from "@/lib/admin-catalog";
import {
  normalizePhoneCatalog,
  PhoneBrandOption,
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
}

export default function MobilesProductsPanel() {
  const { t } = useLanguage();
  const [catalog, setCatalog] = useState<PhoneCatalog>({
    brands: [],
    models: [],
    conditions: [],
    storage: [],
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
  const [storage, setStorage] = useState("");
  const [condition, setCondition] = useState<ProductCondition>("new");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

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
      setCatalog({ brands: [], models: [], conditions: [], storage: [] });
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
    const conditions = catalog.conditions ?? [];
    const storageOptions = catalog.storage ?? [];

    if (brands[0] && !brandId) {
      setBrandId(brands[0].id);
    }
    if (conditions.length > 0) {
      const hasCurrent = conditions.some((c) => c.slug === condition);
      if (!hasCurrent) {
        setCondition(conditions[0].slug);
      }
    }
    if (storageOptions.length > 0) {
      const hasCurrent = storageOptions.some((s) => s.label === storage);
      if (!hasCurrent) {
        setStorage(storageOptions[0].label);
      }
    }
  }, [catalog, brandId, condition, storage]);

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

  const previewName = useMemo(() => {
    if (!selectedBrand || !modelLabel || !storage) return "";
    return buildPhoneProductName(selectedBrand.label, modelLabel, storage);
  }, [selectedBrand, modelLabel, storage]);

  async function addCatalog(kind: string, payload: Record<string, unknown>) {
    const response = await fetch("/api/admin/catalog/phones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...payload }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Failed to add option.");
    await loadCatalog();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageFile || !selectedBrand || !modelLabel) {
      setError(t.admin.uploadError);
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name", previewName);
    formData.append("brand", selectedBrand.label);
    formData.append("category", "phones");
    formData.append("condition", condition ?? "");
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("image", imageFile);

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
      setCustomModel("");
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
            {(catalog.brands ?? []).length === 0 ||
            (catalog.conditions ?? []).length === 0 ||
            (catalog.storage ?? []).length === 0 ? (
              <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p>{t.admin.catalogEmptyHint}</p>
                <button
                  type="button"
                  onClick={() => void loadCatalog()}
                  className="mt-2 text-xs font-bold uppercase tracking-wide text-brand-electric underline"
                >
                  {t.errors.retry}
                </button>
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
                <AddCatalogOption
                  label={t.admin.addBrand}
                  placeholder="Samsung, Apple…"
                  onAdd={(label) => addCatalog("brand", { label })}
                />
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
                <AddCatalogOption
                  label={t.admin.addCondition}
                  placeholder="Grade B Used…"
                  onAdd={(label) => addCatalog("condition", { label, shopGroup: "used" })}
                />
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
                <AddCatalogOption
                  label={t.admin.addModel}
                  placeholder="iPhone 17 Pro Max…"
                  disabled={!brandId}
                  onAdd={(label) => addCatalog("model", { brandId, label })}
                />
              </div>

              <div>
                <FieldLabel htmlFor="mob-storage">{t.admin.phoneStorage}</FieldLabel>
                <select
                  id="mob-storage"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="input-field"
                  required
                >
                  {(catalog.storage ?? []).length === 0 ? (
                    <option value="">{t.admin.selectStorage}</option>
                  ) : null}
                  {(catalog.storage ?? []).map((s) => (
                    <option key={s.id} value={s.label}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <AddCatalogOption
                  label={t.admin.addStorage}
                  placeholder="2TB…"
                  onAdd={(label) => addCatalog("storage", { label })}
                />
              </div>

              <div>
                <FieldLabel htmlFor="mob-price">{t.admin.price}</FieldLabel>
                <input
                  id="mob-price"
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
                <FieldLabel htmlFor="mob-stock">{t.admin.stock}</FieldLabel>
                <input
                  id="mob-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="rounded border border-brand-gray-200 bg-brand-gray-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                {t.admin.productName}
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-navy">
                {previewName || "—"}
              </p>
            </div>

            <div>
              <FieldLabel htmlFor="mob-image">{t.admin.image}</FieldLabel>
              <input
                id="mob-image"
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
        />
      </Panel>
    </div>
  );
}
