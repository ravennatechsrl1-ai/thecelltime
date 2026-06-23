"use client";

import { FormEvent, useState } from "react";
import AdminModal from "@/components/admin/AdminModal";
import { Panel } from "@/components/admin/AdminShell";
import PasswordInput from "@/components/PasswordInput";
import { useLanguage } from "@/components/LanguageProvider";
import { DATA_RESET_CONFIRM_PHRASE } from "@/lib/admin-data-reset";
import { adminFetch } from "@/lib/admin-api";

interface DataResetPanelProps {
  onComplete?: () => void;
}

export default function DataResetPanel({ onComplete }: DataResetPanelProps) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function closeModal() {
    if (loading) return;
    setModalOpen(false);
    setConfirmPhrase("");
    setPassword("");
    setAcknowledged(false);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { response, data } = await adminFetch<{
        ok?: boolean;
        error?: string;
        result?: { products: number; orders: number };
      }>("/api/admin/data-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPhrase }),
      });

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? t.admin.dataResetError);
      }

      setSuccess(t.admin.dataResetSuccess);
      closeModal();
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.dataResetError);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    acknowledged &&
    password.trim().length > 0 &&
    confirmPhrase.trim() === DATA_RESET_CONFIRM_PHRASE &&
    !loading;

  return (
    <>
      <Panel title={t.admin.dataResetTitle} variant="default" className="border-red-200">
        <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 sm:p-5">
          <p className="text-sm font-semibold text-red-900">{t.admin.dataResetWarning}</p>
          <p className="mt-2 text-sm leading-relaxed text-red-800">{t.admin.dataResetDesc}</p>

          <ul className="mt-4 space-y-1 text-sm text-red-900">
            <li>• {t.admin.dataResetDeletesProducts}</li>
            <li>• {t.admin.dataResetDeletesOrders}</li>
            <li>• {t.admin.dataResetDeletesCustomers}</li>
            <li>• {t.admin.dataResetDeletesRepairs}</li>
            <li>• {t.admin.dataResetDeletesPromotions}</li>
            <li>• {t.admin.dataResetDeletesImages}</li>
          </ul>

          <p className="mt-4 text-sm font-medium text-emerald-900">
            {t.admin.dataResetKeepsCatalog}
          </p>

          {success && (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {success}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setModalOpen(true);
            }}
            className="mt-5 rounded-lg border border-red-300 bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700"
          >
            {t.admin.dataResetButton}
          </button>
        </div>
      </Panel>

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={t.admin.dataResetModalTitle}
        titleId="data-reset-modal-title"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-bold uppercase tracking-wide">{t.admin.dataResetModalWarning}</p>
            <p className="mt-2 leading-relaxed">{t.admin.dataResetModalBody}</p>
          </div>

          <label className="flex items-start gap-3 text-sm text-brand-gray-700">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-brand-gray-300"
            />
            <span>{t.admin.dataResetAcknowledge}</span>
          </label>

          <div>
            <label
              htmlFor="data-reset-phrase"
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
            >
              {t.admin.dataResetPhraseLabel}
            </label>
            <p className="mb-2 font-mono text-sm font-bold text-red-700">
              {DATA_RESET_CONFIRM_PHRASE}
            </p>
            <input
              id="data-reset-phrase"
              type="text"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              className="input-field font-mono uppercase"
              placeholder={DATA_RESET_CONFIRM_PHRASE}
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="data-reset-password"
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-brand-gray-500"
            >
              {t.admin.dataResetPasswordLabel}
            </label>
            <PasswordInput
              id="data-reset-password"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="btn-secondary sm:w-auto"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg border border-red-700 bg-red-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-800 disabled:opacity-40 sm:w-auto"
            >
              {loading ? t.admin.dataResetProcessing : t.admin.dataResetConfirm}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
