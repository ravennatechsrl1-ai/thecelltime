"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42" />
      <path d="M9.88 5.09A10.94 10.94 0 0112 5c6.5 0 10 7 10 7a18.81 18.81 0 01-4.11 5.28" />
      <path d="M6.12 6.12A18.73 18.73 0 002 12s3.5 7 10 7a10.8 10.8 0 004.12-.88" />
    </svg>
  );
}

export default function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  required = false,
  minLength,
  hint,
  inputClassName = "input-field pr-11",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
  inputClassName?: string;
}) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-brand-gray-400 transition-colors hover:text-brand-electric"
          aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
          aria-pressed={visible}
        >
          {visible ? (
            <IconEyeOff className="h-5 w-5" />
          ) : (
            <IconEye className="h-5 w-5" />
          )}
        </button>
      </div>
      {hint && (
        <p className="mt-1.5 text-xs text-brand-gray-400">{hint}</p>
      )}
    </div>
  );
}
