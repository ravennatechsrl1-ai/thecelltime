"use client";

import DataResetPanel from "@/components/admin/DataResetPanel";
import { useLanguage } from "@/components/LanguageProvider";

export default function SettingsPanel() {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray-400">
          {t.admin.settingsBadge}
        </p>
        <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-brand-navy">
          {t.admin.settingsTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-gray-600">
          {t.admin.settingsDesc}
        </p>
      </div>

      <DataResetPanel onComplete={() => window.location.reload()} />
    </div>
  );
}
