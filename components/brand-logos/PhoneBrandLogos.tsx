import Image from "next/image";
import { hasBrandLogo } from "@/lib/phone-brands";

const defaultClass =
  "h-8 w-auto max-w-[112px] object-contain object-center sm:h-9 sm:max-w-[128px]";

export function PhoneBrandLogo({
  brand,
  label,
  className = defaultClass,
}: {
  brand: string;
  label?: string;
  className?: string;
}) {
  if (!hasBrandLogo(brand)) {
    return (
      <span
        className={`text-xs font-bold uppercase tracking-wide text-brand-navy ${className}`}
      >
        {label ?? brand}
      </span>
    );
  }

  return (
    <Image
      src={`/images/brands/${brand}.svg`}
      alt={label ?? brand}
      width={128}
      height={36}
      className={className}
      unoptimized
    />
  );
}
