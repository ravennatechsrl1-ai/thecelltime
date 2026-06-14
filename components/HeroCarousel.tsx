"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import SafeImage from "@/components/SafeImage";
import {
  IconChevronLeft,
  IconChevronRight,
} from "@/components/icons/NavIcons";
import { useLanguage } from "@/components/LanguageProvider";
const HERO_IMAGES = {
  phones: "/images/hero/slide-1-phones.webp",
  accessories: "/images/hero/slide-2-accessories.webp",
  promotions: "/images/hero/slide-3-promotions.webp",
} as const;

interface CarouselSlide {
  id: number;
  brand: string;
  label: string;
  titleBefore: string;
  titleAccent: string;
  description: string;
  cta: string;
  href: string;
  image: string;
  imageBg: string;
  badge: string;
  stat: string;
  /** Tailwind width/height for transparent product PNG/WebP */
  imageFrame: string;
}

export default function HeroCarousel() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides = useMemo<CarouselSlide[]>(
    () => [
      {
        id: 0,
        brand: t.home.carousel1Brand,
        label: t.home.carousel1Label,
        titleBefore: t.home.carousel1TitleBefore,
        titleAccent: t.home.carousel1TitleAccent,
        description: t.home.carousel1Desc,
        cta: t.home.carousel1Cta,
        href: "/shop/phones/new",
        image: HERO_IMAGES.phones,
        imageBg: "from-[#dbeafe] via-[#eff6ff] to-[#e0e7ff]",
        badge: "5G Ready",
        stat: "12+",
        imageFrame: "h-[96%] w-[92%]",
      },
      {
        id: 1,
        brand: t.home.carousel2Brand,
        label: t.home.carousel2Label,
        titleBefore: t.home.carousel2TitleBefore,
        titleAccent: t.home.carousel2TitleAccent,
        description: t.home.carousel2Desc,
        cta: t.home.carousel2Cta,
        href: "/shop/accessories",
        image: HERO_IMAGES.accessories,
        imageBg: "from-[#e0f2fe] via-[#f0f9ff] to-[#dbeafe]",
        badge: "MagSafe",
        stat: "40+",
        imageFrame: "h-[94%] w-[98%] scale-110",
      },
      {
        id: 2,
        brand: t.home.carousel3Brand,
        label: t.home.carousel3Label,
        titleBefore: t.home.carousel3TitleBefore,
        titleAccent: t.home.carousel3TitleAccent,
        description: t.home.carousel3Desc,
        cta: t.home.carousel3Cta,
        href: "/shop/phones/used",
        image: HERO_IMAGES.promotions,
        imageBg: "from-[#ede9fe] via-[#f5f3ff] to-[#dbeafe]",
        badge: "Grade A",
        stat: "-30%",
        imageFrame: "h-[90%] w-[100%]",
      },
    ],
    [t]
  );

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setActive((index + slides.length) % slides.length);
      window.setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating, slides.length]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active];

  return (
    <section className="relative overflow-hidden bg-white py-8 sm:py-10 lg:py-14">
      <div className="container-app">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          {/* Left — image carousel */}
          <div className="relative order-1">
            <div
              className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${slide.imageBg} shadow-[0_24px_60px_-20px_rgba(37,99,235,0.2)] transition-all duration-700 lg:rounded-[2.5rem]`}
            >
              <div className="absolute left-5 top-5 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gray-600 shadow-sm backdrop-blur sm:left-6 sm:top-6">
                {slide.brand}
              </div>

              <div className="absolute right-5 top-5 z-10 rounded-xl bg-white/95 px-3 py-2 shadow-md sm:right-6 sm:top-6">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-gray-400">
                  Stock
                </p>
                <p className="text-sm font-black text-brand-electric">
                  {slide.stat}
                </p>
              </div>

              {/* Product stage — tuned for transparent PNG/WebP */}
              <div className="relative mx-auto aspect-square w-full max-w-xl px-1 py-8 sm:max-w-2xl sm:py-10 lg:max-w-[520px]">
                <div className="absolute inset-x-[10%] bottom-[12%] h-8 rounded-[100%] bg-slate-900/10 blur-xl sm:h-10" />

                {slides.map((s, index) => (
                  <div
                    key={s.id}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
                      index === active
                        ? "translate-y-0 scale-100 opacity-100"
                        : "translate-y-3 scale-[0.97] opacity-0"
                    }`}
                  >
                    <div className={`relative ${s.imageFrame}`}>
                      <SafeImage
                        src={s.image}
                        alt={`${s.titleBefore} ${s.titleAccent}`}
                        fill
                        className="object-contain object-center drop-shadow-[0_20px_36px_rgba(15,23,42,0.18)]"
                        sizes="(max-width: 1024px) 95vw, 520px"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-5 left-5 z-10 rounded-xl bg-white/95 px-4 py-2.5 shadow-md sm:bottom-6 sm:left-6">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-gray-400">
                  {slide.label}
                </p>
                <p className="text-sm font-bold text-brand-navy">{slide.badge}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => goTo(active - 1)}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-gray-700 shadow-lg transition-colors hover:bg-brand-gray-50 lg:-left-4"
              aria-label={t.nav.prevSlide}
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-gray-700 shadow-lg transition-colors hover:bg-brand-gray-50 lg:-right-4"
              aria-label={t.nav.nextSlide}
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right — text carousel */}
          <div className="order-2 lg:pl-2">
            <div className="relative min-h-[280px] sm:min-h-[320px]">
              {slides.map((s, index) => (
                <div
                  key={s.id}
                  className={`transition-all duration-500 ${
                    index === active
                      ? "relative translate-y-0 opacity-100"
                      : "pointer-events-none absolute inset-0 translate-y-3 opacity-0"
                  }`}
                  aria-hidden={index !== active}
                >
                  <span className="inline-flex rounded-full bg-brand-gray-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-gray-600">
                    {s.label} · {s.brand}
                  </span>

                  <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-brand-navy sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
                    {s.titleBefore}{" "}
                    <span className="relative inline-block text-brand-electric">
                      {s.titleAccent}
                      <svg
                        className="absolute -bottom-1 left-0 w-full"
                        viewBox="0 0 200 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 8c40-6 80-6 120 0s76 6 116 0"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="text-brand-electric/40"
                        />
                      </svg>
                    </span>
                  </h1>

                  <p className="mt-5 max-w-lg text-base leading-relaxed text-brand-gray-600 sm:text-lg">
                    {s.description}
                  </p>

                  <Link
                    href={s.href}
                    className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-brand-electric px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-electric/25 transition-all hover:bg-brand-navy hover:shadow-brand-navy/20"
                  >
                    {s.cta}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              {slides.map((s, index) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === active
                      ? "w-10 bg-brand-electric"
                      : "w-2.5 bg-brand-gray-200 hover:bg-brand-gray-300"
                  }`}
                  aria-label={`${t.nav.nextSlide} ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                />
              ))}
              <span className="ml-2 text-xs font-semibold text-brand-gray-400">
                {active + 1} / {slides.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
