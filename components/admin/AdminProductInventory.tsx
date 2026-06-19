"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { useLanguage } from "@/components/LanguageProvider";
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

export interface AdminInventoryFilter {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export default function AdminProductInventory({
  products,
  loading,
  onReload,
  showCondition = false,
  conditionOptions,
  extraColumns,
  renderExtraCells,
}: {
  products: Product[];
  loading: boolean;
  onReload: () => void;
  showCondition?: boolean;
  conditionOptions?: { slug: string; label: string }[];
  extraColumns?: { key: string; label: string }[];
  renderExtraCells?: (product: Product) => React.ReactNode;
}) {
  const { t, formatPrice } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editCondition, setEditCondition] = useState<ProductCondition>("new");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const brandOptions = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand));
    return Array.from(brands).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const displayedProducts = useMemo(() => {
    let list = products;
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }
    if (brandFilter !== "all") {
      list = list.filter((p) => p.brand === brandFilter);
    }
    if (showCondition && conditionFilter !== "all") {
      list = list.filter((p) => p.condition === conditionFilter);
    }
    if (stockFilter === "in_stock") {
      list = list.filter((p) => p.stock > 5);
    } else if (stockFilter === "low") {
      list = list.filter((p) => p.stock > 0 && p.stock <= 5);
    } else if (stockFilter === "out") {
      list = list.filter((p) => p.stock <= 0);
    }
    return list;
  }, [
    products,
    searchQuery,
    brandFilter,
    conditionFilter,
    stockFilter,
    showCondition,
    extraFilters,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    brandFilter !== "all" ||
    conditionFilter !== "all" ||
    stockFilter !== "all";

  function resetFilters() {
    setSearchQuery("");
    setBrandFilter("all");
    setConditionFilter("all");
    setStockFilter("all");
    setExtraFilters({});
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setEditName(product.name);
    setEditBrand(product.brand);
    setEditCondition(product.condition ?? "new");
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
    setEditImageFile(null);
    setMessage(null);
    setError(null);
  }

  function closeEdit() {
    setEditingProduct(null);
    setEditImageFile(null);
  }

  function conditionLabel(slug: string | null | undefined) {
    if (!slug) return "—";
    const match = conditionOptions?.find((c) => c.slug === slug);
    if (match) return match.label;
    if (slug === "new") return t.admin.condNew;
    if (slug === "used") return t.admin.condUsed;
    return slug;
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    setEditSaving(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("name", editName.trim());
    formData.append("brand", editBrand.trim());
    formData.append("price", editPrice);
    formData.append("stock", editStock);
    if (showCondition) {
      formData.append("condition", editCondition ?? "");
    }
    if (editImageFile) {
      formData.append("image", editImageFile);
    }

    try {
      const response = await fetch(
        `/api/admin/products/${editingProduct.id}`,
        { method: "PATCH", body: formData }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      setMessage(t.admin.saveChanges);
      closeEdit();
      await onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`${t.admin.deleteProduct}?`)) return;
    setDeletingId(product.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      if (editingProduct?.id === product.id) closeEdit();
      setMessage(t.admin.deleteSuccess);
      await onReload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {loading ? (
        <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-brand-gray-500">{t.admin.noProductsYet}</p>
      ) : (
        <div className="space-y-4">
          <div className="border border-brand-gray-200 bg-brand-gray-50 p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
              {t.admin.catalogFilters}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <FieldLabel htmlFor="inv-search">{t.admin.filterSearch}</FieldLabel>
                <input
                  id="inv-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.admin.filterSearchPlaceholder}
                  className="input-field"
                />
              </div>
              <div>
                <FieldLabel htmlFor="inv-brand">{t.admin.brand}</FieldLabel>
                <select
                  id="inv-brand"
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
              {showCondition && (
                <div>
                  <FieldLabel htmlFor="inv-condition">{t.admin.condition}</FieldLabel>
                  <select
                    id="inv-condition"
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">{t.admin.filterConditionAll}</option>
                    {(conditionOptions ?? []).map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <FieldLabel htmlFor="inv-stock">{t.admin.filterStock}</FieldLabel>
                <select
                  id="inv-stock"
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
                  .replace("{total}", String(products.length))}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold uppercase tracking-wide text-brand-navy underline-offset-2 hover:underline"
                >
                  {t.admin.clearFilters}
                </button>
              )}
            </div>
          </div>

          {message && <p className="text-sm text-green-700">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {displayedProducts.length === 0 ? (
            <p className="text-sm text-brand-gray-500">{t.admin.noFilterResults}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-brand-gray-200 bg-brand-gray-50 text-xs font-bold uppercase tracking-wide text-brand-gray-500">
                  <tr>
                    <th className="px-3 py-3">{t.admin.colProduct}</th>
                    <th className="px-3 py-3">{t.admin.brand}</th>
                    {extraColumns?.map((col) => (
                      <th key={col.key} className="px-3 py-3">
                        {col.label}
                      </th>
                    ))}
                    {showCondition && (
                      <th className="px-3 py-3">{t.admin.condition}</th>
                    )}
                    <th className="px-3 py-3">{t.admin.price}</th>
                    <th className="px-3 py-3">{t.admin.stock}</th>
                    <th className="px-3 py-3">{t.admin.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-brand-gray-100 hover:bg-brand-gray-50"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <SafeImage
                            src={product.image_url}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded border border-brand-gray-200 object-cover"
                          />
                          <span className="font-medium text-brand-navy">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-brand-gray-600">
                        {product.brand}
                      </td>
                      {renderExtraCells?.(product)}
                      {showCondition && (
                        <td className="px-3 py-3 text-brand-gray-600">
                          {conditionLabel(product.condition)}
                        </td>
                      )}
                      <td className="px-3 py-3 font-semibold">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-3 py-3">{product.stock}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="text-xs font-bold uppercase tracking-wide text-brand-electric hover:underline"
                          >
                            {t.admin.editProduct}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                            className="text-xs font-bold uppercase tracking-wide text-red-600 hover:underline disabled:opacity-40"
                          >
                            {t.admin.deleteProduct}
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

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <h3
              id="edit-product-title"
              className="text-lg font-bold text-brand-navy"
            >
              {t.admin.editProductTitle}
            </h3>
            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
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
              {showCondition && (
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
                    {(conditionOptions ?? []).map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditImageFile(e.target.files?.[0] ?? null)
                  }
                  className="input-field"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="btn-primary disabled:opacity-50"
                >
                  {editSaving ? t.admin.saving : t.admin.saveChanges}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(editingProduct)}
                  disabled={deletingId === editingProduct.id}
                  className="rounded border border-red-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-red-600"
                >
                  {t.admin.deleteProduct}
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="text-xs font-bold uppercase tracking-wide text-brand-gray-500"
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
