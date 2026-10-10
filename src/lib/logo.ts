/**
 * The official NLBS logo (convener's file, 9 Oct 2026): rising bars over
 * "Nigeria Leadership Business Summit 2026". Assets in public/brand/ are
 * generated from it by scripts/brand/build-logo.py; tests/brand.test.ts
 * checks they exist and that the watermarked preview the convener once
 * sent (a different file) is never used.
 */
export const LOGO = {
  /** Rising bars, transparent, square 512px: header and footer. */
  icon: "/brand/nlbs-icon.webp",
  /** Bars on a navy tile, 512px PNG: favicon, app icon, share image. */
  tile: "/brand/nlbs-icon-tile.png",
  /** Full logo, transparent, white lettering: dark backgrounds. */
  full: "/brand/nlbs-logo.webp",
  /** Full logo, transparent, navy lettering: light backgrounds. */
  fullLight: "/brand/nlbs-logo-light.webp",
  /** Pixel size of the full logo files (for width/height attributes). */
  fullSize: { width: 1083, height: 659 },
  alt: "Nigeria Leadership Business Summit 2026",
} as const;
