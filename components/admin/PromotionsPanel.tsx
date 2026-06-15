"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";
import {
  calculatePromoPrice,
  getEffectivePrice,
  isOnPromotion,
} from "@/lib/product-pricing";
import { Product } from "@/types";

type PromoTab = "active" | "add";

export default function PromotionsPanel() {
  const { t, formatPrice } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PromoTab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [percentById, setPercentById] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const promotedProducts = useMemo(
    () => products.filter((product) => isOnPromotion(product)),
    [products]
  );

  const availableProducts = useMemo(() => {
    let list = products.filter((product) => !isOnPromotion(product));
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
      );
    }
    return list;
  }, [products, searchQuery]);

  async function savePromotion(productId: string, percent: number | null) {
    setSavingId(productId);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}/promotion`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotion_percent: percent }),
      });

      const data: { product?: Product; error?: string } = await response.json();

      if (!response.ok || !data.product) {
        throw new Error(data.error ?? t.admin.promotionError);
      }

      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? data.product! : item))
      );
      setPercentById((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      setMessage(
        percent == null ? t.admin.promotionRemoved : t.admin.promotionSaved
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.promotionError);
    } finally {
      setSavingId(null);
    }
  }

  function handleApply(e: FormEvent, product: Product) {
    e.preventDefault();
    const raw = percentById[product.id] ?? "";
    const percent = parseInt(raw, 10);
    if (Number.isNaN(percent) || percent < 1 || percent > 100) {
      setError(t.admin.promotionInvalid);
      return;
    }
    void savePromotion(product.id, percent);
  }

  function renderProductRow(product: Product, mode: "active" | "add") {
    const percentValue = percentById[product.id] ?? "";
    const previewPercent =
      mode === "active"
        ? product.promotion_percent ?? 0
        : parseInt(percentValue, 10);
    const previewPrice =
      previewPercent > 0 && previewPercent <= 100
        ? calculatePromoPrice(product.price, previewPercent)
        : null;

    return (
      <li
        key={product.id}
        className="flex flex-col gap-4 border border-brand-gray-100 bg-white p-4 sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 rounded-lg bg-brand-gray-50">
            <SafeImage
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-1"
              sizes="56px"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-navy">
              {product.name}
            </p>
            <p className="text-xs text-brand-gray-500">
              {product.brand} · {formatPrice(product.price)}
            </p>
          </div>
        </div>

        {mode === "active" ? (
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <div className="text-right">
              <p className="text-xs text-brand-gray-400 line-through">
                {formatPrice(product.price)}
              </p>
              <p className="text-sm font-bold text-brand-electric">
                {formatPrice(getEffectivePrice(product))}
              </p>
              <p className="text-[10px] font-bold uppercase text-rose-500">
                -{product.promotion_percent}%
              </p>
            </div>
            <button
              type="button"
              disabled={savingId === product.id}
              onClick={() => void savePromotion(product.id, null)}
              className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
            >
              {t.admin.removePromotion}
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => handleApply(e, product)}
            className="flex flex-wrap items-end gap-3 sm:justify-end"
          >
            <div>
              <label
                htmlFor={`promo-${product.id}`}
                className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-brand-gray-500"
              >
                {t.admin.promotionPercent}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`promo-${product.id}`}
                  type="number"
                  min={1}
                  max={100}
                  value={percentValue}
                  onChange={(e) =>
                    setPercentById((prev) => ({
                      ...prev,
                      [product.id]: e.target.value,
                    }))
                  }
                  placeholder="20"
                  className="w-20 rounded-lg border border-brand-gray-300 px-3 py-2 text-sm"
                />
                <span className="text-sm font-semibold text-brand-gray-500">%</span>
              </div>
            </div>
            {previewPrice != null && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-brand-gray-400">
                  {t.admin.promotionSalePrice}
                </p>
                <p className="text-sm font-bold text-brand-electric">
                  {formatPrice(previewPrice)}
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={savingId === product.id}
              className="rounded-lg bg-gradient-to-r from-brand-electric to-brand-electric-dark px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
            >
              {savingId === product.id ? t.admin.saving : t.admin.setPromotion}
            </button>
          </form>
        )}
      </li>
    );
  }

  const tabs = [
    { id: "active" as const, label: t.admin.onPromotion },
    { id: "add" as const, label: t.admin.addPromotion },
  ];

  return (
    <div className="space-y-5">
      <Panel title={t.admin.promotionsTitle}>
        <p className="mb-4 text-sm text-brand-gray-600">{t.admin.promotionsDesc}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setMessage(null);
                setError(null);
              }}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-brand-electric to-brand-electric-dark text-white shadow-glow-electric"
                  : "border border-brand-gray-200 bg-white text-brand-gray-600 hover:border-brand-electric hover:text-brand-electric"
              }`}
            >
              {tab.label}
              {tab.id === "active" && promotedProducts.length > 0 && (
                <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                  {promotedProducts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {message && (
          <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-8 text-center text-sm text-brand-gray-500">
            {t.admin.loadingDashboard}
          </p>
        ) : activeTab === "active" ? (
          promotedProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-gray-500">
              {t.admin.noPromotionsYet}
            </p>
          ) : (
            <ul className="space-y-3">{promotedProducts.map((p) => renderProductRow(p, "active"))}</ul>
          )
        ) : (
          <>
            <div className="mb-4">
              <label
                htmlFor="promo-search"
                className="mb-2 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
              >
                {t.admin.filterSearch}
              </label>
              <input
                id="promo-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.admin.filterSearchPlaceholder}
                className="w-full max-w-md rounded-lg border border-brand-gray-300 px-4 py-2 text-sm"
              />
            </div>
            {availableProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-brand-gray-500">
                {t.admin.noProductsForPromotion}
              </p>
            ) : (
              <ul className="space-y-3">
                {availableProducts.map((p) => renderProductRow(p, "add"))}
              </ul>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
