"use client";

import { FormEvent, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";

export interface CatalogOptionRow {
  id: string;
  label: string;
  meta?: string;
}

export function CatalogOptionManager({
  title,
  description,
  items,
  loading,
  addLabel,
  addPlaceholder,
  emptyMessage,
  onAdd,
  onEdit,
  onDelete,
  addExtra,
}: {
  title: string;
  description?: string;
  items: CatalogOptionRow[];
  loading: boolean;
  addLabel: string;
  addPlaceholder: string;
  emptyMessage: string;
  onAdd: (label: string) => Promise<void>;
  onEdit: (id: string, label: string) => Promise<void>;
  onDelete: (id: string, label: string) => Promise<void>;
  addExtra?: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onAdd(trimmed);
      setLabel("");
      setMessage(t.admin.optionAdded);
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
      await onEdit(id, trimmed);
      setEditingId(null);
      setMessage(t.admin.optionUpdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(t.admin.deleteOptionConfirm.replace("{name}", name))) {
      return;
    }
    setDeletingId(id);
    setError(null);
    setMessage(null);
    try {
      await onDelete(id, name);
      if (editingId === id) setEditingId(null);
      setMessage(t.admin.optionDeleted);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.uploadError);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Panel title={title}>
      {description ? (
        <p className="mb-4 text-sm text-brand-gray-600">{description}</p>
      ) : null}

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500">
            {addLabel}
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={addPlaceholder}
            className="input-field"
            required
          />
        </div>
        {addExtra}
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
        ) : items.length === 0 ? (
          <p className="text-sm text-brand-gray-500">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-gray-200 text-xs font-bold uppercase tracking-wide text-brand-gray-500">
                  <th className="px-3 py-2">{t.admin.optionName}</th>
                  <th className="px-3 py-2">{t.admin.optionDetails}</th>
                  <th className="px-3 py-2 text-right">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-brand-gray-100">
                    <td className="px-3 py-3">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="input-field py-2 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-brand-navy">
                          {item.label}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-brand-gray-500">
                      {item.meta ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {editingId === item.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleSaveEdit(item.id)}
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
                                setEditingId(item.id);
                                setEditLabel(item.label);
                              }}
                              className="text-xs font-bold uppercase text-brand-electric hover:underline"
                            >
                              {t.admin.editProduct}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(item.id, item.label)}
                              disabled={deletingId === item.id}
                              className="text-xs font-bold uppercase text-red-600 hover:underline disabled:opacity-50"
                            >
                              {deletingId === item.id
                                ? t.common.loading
                                : t.admin.deleteProduct}
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
