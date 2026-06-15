import { ReactNode } from "react";
import { Locale } from "@/lib/i18n/types";

interface FlagProps {
  className?: string;
}

function FlagFrame({
  className,
  children,
}: FlagProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 14"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <rect width="20" height="14" rx="1.5" fill="#e5e7eb" />
      {children}
    </svg>
  );
}

export function FlagIT({ className = "h-3.5 w-5" }: FlagProps) {
  return (
    <FlagFrame className={className}>
      <rect x="0" width="6.67" height="14" fill="#009246" />
      <rect x="6.67" width="6.66" height="14" fill="#ffffff" />
      <rect x="13.33" width="6.67" height="14" fill="#ce2b37" />
    </FlagFrame>
  );
}

export function FlagFR({ className = "h-3.5 w-5" }: FlagProps) {
  return (
    <FlagFrame className={className}>
      <rect x="0" width="6.67" height="14" fill="#0055a4" />
      <rect x="6.67" width="6.66" height="14" fill="#ffffff" />
      <rect x="13.33" width="6.67" height="14" fill="#ef4135" />
    </FlagFrame>
  );
}

export function FlagGB({ className = "h-3.5 w-5" }: FlagProps) {
  return (
    <FlagFrame className={className}>
      <rect width="20" height="14" fill="#012169" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#c8102e" strokeWidth="1.2" />
      <path d="M10 0v14M0 7h20" stroke="#ffffff" strokeWidth="4" />
      <path d="M10 0v14M0 7h20" stroke="#c8102e" strokeWidth="2.2" />
    </FlagFrame>
  );
}

export function FlagIcon({
  locale,
  className,
}: FlagProps & { locale: Locale }) {
  switch (locale) {
    case "it":
      return <FlagIT className={className} />;
    case "en":
      return <FlagGB className={className} />;
  }
}
