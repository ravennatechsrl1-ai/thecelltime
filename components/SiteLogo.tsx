import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/images/brand/thecelltime.webp";

interface SiteLogoProps {
  className?: string;
  priority?: boolean;
  linked?: boolean;
}

export default function SiteLogo({
  className = "h-12 w-auto sm:h-14 md:h-16",
  priority = false,
  linked = true,
}: SiteLogoProps) {
  const logo = (
    <Image
      src={LOGO_SRC}
      alt="The Cell Time"
      width={300}
      height={72}
      className={className}
      priority={priority}
    />
  );

  if (!linked) return logo;

  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {logo}
    </Link>
  );
}
