"use client";

import { useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  IconBrands,
  IconCart,
  IconPhone,
  IconProtection,
  IconRepair,
  NavIconWrap,
} from "@/components/icons/NavIcons";

export default function HomeTrustSection() {
  const { t } = useLanguage();

  const reasons = useMemo(
    () => [
      {
        title: t.home.reason1Title,
        text: t.home.reason1Text,
        icon: <IconPhone className="h-4 w-4" />,
      },
      {
        title: t.home.reason2Title,
        text: t.home.reason2Text,
        icon: <IconRepair className="h-4 w-4" />,
      },
      {
        title: t.home.reason3Title,
        text: t.home.reason3Text,
        icon: <IconCart className="h-4 w-4" />,
      },
      {
        title: t.home.reason4Title,
        text: t.home.reason4Text,
        icon: <IconBrands className="h-4 w-4" />,
      },
    ],
    [t]
  );

  const stats = useMemo(
    () => [
      {
        value: "500+",
        label: t.home.statProducts,
        icon: <IconPhone className="h-4 w-4" />,
      },
      {
        value: "24h",
        label: t.home.statDiagnostics,
        icon: <IconRepair className="h-4 w-4" />,
      },
      {
        value: "100%",
        label: t.home.statTracked,
        icon: <IconProtection className="h-4 w-4" />,
      },
    ],
    [t]
  );

  return (
    <section className="border-y border-brand-gray-200 bg-white py-10 sm:py-12">
      <div className="container-app">
        <div className="mobilax-section-header mb-8 border-b-0 pb-0">
          <div>
            <p className="section-title">{t.home.heroBadge}</p>
            <h2 className="mt-1 text-lg font-bold uppercase tracking-tight text-brand-navy sm:text-xl">
              {t.home.whyChooseTitle}
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
          {reasons.map((reason, index) => (
            <article
              key={reason.title}
              className="flex gap-4 border border-brand-gray-200 bg-[#fafafa] p-5 sm:p-6"
            >
              <div className="flex flex-col items-center gap-2">
                <NavIconWrap>{reason.icon}</NavIconWrap>
                <span className="text-[10px] font-bold tabular-nums text-brand-gray-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wide text-brand-navy">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-gray-600">
                  {reason.text}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-px border border-brand-gray-200 bg-brand-gray-200 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 bg-white px-5 py-6 sm:px-6"
            >
              <NavIconWrap>{stat.icon}</NavIconWrap>
              <div>
                <p className="text-2xl font-black tabular-nums tracking-tight text-brand-navy">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-gray-500">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
