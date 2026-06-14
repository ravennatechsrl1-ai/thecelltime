"use client";

import { ReactNode } from "react";

function ToolbarIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-gray-200 bg-white text-brand-gray-500">
      {children}
    </span>
  );
}

export default function MobilaxCatalogToolbar({
  filterAllLabel,
}: {
  filterAllLabel: string;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="flex h-8 items-center rounded-full border border-brand-gray-300 bg-white px-3 text-[10px] font-bold uppercase tracking-wide text-brand-gray-700">
        {filterAllLabel}
      </span>
      <ToolbarIcon>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" rx="0.5" />
          <rect x="9" y="1" width="6" height="6" rx="0.5" />
          <rect x="1" y="9" width="6" height="6" rx="0.5" />
          <rect x="9" y="9" width="6" height="6" rx="0.5" />
        </svg>
      </ToolbarIcon>
      <ToolbarIcon>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
        </svg>
      </ToolbarIcon>
      <ToolbarIcon>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M3 5l5 6 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarIcon>
    </div>
  );
}
