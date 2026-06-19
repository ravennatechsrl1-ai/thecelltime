"use client";

import { KeyboardEvent, useState } from "react";

export function AddCatalogOption({
  label,
  placeholder,
  onAdd,
  disabled,
}: {
  label: string;
  placeholder: string;
  onAdd: (value: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = value.trim();
    if (!trimmed || disabled || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onAdd(trimmed);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add option.");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      void handleAdd();
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2">
      <div className="min-w-[160px] flex-1">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-brand-gray-400">
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field py-2 text-sm"
          disabled={disabled || saving}
        />
      </div>
      <button
        type="button"
        onClick={() => void handleAdd()}
        disabled={disabled || saving || !value.trim()}
        className="rounded border border-brand-electric bg-brand-electric/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-brand-electric disabled:opacity-40"
      >
        {saving ? "…" : "+"}
      </button>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
