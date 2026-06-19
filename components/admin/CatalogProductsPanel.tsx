"use client";

import { useState } from "react";
import AccessoriesProductsPanel from "@/components/admin/AccessoriesProductsPanel";
import MobilesProductsPanel from "@/components/admin/MobilesProductsPanel";
import ProtectionProductsPanel from "@/components/admin/ProtectionProductsPanel";
import { useLanguage } from "@/components/LanguageProvider";

export type CatalogTab = "mobiles" | "protection" | "accessories";

export default function CatalogProductsPanel() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CatalogTab>("mobiles");

  const tabs: { id: CatalogTab; label: string }[] = [
    { id: "mobiles", label: t.admin.tabMobiles },
    { id: "protection", label: t.protection.navLabel },
    { id: "accessories", label: t.accessoriesCatalog.navLabel },
  ];

  return (
    <div className="space-y-5">
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

      {activeTab === "mobiles" && <MobilesProductsPanel />}
      {activeTab === "protection" && <ProtectionProductsPanel />}
      {activeTab === "accessories" && <AccessoriesProductsPanel />}
    </div>
  );
}
