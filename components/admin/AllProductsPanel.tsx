"use client";

import { useCallback, useEffect, useState } from "react";
import AdminProductInventory from "@/components/admin/AdminProductInventory";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";
import { Product } from "@/types";

export default function AllProductsPanel() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  const frozenCount = products.filter((p) => p.frozen).length;

  return (
    <Panel title={t.admin.allProductsTitle}>
      <p className="mb-4 text-sm text-brand-gray-600">{t.admin.allProductsDesc}</p>
      <p className="mb-4 text-xs text-brand-gray-500">
        {t.admin.allProductsSummary
          .replace("{total}", String(products.length))
          .replace("{frozen}", String(frozenCount))}
      </p>
      <AdminProductInventory
        products={products}
        loading={loading}
        onReload={loadProducts}
        showCategory
      />
    </Panel>
  );
}
