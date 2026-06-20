"use client";

import Link from "next/link";
import { ReactNode, useRef, useState } from "react";
import { IconChevronDown } from "@/components/icons/NavIcons";

export interface NavDropdownItem {
  href: string;
  label: string;
}

export interface NavDropdownGroup {
  label: string;
  items: NavDropdownItem[];
  viewAll?: NavDropdownItem;
}

interface NavDropdownProps {
  label: string;
  icon: ReactNode;
  items?: NavDropdownItem[];
  groups?: NavDropdownGroup[];
  inverted?: boolean;
}

export default function NavDropdown({
  label,
  icon,
  items = [],
  groups = [],
  inverted = false,
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasGroups = groups.length > 0;

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
          inverted
            ? "text-gray-300 hover:text-white"
            : "text-brand-gray-700 hover:text-brand-black"
        }`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        <span>{label}</span>
        <IconChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full z-50 border border-brand-gray-200 bg-white py-2 shadow-lg ${
            hasGroups ? "min-w-[280px] max-h-[70vh] overflow-y-auto" : "min-w-[220px]"
          }`}
        >
          {hasGroups
            ? groups.map((group, groupIndex) => (
                <div
                  key={group.label}
                  className={
                    groupIndex > 0 ? "mt-1 border-t border-brand-gray-100 pt-1" : ""
                  }
                >
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className="block px-4 py-2 pl-6 text-sm text-brand-gray-700 transition-colors duration-200 hover:bg-brand-electric/5 hover:text-brand-electric"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {group.viewAll ? (
                    <Link
                      href={group.viewAll.href}
                      className="mt-1 block px-4 py-2 pl-6 text-xs font-bold uppercase tracking-wide text-brand-electric transition-colors hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      {group.viewAll.label}
                    </Link>
                  ) : null}
                </div>
              ))
            : items.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                      className="block px-4 py-2.5 text-sm text-brand-gray-700 transition-colors duration-200 hover:bg-brand-electric/5 hover:text-brand-electric"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
        </div>
      )}
    </div>
  );
}
