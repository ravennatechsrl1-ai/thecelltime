"use client";

import Image, { ImageProps } from "next/image";
import { ReactNode, useState } from "react";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%239ca3af'%3E%F0%9F%93%B1%3C/text%3E%3C/svg%3E";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallback?: ReactNode;
}

function isLocalAsset(src: ImageProps["src"]): boolean {
  return typeof src === "string" && src.startsWith("/");
}

export default function SafeImage({
  src,
  alt,
  fallback,
  className,
  fill,
  ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = typeof src === "string" && src.trim() ? src : PLACEHOLDER;

  if (failed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={`flex items-center justify-center bg-brand-gray-100 text-4xl text-brand-gray-300 ${fill ? "absolute inset-0" : ""} ${className ?? ""}`}
        role="img"
        aria-label={alt}
      >
        📱
      </div>
    );
  }

  return (
    <Image
      {...props}
      fill={fill}
      src={imageSrc}
      alt={alt}
      className={className}
      unoptimized={props.unoptimized ?? isLocalAsset(imageSrc)}
      onError={() => setFailed(true)}
    />
  );
}
