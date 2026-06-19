"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import { AddCatalogOption } from "@/components/admin/AddCatalogOption";
import { useLanguage } from "@/components/LanguageProvider";
import { RepairTypeOption } from "@/lib/repair-catalog-service";

function normalizeTypes(data: unknown): RepairTypeOption[] {
  if (!data || typeof data !== "object") return [];
  const record = data as { types?: RepairTypeOption[] };
  return Array.isArray(record.types) ? record.types : [];
}

export default function RepairTypesPanel() {
  const { t, formatPrice } = useLanguage();
  const [types, setTypes] = useState<RepairTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/catalog/repairs");
      const data: unknown = await response.json();
      setTypes(normalizeTypes(data));
    } catch {
      setTypes([]);
      setError(t.admin.repairTypesLoadError);
    } finally {
      setLoading(false);
    }
  }, [t.admin.repairTypesLoadError]);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  const activeCount = useMemo(
    () => types.filter((type) => type.is_active).length,
    [types]
  );

  async function addType(label: string) {
    const basePrice = Number(newPrice);
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      throw new Error(t.admin.repairTypesPriceRequired);
    }

    const response = await fetch("/api/admin/catalog/repairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, basePrice }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? t.admin.repairTypesSaveError);
    }
    setNewPrice("");
    await loadTypes();
  }

  async function updateType(
    id: string,
    patch: Partial<Pick<RepairTypeOption, "label" | "base_price" | "is_active">>
  ) {
    setSavingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/catalog/repairs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: patch.label,
          basePrice: patch.base_price,
          isActive: patch.is_active,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? t.admin.repairTypesSaveError);
      }
      await loadTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.repairTypesSaveError);
    } finally {
      setSavingId(null);
    }
  }

  async function deleteType(id: string) {
    if (!window.confirm(t.admin.repairTypesDeleteConfirm)) return;

    setSavingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/catalog/repairs/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? t.admin.repairTypesSaveError);
      }
      await loadTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.repairTypesSaveError);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Panel title={t.admin.repairTypesTitle}>
      <p className="mb-4 text-sm text-brand-gray-600">{t.admin.repairTypesDesc}</p>

      {error ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
      ) : (
        <>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-gray-500">
            {t.admin.repairTypesActiveCount.replace("{count}", String(activeCount))}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-brand-gray-200 bg-brand-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                    {t.admin.repairTypesColLabel}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                    {t.admin.repairTypesColPrice}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                    {t.admin.repairTypesColActive}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                    {t.admin.colActions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {types.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-brand-gray-500"
                    >
                      {t.admin.repairTypesEmpty}
                    </td>
                  </tr>
                ) : (
                  types.map((type) => (
                    <RepairTypeRow
                      key={type.id}
                      type={type}
                      disabled={savingId === type.id}
                      formatPrice={formatPrice}
                      labels={{
                        save: t.admin.saveChanges,
                        delete: t.admin.deleteProduct,
                        active: t.admin.repairTypesActive,
                        inactive: t.admin.repairTypesInactive,
                      }}
                      onSave={(patch) => updateType(type.id, patch)}
                      onDelete={() => deleteType(type.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t border-brand-gray-200 pt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-gray-500">
              {t.admin.repairTypesAddTitle}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500">
                  {t.admin.repairTypesColPrice}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="89"
                  className="input-field"
                />
              </div>
            </div>
            <AddCatalogOption
              label={t.admin.repairTypesColLabel}
              placeholder={t.admin.repairTypesAddPlaceholder}
              disabled={!newPrice.trim()}
              onAdd={addType}
            />
          </div>
        </>
      )}
    </Panel>
  );
}

function RepairTypeRow({
  type,
  disabled,
  formatPrice,
  labels,
  onSave,
  onDelete,
}: {
  type: RepairTypeOption;
  disabled: boolean;
  formatPrice: (amount: number) => string;
  labels: {
    save: string;
    delete: string;
    active: string;
    inactive: string;
  };
  onSave: (
    patch: Partial<Pick<RepairTypeOption, "label" | "base_price" | "is_active">>
  ) => Promise<void>;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState(type.label);
  const [price, setPrice] = useState(String(type.base_price));
  const [active, setActive] = useState(type.is_active);

  useEffect(() => {
    setLabel(type.label);
    setPrice(String(type.base_price));
    setActive(type.is_active);
  }, [type]);

  const dirty =
    label.trim() !== type.label ||
    Number(price) !== type.base_price ||
    active !== type.is_active;

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    await onSave({
      label: label.trim(),
      base_price: Number(price),
      is_active: active,
    });
  }

  return (
    <tr className="border-b border-brand-gray-100 last:border-0">
      <td className="px-4 py-3">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={disabled}
          className="input-field py-2 text-sm"
        />
        <p className="mt-1 font-mono text-[10px] uppercase text-brand-gray-400">
          {type.slug}
        </p>
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={disabled}
          className="input-field py-2 text-sm"
        />
        <p className="mt-1 text-xs text-brand-gray-500">{formatPrice(Number(price) || 0)}</p>
      </td>
      <td className="px-4 py-3">
        <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={disabled}
            className="h-4 w-4"
          />
          {active ? labels.active : labels.inactive}
        </label>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => void handleSave(e)}
            disabled={disabled || !dirty || !label.trim()}
            className="border border-brand-electric px-3 py-2 text-xs font-bold uppercase text-brand-electric disabled:opacity-40"
          >
            {labels.save}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="border border-red-200 px-3 py-2 text-xs font-bold uppercase text-red-600 disabled:opacity-40"
          >
            {labels.delete}
          </button>
        </div>
      </td>
    </tr>
  );
}
