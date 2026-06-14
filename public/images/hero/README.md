# Hero carousel images

Place **transparent background** product images here (PNG or WebP).

| File | Slide | Recommended content |
|------|-------|---------------------|
| `slide-1-phones.webp` or `.png` | 1 | Single smartphone |
| `slide-2-accessories.webp` or `.png` | 2 | Accessories group |
| `slide-3-promotions.webp` or `.png` | 3 | 3 phones (wide layout) |

## Image specs

- **Background:** fully transparent (no white/black box baked in)
- **Size:** 1200×1200 px or 1400×1400 px (square)
- **Format:** WebP (preferred) or PNG
- **Padding:** leave ~10% empty space around the product in the file
- **File size:** under 500 KB each

The carousel auto-scales each slide. Slide 3 (wide 3-phone shot) uses extra width.

If using `.png` instead of `.webp`, update filenames in `components/HeroCarousel.tsx` (`HERO_IMAGES`).
