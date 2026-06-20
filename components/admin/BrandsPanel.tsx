"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import {
  DeviceSeriesSection,
  DeviceModelsSection,
} from "@/components/admin/catalog/DeviceCatalogSections";
import {
  PhoneConditionsSection,
  PhoneColorsSection,
  PhoneModelsSection,
  PhoneStorageSection,
} from "@/components/admin/catalog/PhoneCatalogSections";
import { useLanguage } from "@/components/LanguageProvider";
import {
  DeviceBrandOption,
  normalizeDeviceCatalog,
  normalizePhoneCatalog,
  PhoneBrandOption,
} from "@/lib/catalog-service";
import {
  PROTECTION_DEVICE_TYPES,
  ProtectionDeviceType,
} from "@/lib/protection-catalog";

type BrandsTab = "mobiles" | "protection" | "accessories";

interface BrandRow {
  id: string;
  label: string;
  slug: string;
}

function EditBrandModal({
  brand,
  onClose,
  onSave,
  saving,
}: {
  brand: BrandRow;
  onClose: () => void;
  onSave: (label: string) => Promise<void>;
  saving: boolean;
}) {
  const { t } = useLanguage();
  const [label, setLabel] = useState(brand.label);

  useEffect(() => {
    setLabel(brand.label);
  }, [brand]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    await onSave(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-brand-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-brand-gray-200 bg-white p-5 shadow-xl"
      >
        <h3
          id="edit-brand-title"
          className="text-sm font-bold uppercase tracking-wide text-brand-navy"
        >
          {t.admin.editBrandTitle}
        </h3>
        <p className="mt-1 font-mono text-xs text-brand-gray-400">{brand.slug}</p>

        <div className="mt-4">
          <label
            htmlFor="edit-brand-label"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
          >
            {t.admin.brandName}
          </label>
          <input
            id="edit-brand-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="input-field"
            required
            autoFocus
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || !label.trim()}
            className="btn-primary min-h-[44px] flex-1 disabled:opacity-50"
          >
            {saving ? t.admin.uploading : t.admin.saveChanges}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary min-h-[44px] flex-1"
          >
            {t.common.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}

function BrandsTable({
  brands,
  loading,
  deletingId,
  onEdit,
  onDelete,
}: {
  brands: BrandRow[];
  loading: boolean;
  deletingId: string | null;
  onEdit: (brand: BrandRow) => void;
  onDelete: (brand: BrandRow) => void;
}) {
  const { t } = useLanguage();

  if (loading) {
    return <p className="text-sm text-brand-gray-500">{t.common.loading}</p>;
  }

  if (brands.length === 0) {
    return <p className="text-sm text-brand-gray-500">{t.admin.brandsEmpty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px] text-left text-sm">
        <thead>
          <tr className="border-b border-brand-gray-200 text-xs font-bold uppercase tracking-wide text-brand-gray-500">
            <th className="px-3 py-2">{t.admin.brand}</th>
            <th className="px-3 py-2">Slug</th>
            <th className="px-3 py-2 text-right">{t.admin.colActions}</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id} className="border-b border-brand-gray-100">
              <td className="px-3 py-3 font-medium text-brand-navy">
                {brand.label}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-brand-gray-500">
                {brand.slug}
              </td>
              <td className="px-3 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit(brand)}
                    className="text-xs font-bold uppercase tracking-wide text-brand-electric hover:underline"
                  >
                    {t.admin.editProduct}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(brand)}
                    disabled={deletingId === brand.id}
                    className="text-xs font-bold uppercase tracking-wide text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === brand.id
                      ? t.common.loading
                      : t.admin.deleteProduct}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhoneBrandsSection() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<PhoneBrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<BrandRow | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/catalog/phones");
      const data = await response.json();
      setBrands(normalizePhoneCatalog(data).brands);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

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
        body: JSON.stringify({ kind: "brand", label: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      setLabel("");
      setMessage(t.admin.brandAdded);
      await loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave(newLabel: string) {
    if (!editingBrand) return;
    setEditSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/catalog/phones/brands/${editingBrand.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: newLabel }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      setEditingBrand(null);
      setMessage(t.admin.brandUpdated);
      await loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(brand: BrandRow) {
    if (!window.confirm(t.admin.deleteBrandConfirm.replace("{name}", brand.label))) {
      return;
    }

    setDeletingId(brand.id);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/catalog/phones/brands/${brand.id}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      if (editingBrand?.id === brand.id) setEditingBrand(null);
      setMessage(t.admin.brandDeleted);
      await loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setDeletingId(null);
    }
  }

  const rows: BrandRow[] = brands.map((b) => ({
    id: b.id,
    label: b.label,
    slug: b.slug,
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-brand-gray-600">{t.admin.brandsMobilesDesc}</p>

      <Panel title={t.admin.manageBrands}>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="phone-brand-name"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
            >
              {t.admin.brandName}
            </label>
            <input
              id="phone-brand-name"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Samsung, Apple…"
              className="input-field"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving || !label.trim()}
            className="btn-primary min-h-[48px] px-6 disabled:opacity-50"
          >
            {saving ? t.admin.uploading : t.admin.addBrand}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 border-t border-brand-gray-100 pt-5">
          <BrandsTable
            brands={rows}
            loading={loading}
            deletingId={deletingId}
            onEdit={setEditingBrand}
            onDelete={handleDelete}
          />
        </div>
      </Panel>

      {editingBrand ? (
        <EditBrandModal
          brand={editingBrand}
          onClose={() => setEditingBrand(null)}
          onSave={handleEditSave}
          saving={editSaving}
        />
      ) : null}
    </div>
  );
}

function DeviceBrandsSection({ context }: { context: "protection" | "accessories" }) {
  const { t } = useLanguage();
  const [deviceType, setDeviceType] = useState<ProtectionDeviceType>("mobiles");
  const [brands, setBrands] = useState<DeviceBrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<BrandRow | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deviceLabels: Record<ProtectionDeviceType, string> = {
    mobiles: t.protection.deviceMobiles,
    tablets: t.protection.deviceTablets,
    computers: t.protection.deviceComputers,
    watch: t.protection.deviceWatch,
  };

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/catalog/devices?deviceType=${deviceType}`
      );
      const data = await response.json();
      setBrands(normalizeDeviceCatalog(data).brands);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [deviceType]);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  useEffect(() => {
    setEditingBrand(null);
  }, [deviceType]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/catalog/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "brand", deviceType, label: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      setLabel("");
      setMessage(t.admin.brandAdded);
      await loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave(newLabel: string) {
    if (!editingBrand) return;
    setEditSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/catalog/devices/brands/${editingBrand.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: newLabel }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      setEditingBrand(null);
      setMessage(t.admin.brandUpdated);
      await loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(brand: BrandRow) {
    if (!window.confirm(t.admin.deleteBrandConfirm.replace("{name}", brand.label))) {
      return;
    }

    setDeletingId(brand.id);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/catalog/devices/brands/${brand.id}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      if (editingBrand?.id === brand.id) setEditingBrand(null);
      setMessage(t.admin.brandDeleted);
      await loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setDeletingId(null);
    }
  }

  const contextDesc =
    context === "protection"
      ? t.admin.brandsProtectionDesc
      : t.admin.brandsAccessoriesDesc;

  const rows: BrandRow[] = brands.map((b) => ({
    id: b.id,
    label: b.label,
    slug: b.slug,
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-brand-gray-600">{contextDesc}</p>

      <div className="flex flex-wrap gap-2">
        {PROTECTION_DEVICE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setDeviceType(type)}
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

      <Panel title={`${t.admin.manageBrands} — ${deviceLabels[deviceType]}`}>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor={`${context}-brand-name`}
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
            >
              {t.admin.brandName}
            </label>
            <input
              id={`${context}-brand-name`}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Apple, Samsung…"
              className="input-field"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving || !label.trim()}
            className="btn-primary min-h-[48px] px-6 disabled:opacity-50"
          >
            {saving ? t.admin.uploading : t.admin.addBrand}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 border-t border-brand-gray-100 pt-5">
          <BrandsTable
            brands={rows}
            loading={loading}
            deletingId={deletingId}
            onEdit={setEditingBrand}
            onDelete={handleDelete}
          />
        </div>
      </Panel>

      {editingBrand ? (
        <EditBrandModal
          brand={editingBrand}
          onClose={() => setEditingBrand(null)}
          onSave={handleEditSave}
          saving={editSaving}
        />
      ) : null}
    </div>
  );
}

type MobilesSection = "brands" | "conditions" | "storage" | "colors" | "models";
type DeviceSection = "brands" | "series" | "models";

function SectionPills<T extends string>({
  sections,
  active,
  onChange,
}: {
  sections: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onChange(section.id)}
          className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
            active === section.id
              ? "bg-brand-navy text-white"
              : "border border-brand-gray-200 bg-white text-brand-gray-600 hover:border-brand-navy hover:text-brand-navy"
          }`}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}

function MobilesCatalogSection() {
  const { t } = useLanguage();
  const [section, setSection] = useState<MobilesSection>("brands");

  const sections: { id: MobilesSection; label: string }[] = [
    { id: "brands", label: t.admin.brand },
    { id: "conditions", label: t.admin.condition },
    { id: "storage", label: t.admin.phoneStorage },
    { id: "colors", label: t.admin.phoneColor },
    { id: "models", label: t.admin.phoneModel },
  ];

  return (
    <div className="space-y-5">
      <SectionPills sections={sections} active={section} onChange={setSection} />
      {section === "brands" && <PhoneBrandsSection />}
      {section === "conditions" && <PhoneConditionsSection />}
      {section === "storage" && <PhoneStorageSection />}
      {section === "colors" && <PhoneColorsSection />}
      {section === "models" && <PhoneModelsSection />}
    </div>
  );
}

function DeviceCatalogSection({ context }: { context: "protection" | "accessories" }) {
  const { t } = useLanguage();
  const [section, setSection] = useState<DeviceSection>("brands");

  const sections: { id: DeviceSection; label: string }[] = [
    { id: "brands", label: t.admin.brand },
    { id: "series", label: t.admin.seriesLabel },
    { id: "models", label: t.admin.phoneModel },
  ];

  return (
    <div className="space-y-5">
      <SectionPills sections={sections} active={section} onChange={setSection} />
      {section === "brands" && <DeviceBrandsSection context={context} />}
      {section === "series" && <DeviceSeriesSection />}
      {section === "models" && <DeviceModelsSection />}
    </div>
  );
}

export default function CatalogPanel() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<BrandsTab>("mobiles");

  const tabs: { id: BrandsTab; label: string }[] = [
    { id: "mobiles", label: t.admin.tabMobiles },
    { id: "protection", label: t.protection.navLabel },
    { id: "accessories", label: t.accessoriesCatalog.navLabel },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-brand-gray-600">{t.admin.catalogPanelDesc}</p>

      <div className="flex flex-wrap gap-2 rounded-xl border border-white/80 bg-white/90 p-2 shadow-card backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[44px] flex-1 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-all duration-200 sm:flex-none sm:px-6 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-brand-electric to-brand-electric-dark text-white shadow-glow-electric"
                : "text-brand-gray-600 hover:bg-brand-electric/5 hover:text-brand-electric"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "mobiles" && <MobilesCatalogSection />}
      {activeTab === "protection" && (
        <DeviceCatalogSection context="protection" />
      )}
      {activeTab === "accessories" && (
        <DeviceCatalogSection context="accessories" />
      )}
    </div>
  );
}
