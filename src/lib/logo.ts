/**
 * The Nigeria 2.0 mark (original, Oct 2026): an "N" whose ivory pillars
 * (government and business) are joined by a gold diagonal (dialogue to
 * deals), with a gold point above (the "2.0"). 64-unit grid, site colours.
 *
 * One source for every place it is drawn: the header/footer (LogoMark), the
 * favicon, the Apple icon and the share image. scripts/brand/build-logo.py
 * writes the same shapes into public/brand/*.svg; tests/brand.test.ts fails
 * if the two drift apart.
 */

/** Navy tile with the gold hairline. */
export const LOGO_TILE =
  '<rect width="64" height="64" rx="14" fill="#071A33"/>' +
  '<rect x=".75" y=".75" width="62.5" height="62.5" rx="13.25" fill="none" stroke="#D4AF37" stroke-opacity=".45" stroke-width="1.5"/>';

/** The N and the point, without the tile (for full-bleed icons). */
export const LOGO_GLYPH =
  '<rect x="13" y="22" width="8" height="30" rx="1.5" fill="#F8F7F2"/>' +
  '<rect x="36" y="22" width="8" height="30" rx="1.5" fill="#F8F7F2"/>' +
  '<polygon points="13,22 21,22 44,52 36,52" fill="#D4AF37"/>' +
  '<circle cx="49" cy="15" r="4.5" fill="#D4AF37"/>';

export const LOGO_MARK = LOGO_TILE + LOGO_GLYPH;
