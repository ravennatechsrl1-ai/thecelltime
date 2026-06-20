"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { IconChevronDown } from "@/components/icons/NavIcons";
import { NavDropdownGroup, NavDropdownItem } from "@/components/NavDropdown";
import { useLanguage } from "@/components/LanguageProvider";

interface NavCategory {
  id: string;
  label: string;
  icon: ReactNode;
  items?: NavDropdownItem[];
  groups?: NavDropdownGroup[];
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: NavCategory[];
}

function AccordionToggle({ expanded }: { expanded: boolean }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gray-100 text-brand-gray-500">
      <span className="text-base font-light leading-none">
        {expanded ? "−" : "+"}
      </span>
    </span>
  );
}

export default function MobileDrawer({
  open,
  onClose,
  categories,
}: MobileDrawerProps) {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        className="fixed inset-y-0 left-0 z-50 flex w-[min(90vw,360px)] flex-col bg-white shadow-xl lg:hidden"
        aria-label={t.menu.title}
        role="dialog"
      >
        <div className="flex items-center justify-end border-b border-brand-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-brand-gray-500 transition-colors hover:bg-brand-gray-100 hover:text-brand-black"
            aria-label={t.menu.close}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-h-[52px] items-center border-b border-brand-gray-100 px-5 text-sm font-bold uppercase tracking-wide text-brand-black"
          >
            {t.nav.home}
          </Link>

          {categories.map((cat) => {
            const isExpanded = expandedId === cat.id;
            return (
              <div key={cat.id} className="border-b border-brand-gray-100">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : cat.id)
                  }
                  className="flex min-h-[52px] w-full items-center gap-3 px-5 text-left"
                  aria-expanded={isExpanded}
                >
                  <AccordionToggle expanded={isExpanded} />
                  <span className="flex-1 text-sm font-medium text-brand-gray-800">
                    {cat.label}
                  </span>
                  <IconChevronDown
                    className={`text-brand-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                {isExpanded && (
                  <div className="space-y-3 pb-3 pl-[4.25rem] pr-5">
                    {cat.groups && cat.groups.length > 0
                      ? cat.groups.map((group) => (
                          <div key={group.label}>
                            <p className="py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                              {group.label}
                            </p>
                            <ul className="space-y-1">
                              {group.items.map((item) => (
                                <li key={item.href + item.label}>
                                  <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="block py-1.5 pl-2 text-sm text-brand-gray-600 transition-colors hover:text-brand-black"
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                              {group.viewAll ? (
                                <li>
                                  <Link
                                    href={group.viewAll.href}
                                    onClick={onClose}
                                    className="block py-1.5 pl-2 text-xs font-bold uppercase tracking-wide text-brand-electric"
                                  >
                                    {group.viewAll.label}
                                  </Link>
                                </li>
                              ) : null}
                            </ul>
                          </div>
                        ))
                      : cat.items && (
                          <ul className="space-y-1">
                            {cat.items.map((item) => (
                              <li key={item.href + item.label}>
                                <Link
                                  href={item.href}
                                  onClick={onClose}
                                  className="block py-2 text-sm text-brand-gray-600 transition-colors hover:text-brand-black"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                  </div>
                )}
              </div>
            );
          })}

          <Link
            href="/shop"
            onClick={onClose}
            className="flex min-h-[52px] items-center border-b border-brand-gray-100 px-5 text-sm font-medium text-brand-gray-800"
          >
            {t.nav.shop}
          </Link>
          <Link
            href="/repair"
            onClick={onClose}
            className="flex min-h-[52px] items-center border-b border-brand-gray-100 px-5 text-sm font-medium text-brand-gray-800"
          >
            {t.nav.repair}
          </Link>
          <Link
            href="/track"
            onClick={onClose}
            className="flex min-h-[52px] items-center border-b border-brand-gray-100 px-5 text-sm font-medium text-brand-gray-800"
          >
            {t.nav.track}
          </Link>
        </div>
      </nav>
    </>
  );
}
