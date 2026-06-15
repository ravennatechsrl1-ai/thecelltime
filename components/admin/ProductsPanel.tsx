"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ACCESSORY_TYPES,
  AccessoryType,
  buildAccessoryProductName,
  buildPhoneProductName,
  getPhoneBrandDbName,
  InventoryTab,
  OTHER_BRAND_DEFAULT,
  PHONE_STORAGE_OPTIONS,
} from "@/lib/admin-catalog";
import { PHONE_BRANDS, PhoneBrandSlug } from "@/lib/phone-brands";
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

type StockFilter = "all" | "in_stock" | "low" | "out";
type ConditionFilter = "all" | "new" | "used";

export default function ProductsPanel() {
  const { t, formatPrice } = useLanguage();
  const [activeTab, setActiveTab] = useState<InventoryTab>("phones");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Phone fields
  const [phoneBrand, setPhoneBrand] = useState<PhoneBrandSlug>("apple");
  const [phoneModel, setPhoneModel] = useState("");
  const [phoneStorage, setPhoneStorage] = useState<string>(PHONE_STORAGE_OPTIONS[1]);
  const [phoneCondition, setPhoneCondition] = useState<ProductCondition>("new");

  // Accessory fields
  const [accessoryBrand, setAccessoryBrand] = useState<PhoneBrandSlug | "generic">("apple");
  const [accessoryType, setAccessoryType] = useState<AccessoryType>("charger");
  const [accessoryName, setAccessoryName] = useState("");

  // Other fields
  const [otherName, setOtherName] = useState("");
  const [otherBrand, setOtherBrand] = useState("");

  // Shared fields
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editCondition, setEditCondition] = useState<ProductCondition>("new");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [catalogMessage, setCatalogMessage] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      { id: "phones" as const, label: t.admin.tabPhones },
      { id: "accessories" as const, label: t.admin.tabAccessories },
      { id: "other" as const, label: t.admin.tabOther },
    ],
    [t]
  );

  const accessoryTypeLabels: Record<AccessoryType, string> = {
    charger: t.admin.accessoryTypeCharger,
    cable: t.admin.accessoryTypeCable,
    case: t.admin.accessoryTypeCase,
    screenProtector: t.admin.accessoryTypeScreen,
    audio: t.admin.accessoryTypeAudio,
    other: t.admin.accessoryTypeOther,
  };

  const phonePreviewName = useMemo(() => {
    const brandName = getPhoneBrandDbName(phoneBrand);
    return buildPhoneProductName(brandName, phoneModel, phoneStorage);
  }, [phoneBrand, phoneModel, phoneStorage]);

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === activeTab),
    [products, activeTab]
  );

  const brandOptions = useMemo(() => {
    const brands = new Set(categoryProducts.map((product) => product.brand));
    return Array.from(brands).sort((a, b) => a.localeCompare(b));
  }, [categoryProducts]);

  const displayedProducts = useMemo(() => {
    let list = categoryProducts;
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
      );
    }

    if (brandFilter !== "all") {
      list = list.filter((product) => product.brand === brandFilter);
    }

    if (activeTab === "phones" && conditionFilter !== "all") {
      list = list.filter((product) => product.condition === conditionFilter);
    }

    if (stockFilter === "in_stock") {
      list = list.filter((product) => product.stock > 5);
    } else if (stockFilter === "low") {
      list = list.filter((product) => product.stock > 0 && product.stock <= 5);
    } else if (stockFilter === "out") {
      list = list.filter((product) => product.stock <= 0);
    }

    return list;
  }, [
    categoryProducts,
    searchQuery,
    brandFilter,
    conditionFilter,
    stockFilter,
    activeTab,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    brandFilter !== "all" ||
    conditionFilter !== "all" ||
    stockFilter !== "all";

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products");
      const data: { products?: Product[] } = await response.json();
      setProducts(data.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function resetCatalogFilters() {
    setSearchQuery("");
    setBrandFilter("all");
    setConditionFilter("all");
    setStockFilter("all");
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setEditName(product.name);
    setEditBrand(product.brand);
    setEditCondition(product.condition ?? "new");
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
    setEditImageFile(null);
    setCatalogMessage(null);
    setCatalogError(null);
  }

  function closeEditModal() {
    setEditingProduct(null);
    setEditImageFile(null);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;

    setEditSaving(true);
    setCatalogMessage(null);
    setCatalogError(null);

    const formData = new FormData();
    formData.append("name", editName.trim());
    formData.append("brand", editBrand.trim());
    formData.append("price", editPrice);
    formData.append("stock", editStock);
    formData.append("condition", editingProduct.category === "phones" ? editCondition ?? "" : "");
    if (editImageFile) {
      formData.append("image", editImageFile);
    }

    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        body: formData,
      });
      const data: { product?: Product; error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.updateError);

      setCatalogMessage(t.admin.updateSuccess);
      closeEditModal();
      await loadProducts();
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : t.admin.updateError);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(
      t.admin.deleteConfirm.replace("{name}", product.name)
    );
    if (!confirmed) return;

    setDeletingId(product.id);
    setCatalogMessage(null);
    setCatalogError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.deleteError);

      if (editingProduct?.id === product.id) {
        closeEditModal();
      }
      setCatalogMessage(t.admin.deleteSuccess);
      await loadProducts();
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : t.admin.deleteError);
    } finally {
      setDeletingId(null);
    }
  }

  function resetForm() {
    setPhoneModel("");
    setPhoneStorage(PHONE_STORAGE_OPTIONS[1]);
    setPhoneCondition("new");
    setPhoneBrand("apple");
    setAccessoryName("");
    setAccessoryType("charger");
    setAccessoryBrand("apple");
    setOtherName("");
    setOtherBrand("");
    setPrice("");
    setStock("");
    setImageFile(null);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setImageFile(e.target.files?.[0] ?? null);
  }

  function resolveSubmitPayload(): {
    name: string;
    brand: string;
    category: "phones" | "accessories" | "other";
    condition: ProductCondition;
  } | null {
    if (activeTab === "phones") {
      if (!phoneModel.trim()) return null;
      const brandName = getPhoneBrandDbName(phoneBrand);
      return {
        name: buildPhoneProductName(brandName, phoneModel, phoneStorage),
        brand: brandName,
        category: "phones",
        condition: phoneCondition,
      };
    }

    if (activeTab === "accessories") {
      const brandName =
        accessoryBrand === "generic"
          ? t.admin.brandGeneric
          : getPhoneBrandDbName(accessoryBrand);
      const typeLabel = accessoryTypeLabels[accessoryType];
      const name = buildAccessoryProductName(brandName, typeLabel, accessoryName);
      if (!name.trim()) return null;
      return {
        name,
        brand: brandName,
        category: "accessories",
        condition: null,
      };
    }

    if (!otherName.trim()) return null;
    return {
      name: otherName.trim(),
      brand: otherBrand.trim() || OTHER_BRAND_DEFAULT,
      category: "other",
      condition: null,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      setError(t.admin.selectImage);
      return;
    }

    const payload = resolveSubmitPayload();
    if (!payload) {
      setError(t.admin.uploadError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("brand", payload.brand);
    formData.append("category", payload.category);
    formData.append("condition", payload.condition ?? "");
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("image", imageFile);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });
      const data: { product?: Product; error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);

      setSuccess(`${payload.name} — ${t.admin.uploadSuccess}`);
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorUnexpected);
    } finally {
      setSubmitting(false);
    }
  }

  function renderPhoneForm() {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="phone-brand">{t.admin.brand}</FieldLabel>
            <select
              id="phone-brand"
              value={phoneBrand}
              onChange={(e) => setPhoneBrand(e.target.value as PhoneBrandSlug)}
              className="input-field"
            >
              {PHONE_BRANDS.map((brand) => (
                <option key={brand.slug} value={brand.slug}>
                  {t.nav[brand.labelKey]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="phone-condition">{t.admin.condition}</FieldLabel>
            <select
              id="phone-condition"
              value={phoneCondition ?? "new"}
              onChange={(e) => setPhoneCondition(e.target.value as ProductCondition)}
              className="input-field"
            >
              <option value="new">{t.admin.condNew}</option>
              <option value="used">{t.admin.condUsed}</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="phone-model">{t.admin.phoneModel}</FieldLabel>
            <input
              id="phone-model"
              type="text"
              value={phoneModel}
              onChange={(e) => setPhoneModel(e.target.value)}
              placeholder={t.admin.phoneModelPlaceholder}
              className="input-field"
              required
            />
          </div>
          <div>
            <FieldLabel htmlFor="phone-storage">{t.admin.phoneStorage}</FieldLabel>
            <select
              id="phone-storage"
              value={phoneStorage}
              onChange={(e) => setPhoneStorage(e.target.value)}
              className="input-field"
            >
              {PHONE_STORAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded border border-brand-gray-200 bg-brand-gray-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
            {t.admin.productName}
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-navy">
            {phonePreviewName || "—"}
          </p>
          <p className="mt-1 text-xs text-brand-gray-500">{t.admin.autoNameHint}</p>
        </div>
      </>
    );
  }

  function renderAccessoryForm() {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="accessory-brand">{t.admin.brand}</FieldLabel>
            <select
              id="accessory-brand"
              value={accessoryBrand}
              onChange={(e) =>
                setAccessoryBrand(e.target.value as PhoneBrandSlug | "generic")
              }
              className="input-field"
            >
              {PHONE_BRANDS.map((brand) => (
                <option key={brand.slug} value={brand.slug}>
                  {t.nav[brand.labelKey]}
                </option>
              ))}
              <option value="generic">{t.admin.brandGeneric}</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="accessory-type">{t.admin.accessoryType}</FieldLabel>
            <select
              id="accessory-type"
              value={accessoryType}
              onChange={(e) => setAccessoryType(e.target.value as AccessoryType)}
              className="input-field"
            >
              {ACCESSORY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {accessoryTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="accessory-name">{t.admin.accessoryName}</FieldLabel>
          <input
            id="accessory-name"
            type="text"
            value={accessoryName}
            onChange={(e) => setAccessoryName(e.target.value)}
            placeholder={`${accessoryTypeLabels[accessoryType]}…`}
            className="input-field"
          />
          <p className="mt-1 text-xs text-brand-gray-500">{t.admin.autoNameHint}</p>
        </div>
      </>
    );
  }

  function renderOtherForm() {
    return (
      <>
        <div>
          <FieldLabel htmlFor="other-name">{t.admin.otherProductName}</FieldLabel>
          <input
            id="other-name"
            type="text"
            value={otherName}
            onChange={(e) => setOtherName(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="other-brand">{t.admin.otherBrandOptional}</FieldLabel>
          <input
            id="other-brand"
            type="text"
            value={otherBrand}
            onChange={(e) => setOtherBrand(e.target.value)}
            className="input-field"
          />
        </div>
      </>
    );
  }

  const uploadTitles: Record<InventoryTab, string> = {
    phones: t.admin.tabPhones,
    accessories: t.admin.tabAccessories,
    other: t.admin.tabOther,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 border border-brand-gray-200 bg-white p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setSuccess(null);
              setError(null);
              resetCatalogFilters();
              setCatalogMessage(null);
              setCatalogError(null);
            }}
            className={`min-h-[44px] flex-1 border px-4 py-2 text-xs font-bold uppercase tracking-wide sm:flex-none sm:px-6 ${
              activeTab === tab.id
                ? "border-brand-navy bg-brand-navy text-white"
                : "border-brand-gray-200 text-brand-gray-700 hover:border-brand-gray-400"
            }`}
          >
            {tab.label}
            <span className="ml-2 opacity-70">
              ({products.filter((p) => p.category === tab.id).length})
            </span>
          </button>
        ))}
      </div>

      <Panel title={`${t.admin.uploadTitle} — ${uploadTitles[activeTab]}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "phones" && renderPhoneForm()}
          {activeTab === "accessories" && renderAccessoryForm()}
          {activeTab === "other" && renderOtherForm()}

          <div className="grid gap-4 border-t border-brand-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <FieldLabel htmlFor="product-price">{t.admin.price}</FieldLabel>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor="product-stock">{t.admin.stock}</FieldLabel>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <FieldLabel htmlFor="product-image">{t.admin.image}</FieldLabel>
              <input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="input-field file:mr-4 file:border-0 file:bg-brand-black file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white"
                required
              />
            </div>
          </div>

          {success && <p className="text-sm text-green-700">{success}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary max-w-xs disabled:opacity-50">
            {submitting ? t.admin.uploading : t.admin.publish}
          </button>
        </form>
      </Panel>

      <Panel title={`${t.admin.catalogInventory} — ${uploadTitles[activeTab]}`}>
        {loading ? (
          <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
        ) : categoryProducts.length === 0 ? (
          <p className="text-sm text-brand-gray-500">{t.admin.noProductsYet}</p>
        ) : (
          <div className="space-y-4">
            <div className="border border-brand-gray-200 bg-brand-gray-50 p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                {t.admin.catalogFilters}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <FieldLabel htmlFor="catalog-search">{t.admin.filterSearch}</FieldLabel>
                  <input
                    id="catalog-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.admin.filterSearchPlaceholder}
                    className="input-field"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="catalog-brand">{t.admin.brand}</FieldLabel>
                  <select
                    id="catalog-brand"
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">{t.nav.allBrands}</option>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                {activeTab === "phones" && (
                  <div>
                    <FieldLabel htmlFor="catalog-condition">{t.admin.condition}</FieldLabel>
                    <select
                      id="catalog-condition"
                      value={conditionFilter}
                      onChange={(e) =>
                        setConditionFilter(e.target.value as ConditionFilter)
                      }
                      className="input-field"
                    >
                      <option value="all">{t.admin.filterConditionAll}</option>
                      <option value="new">{t.admin.condNew}</option>
                      <option value="used">{t.admin.condUsed}</option>
                    </select>
                  </div>
                )}
                <div>
                  <FieldLabel htmlFor="catalog-stock">{t.admin.filterStock}</FieldLabel>
                  <select
                    id="catalog-stock"
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                    className="input-field"
                  >
                    <option value="all">{t.admin.filterStockAll}</option>
                    <option value="in_stock">{t.admin.filterStockInStock}</option>
                    <option value="low">{t.admin.filterStockLow}</option>
                    <option value="out">{t.admin.filterStockOut}</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-brand-gray-500">
                  {t.admin.showingProducts
                    .replace("{shown}", String(displayedProducts.length))
                    .replace("{total}", String(categoryProducts.length))}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetCatalogFilters}
                    className="text-xs font-semibold uppercase tracking-wide text-brand-navy underline-offset-2 hover:underline"
                  >
                    {t.admin.clearFilters}
                  </button>
                )}
              </div>
            </div>

            {catalogMessage && (
              <p className="text-sm text-green-700">{catalogMessage}</p>
            )}
            {catalogError && <p className="text-sm text-red-600">{catalogError}</p>}

            {displayedProducts.length === 0 ? (
              <p className="text-sm text-brand-gray-500">{t.admin.noFilterResults}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="border-b border-brand-gray-200 bg-brand-gray-50 text-xs font-bold uppercase tracking-wide text-brand-gray-500">
                    <tr>
                      <th className="px-3 py-3">{t.admin.colProduct}</th>
                      <th className="px-3 py-3">{t.admin.brand}</th>
                      {activeTab === "phones" && (
                        <th className="px-3 py-3">{t.admin.condition}</th>
                      )}
                      <th className="px-3 py-3">{t.admin.price}</th>
                      <th className="px-3 py-3">{t.admin.stock}</th>
                      <th className="px-3 py-3">{t.admin.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProducts.map((product) => (
                      <tr key={product.id} className="border-b border-brand-gray-100 last:border-0">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 bg-brand-gray-50">
                              <SafeImage
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-contain p-1"
                                sizes="40px"
                              />
                            </div>
                            <span className="font-medium text-brand-navy">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">{product.brand}</td>
                        {activeTab === "phones" && (
                          <td className="px-3 py-3 uppercase text-xs">
                            {product.condition === "new"
                              ? t.admin.condNew
                              : product.condition === "used"
                                ? t.admin.condUsed
                                : "—"}
                          </td>
                        )}
                        <td className="px-3 py-3 font-semibold">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs font-bold uppercase ${
                              product.stock <= 0
                                ? "text-red-600"
                                : product.stock <= 5
                                  ? "text-amber-600"
                                  : "text-emerald-700"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="min-h-[36px] border border-brand-gray-300 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-navy transition-colors hover:border-brand-black"
                            >
                              {t.admin.editProduct}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product)}
                              disabled={deletingId === product.id}
                              className="min-h-[36px] border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-red-700 transition-colors hover:border-red-400 disabled:opacity-50"
                            >
                              {deletingId === product.id ? t.common.loading : t.admin.deleteProduct}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Panel>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-brand-gray-200 bg-white p-5 shadow-lg sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3
                id="edit-product-title"
                className="text-sm font-black uppercase tracking-wide text-brand-navy"
              >
                {t.admin.editProductTitle}
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-xs font-bold uppercase text-brand-gray-500 hover:text-brand-black"
              >
                {t.common.cancel}
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <FieldLabel htmlFor="edit-name">{t.admin.productName}</FieldLabel>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <FieldLabel htmlFor="edit-brand">{t.admin.brand}</FieldLabel>
                <input
                  id="edit-brand"
                  type="text"
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {editingProduct.category === "phones" && (
                <div>
                  <FieldLabel htmlFor="edit-condition">{t.admin.condition}</FieldLabel>
                  <select
                    id="edit-condition"
                    value={editCondition ?? "new"}
                    onChange={(e) =>
                      setEditCondition(e.target.value as ProductCondition)
                    }
                    className="input-field"
                  >
                    <option value="new">{t.admin.condNew}</option>
                    <option value="used">{t.admin.condUsed}</option>
                  </select>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="edit-price">{t.admin.price}</FieldLabel>
                  <input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="edit-stock">{t.admin.stock}</FieldLabel>
                  <input
                    id="edit-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="edit-image">{t.admin.replaceImageOptional}</FieldLabel>
                <input
                  id="edit-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)}
                  className="input-field file:mr-4 file:border-0 file:bg-brand-black file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="btn-primary max-w-xs disabled:opacity-50"
                >
                  {editSaving ? t.admin.saving : t.admin.saveChanges}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(editingProduct)}
                  disabled={deletingId === editingProduct.id}
                  className="min-h-[44px] border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-red-700 transition-colors hover:border-red-400 disabled:opacity-50"
                >
                  {t.admin.deleteProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
