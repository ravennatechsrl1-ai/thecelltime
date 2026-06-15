import Image from "next/image";
import { PhoneBrandSlug } from "@/lib/phone-brands";

const defaultClass =
  "h-8 w-auto max-w-[112px] object-contain object-center sm:h-9 sm:max-w-[128px]";

export function PhoneBrandLogo({
  brand,
  className = defaultClass,
}: {
  brand: PhoneBrandSlug;
  className?: string;
}) {
  return (
    <Image
      src={`/images/brands/${brand}.svg`}
      alt=""
      width={128}
      height={36}
      className={className}
      aria-hidden
      unoptimized
    />
  );
}
