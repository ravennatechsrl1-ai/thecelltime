"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { DEVICE_OPTIONS, REPAIR_ISSUES } from "@/lib/constants";
import { PhoneCatalog } from "@/lib/catalog-service";
import { RepairTypeOption } from "@/lib/repair-catalog-service";
import { RepairBookingResponse } from "@/types";

type WizardStep = 1 | 2 | 3;

function buildDeviceOptions(catalog: PhoneCatalog) {
  const brands = catalog.brands ?? [];
  const models = catalog.models ?? [];

  if (brands.length === 0) {
    return DEVICE_OPTIONS.map((device) => ({
      brandId: device.brand,
      brandLabel: device.brand,
      models: [...device.models],
    }));
  }

  return brands.map((brand) => ({
    brandId: brand.id,
    brandLabel: brand.label,
    models: models
      .filter((model) => model.brand_id === brand.id)
      .map((model) => model.label),
  }));
}

function buildRepairTypeOptions(types: RepairTypeOption[]) {
  if (types.length > 0) {
    return types
      .filter((type) => type.is_active)
      .map((type) => ({
        slug: type.slug,
        label: type.label,
        basePrice: type.base_price,
      }));
  }

  return REPAIR_ISSUES.map((issue) => ({
    slug: issue.id,
    label: issue.id,
    basePrice: issue.basePrice,
  }));
}

export default function RepairBookingWizard({
  initialCatalog,
  initialRepairTypes,
}: {
  initialCatalog: PhoneCatalog;
  initialRepairTypes: RepairTypeOption[];
}) {
  const { t, formatPrice } = useLanguage();
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const deviceOptions = useMemo(
    () => buildDeviceOptions(initialCatalog),
    [initialCatalog]
  );

  const selectedBrand = deviceOptions.find(
    (device) => device.brandId === selectedBrandId
  );

  const availableModels = selectedBrand?.models ?? [];

  function handleBrandChange(brandId: string) {
    setSelectedBrandId(brandId);
    setSelectedModel("");
  }

  const repairTypeOptions = useMemo(
    () => buildRepairTypeOptions(initialRepairTypes),
    [initialRepairTypes]
  );

  function handleIssueSelect(slug: string, basePrice: number) {
    setSelectedIssue(slug);
    setEstimatedPrice(basePrice);
  }

  function canProceedStep1(): boolean {
    return selectedBrandId.length > 0 && selectedModel.length > 0;
  }

  function canProceedStep2(): boolean {
    return selectedIssue.length > 0;
  }

  function canSubmitStep3(): boolean {
    return (
      customerName.trim().length >= 2 &&
      customerPhone.trim().length >= 8 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    );
  }

  async function handleSubmit() {
    if (!canSubmitStep3() || !selectedIssue || !selectedBrand) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceBrand: selectedBrand.brandLabel,
          deviceModel: selectedModel,
          issue: selectedIssue,
          estimatedPrice,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
        }),
      });

      const data: RepairBookingResponse & { error?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? t.repair.bookingError);
      }

      setTicketId(data.ticketId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorUnexpected);
    } finally {
      setLoading(false);
    }
  }

  if (ticketId) {
    return (
      <div className="container-app py-10 sm:py-16">
        <div className="mx-auto max-w-lg border border-brand-gray-200 p-6 sm:p-10">
          <p className="section-title mb-2">{t.repair.successBadge}</p>
          <h1 className="heading-lg">{t.repair.successTitle}</h1>
          <p className="mt-4 text-sm text-brand-gray-600">{t.repair.successDesc}</p>
          <div className="mt-8 border-2 border-brand-black bg-brand-gray-50 p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-500">
              {t.repair.ticketId}
            </p>
            <p className="mt-2 font-mono text-3xl font-black tracking-[0.3em] sm:text-4xl">
              {ticketId}
            </p>
          </div>
          <Link href={`/track?ticket=${ticketId}`} className="btn-primary mt-8">
            {t.repair.trackStatus}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-6 sm:py-10">
      <header className="mb-8">
        <p className="section-title mb-2">{t.repair.badge}</p>
        <h1 className="heading-lg">{t.repair.title}</h1>
        <p className="mt-2 text-sm text-brand-gray-600">{t.repair.desc}</p>
      </header>

      <div className="mb-8 flex gap-2">
        {([1, 2, 3] as WizardStep[]).map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 transition-colors ${
              s <= step ? "bg-brand-black" : "bg-brand-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="mx-auto max-w-xl">
        {step === 1 && (
          <section className="border border-brand-gray-200 p-5 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              {t.repair.step1Title}
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="brand"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
                >
                  {t.repair.brand}
                </label>
                <select
                  id="brand"
                  value={selectedBrandId}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="input-field"
                >
                  <option value="">{t.repair.selectBrand}</option>
                  {deviceOptions.map((device) => (
                    <option key={device.brandId} value={device.brandId}>
                      {device.brandLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="model"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
                >
                  {t.repair.model}
                </label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!selectedBrandId}
                  className="input-field disabled:opacity-50"
                >
                  <option value="">{t.repair.selectModel}</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                {selectedBrandId && availableModels.length === 0 ? (
                  <p className="mt-2 text-xs text-brand-gray-500">
                    {t.repair.noModelsForBrand}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1()}
              className="btn-primary mt-8 disabled:opacity-40"
            >
              {t.common.continue}
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="border border-brand-gray-200 p-5 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              {t.repair.step2Title}
            </h2>
            <p className="mt-2 text-sm text-brand-gray-600">
              {selectedBrand?.brandLabel} {selectedModel}
            </p>

            <ul className="mt-6 space-y-3">
              {repairTypeOptions.map((issue) => (
                <li key={issue.slug}>
                  <button
                    type="button"
                    onClick={() => handleIssueSelect(issue.slug, issue.basePrice)}
                    className={`flex min-h-[56px] w-full items-center justify-between border px-4 py-4 text-left transition-colors ${
                      selectedIssue === issue.slug
                        ? "border-brand-black bg-brand-black text-white"
                        : "border-brand-gray-300 hover:border-brand-black"
                    }`}
                  >
                    <span className="text-sm font-semibold">
                      {initialRepairTypes.length > 0
                        ? issue.label
                        : ((t.repair.issues as Record<string, string>)[issue.slug] ??
                          issue.label)}
                    </span>
                    <span className="text-sm font-bold">
                      {t.common.from} {formatPrice(issue.basePrice)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                {t.common.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2()}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                {t.common.continue}
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="border border-brand-gray-200 p-5 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              {t.repair.step3Title}
            </h2>
            <p className="mt-2 text-sm text-brand-gray-600">
              {t.repair.baseEstimate}:{" "}
              <strong>{formatPrice(estimatedPrice)}</strong>
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
                >
                  {t.repair.name}
                </label>
                <input
                  id="name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field"
                  placeholder={t.repair.namePlaceholder}
                  required
                  autoComplete="name"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
                >
                  {t.repair.phone}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input-field"
                  placeholder={t.repair.phonePlaceholder}
                  required
                  autoComplete="tel"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
                >
                  {t.repair.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="input-field"
                  placeholder={t.repair.emailPlaceholder}
                  required
                  autoComplete="email"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1"
                >
                  {t.common.back}
                </button>
                <button
                  type="submit"
                  disabled={!canSubmitStep3() || loading}
                  className="btn-primary flex-1 disabled:opacity-40"
                >
                  {loading ? t.repair.sending : t.repair.confirm}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
