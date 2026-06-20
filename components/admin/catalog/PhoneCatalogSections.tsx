"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CatalogOptionManager } from "@/components/admin/catalog/CatalogOptionManager";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";
import {
  normalizePhoneCatalog,
  PhoneBrandOption,
  PhoneColorOption,
  PhoneConditionOption,
  PhoneModelOption,
  PhoneStorageOption,
} from "@/lib/catalog-service";

function PhoneConditionsSection() {
  const { t } = useLanguage();
  const [conditions, setConditions] = useState<PhoneConditionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopGroup, setShopGroup] = useState<"new" | "used">("used");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/catalog/phones");
      const data = await response.json();
      setConditions(normalizePhoneCatalog(data).conditions);
    } catch {
      setConditions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = conditions.map((c) => ({
    id: c.id,
    label: c.label,
    meta: c.shop_group === "used" ? t.admin.conditionShopUsed : t.admin.conditionShopNew,
  }));

  return (
    <CatalogOptionManager
      title={t.admin.manageConditions}
      description={t.admin.conditionsDesc}
      items={rows}
      loading={loading}
      addLabel={t.admin.addCondition}
      addPlaceholder="Grade B Used…"
      emptyMessage={t.admin.conditionsEmpty}
      addExtra={
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500">
            {t.admin.conditionShopGroup}
          </label>
          <select
            value={shopGroup}
            onChange={(e) => setShopGroup(e.target.value as "new" | "used")}
            className="input-field min-w-[140px]"
          >
            <option value="new">{t.admin.conditionShopNew}</option>
            <option value="used">{t.admin.conditionShopUsed}</option>
          </select>
        </div>
      }
      onAdd={async (label) => {
        const response = await fetch("/api/admin/catalog/phones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "condition", label, shopGroup }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await load();
      }}
      onEdit={async (id, label) => {
        const response = await fetch(`/api/admin/catalog/phones/conditions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await load();
      }}
      onDelete={async (id) => {
        const response = await fetch(`/api/admin/catalog/phones/conditions/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await load();
      }}
    />
  );
}

function PhoneStorageSection() {
  const { t } = useLanguage();
  const [storage, setStorage] = useState<PhoneStorageOption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/catalog/phones");
      const data = await response.json();
      setStorage(normalizePhoneCatalog(data).storage);
    } catch {
      setStorage([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = storage.map((s) => ({ id: s.id, label: s.label }));

  return (
    <CatalogOptionManager
      title={t.admin.manageStorage}
      description={t.admin.storageDesc}
      items={rows}
      loading={loading}
      addLabel={t.admin.addStorage}
      addPlaceholder="256GB, 2TB…"
      emptyMessage={t.admin.storageEmpty}
      onAdd={async (label) => {
        const response = await fetch("/api/admin/catalog/phones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "storage", label }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await load();
      }}
      onEdit={async (id, label) => {
        const response = await fetch(`/api/admin/catalog/phones/storage/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await load();
      }}
      onDelete={async (id) => {
        const response = await fetch(`/api/admin/catalog/phones/storage/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await load();
      }}
    />
  );
}

function PhoneModelsSection() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<PhoneBrandOption[]>([]);
  const [models, setModels] = useState<PhoneModelOption[]>([]);
  const [brandId, setBrandId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/catalog/phones");
      const data = await response.json();
      const catalog = normalizePhoneCatalog(data);
      setBrands(catalog.brands);
      setModels(catalog.models);
    } catch {
      setBrands([]);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (brands[0] && !brandId) setBrandId(brands[0].id);
  }, [brands, brandId]);

  const modelsForBrand = useMemo(
    () => models.filter((m) => m.brand_id === brandId),
    [models, brandId]
  );

  const brandLabel = brands.find((b) => b.id === brandId)?.label ?? "";

  const rows = modelsForBrand.map((m) => ({
    id: m.id,
    label: m.label,
    meta: m.slug,
  }));

  return (
    <div className="space-y-4">
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
        title={`${t.admin.manageModels} — ${brandLabel || t.admin.brand}`}
        description={t.admin.modelsMobilesDesc}
        items={rows}
        loading={loading}
        addLabel={t.admin.addModel}
        addPlaceholder="iPhone 17 Pro Max…"
        emptyMessage={
          brands.length === 0 ? t.admin.brandsEmpty : t.admin.modelsEmpty
        }
        onAdd={async (label) => {
          if (!brandId) throw new Error(t.admin.brandsEmpty);
          const response = await fetch("/api/admin/catalog/phones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "model", brandId, label }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          await load();
        }}
        onEdit={async (id, label) => {
          const response = await fetch(`/api/admin/catalog/phones/models/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          await load();
        }}
        onDelete={async (id) => {
          const response = await fetch(`/api/admin/catalog/phones/models/${id}`, {
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

function PhoneColorsSection() {
  const { t } = useLanguage();
  const [colors, setColors] = useState<PhoneColorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [hexColor, setHexColor] = useState("#64748b");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editHex, setEditHex] = useState("#64748b");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/catalog/phones");
      const data = await response.json();
      setColors(normalizePhoneCatalog(data).colors);
    } catch {
      setColors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/catalog/phones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "color", label: trimmed, hexColor }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setLabel("");
      setHexColor("#64748b");
      setMessage(t.admin.optionAdded);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(id: string) {
    const trimmed = editLabel.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/catalog/phones/colors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: trimmed, hexColor: editHex }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setEditingId(null);
      setMessage(t.admin.optionUpdated);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(t.admin.deleteOptionConfirm.replace("{name}", name))) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/catalog/phones/colors/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(t.admin.optionDeleted);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel title={t.admin.manageColors}>
      <p className="mb-4 text-sm text-brand-gray-600">{t.admin.colorsDesc}</p>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[160px] flex-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500">
            {t.admin.addColor}
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Black, Blue Titanium…"
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500">
            {t.admin.colorSwatch}
          </label>
          <input
            type="color"
            value={hexColor}
            onChange={(e) => setHexColor(e.target.value)}
            className="h-12 w-14 cursor-pointer rounded border border-brand-gray-300 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !label.trim()}
          className="btn-primary min-h-[48px] px-6 disabled:opacity-50"
        >
          {saving && !editingId ? t.admin.uploading : t.admin.addOption}
        </button>
      </form>

      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 border-t border-brand-gray-100 pt-5">
        {loading ? (
          <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
        ) : colors.length === 0 ? (
          <p className="text-sm text-brand-gray-500">{t.admin.colorsEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-gray-200 text-xs font-bold uppercase tracking-wide text-brand-gray-500">
                  <th className="px-3 py-2">{t.admin.optionName}</th>
                  <th className="px-3 py-2">{t.admin.colorSwatch}</th>
                  <th className="px-3 py-2 text-right">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {colors.map((color) => (
                  <tr key={color.id} className="border-b border-brand-gray-100">
                    <td className="px-3 py-3">
                      {editingId === color.id ? (
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="input-field py-2 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-brand-navy">{color.label}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {editingId === color.id ? (
                        <input
                          type="color"
                          value={editHex}
                          onChange={(e) => setEditHex(e.target.value)}
                          className="h-10 w-12 cursor-pointer rounded border border-brand-gray-300"
                        />
                      ) : (
                        <span
                          className="inline-block h-8 w-8 rounded-full border border-brand-gray-200"
                          style={{ backgroundColor: color.hex_color }}
                          title={color.hex_color}
                        />
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {editingId === color.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleSaveEdit(color.id)}
                              disabled={saving}
                              className="text-xs font-bold uppercase text-brand-electric hover:underline disabled:opacity-50"
                            >
                              {t.admin.saveChanges}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-xs font-bold uppercase text-brand-gray-500 hover:underline"
                            >
                              {t.common.cancel}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(color.id);
                                setEditLabel(color.label);
                                setEditHex(color.hex_color);
                              }}
                              className="text-xs font-bold uppercase text-brand-electric hover:underline"
                            >
                              {t.admin.editProduct}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(color.id, color.label)}
                              disabled={saving}
                              className="text-xs font-bold uppercase text-red-600 hover:underline disabled:opacity-50"
                            >
                              {t.admin.deleteProduct}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Panel>
  );
}

export { PhoneConditionsSection, PhoneStorageSection, PhoneModelsSection, PhoneColorsSection };
