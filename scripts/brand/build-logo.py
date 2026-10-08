#!/usr/bin/env python3
"""Nigeria 2.0 logo: writes the SVG files in public/brand/.

The mark is original work made for this site (Oct 2026): an "N" whose two
ivory pillars (government and business) are joined by a gold diagonal (the
path from dialogue to deals), with a gold point above (the "2.0", the next
chapter), on a navy tile with a gold hairline. Colours are the site tokens in
src/app/globals.css. The same geometry is drawn in React by
src/components/layout/LogoMark.tsx (tests/brand.test.ts keeps them in step).

Lettering is Geist (SIL Open Font License, files in this folder) converted to
outlines, so the logo looks the same in any app without the font installed.

Usage: python3 scripts/brand/build-logo.py
"""
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
OUT = HERE.parent.parent / "public" / "brand"

NAVY_950 = "#071A33"
NAVY_700 = "#123B67"
GOLD = "#D4AF37"
GOLD_DEEP = "#A8841F"  # gold that holds up on ivory
IVORY = "#F8F7F2"
MIST = "#A8B3C7"

# The mark on a 64-unit grid. LogoMark.tsx copies these numbers.
MARK = f"""<rect width="64" height="64" rx="14" fill="{NAVY_950}"/>
<rect x=".75" y=".75" width="62.5" height="62.5" rx="13.25" fill="none" stroke="{GOLD}" stroke-opacity=".45" stroke-width="1.5"/>
<rect x="13" y="22" width="8" height="30" rx="1.5" fill="{IVORY}"/>
<rect x="36" y="22" width="8" height="30" rx="1.5" fill="{IVORY}"/>
<polygon points="13,22 21,22 44,52 36,52" fill="{GOLD}"/>
<circle cx="49" cy="15" r="4.5" fill="{GOLD}"/>"""


def text_path(font: TTFont, text: str, size: float, x: float, baseline: float, tracking_em: float) -> tuple[str, float]:
    """SVG path data for `text` at `size`, left edge `x`, and the advance it used."""
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    pen = SVGPathPen(glyphs)
    cursor = x
    for i, ch in enumerate(text):
        name = cmap[ord(ch)]
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, cursor, baseline)))
        cursor += glyphs[name].width * scale
        if i < len(text) - 1:
            cursor += tracking_em * size
    return pen.getCommands(), cursor - x


def lockup(name_fill: str, two_fill: str, tag_fill: str) -> str:
    semi = TTFont(HERE / "Geist-SemiBold.ttf")
    medium = TTFont(HERE / "Geist-Medium.ttf")
    x0 = 82  # mark is 64 wide, then an 18-unit gap
    nigeria, w1 = text_path(semi, "NIGERIA ", 26, x0, 31, 0.16)
    two, w2 = text_path(semi, "2.0", 26, x0 + w1 + 0.16 * 26, 31, 0.16)
    tag, w3 = text_path(medium, "LEADERSHIP BUSINESS SUMMIT 2026", 10.4, x0 + 1, 52, 0.18)
    width = round(x0 + max(w1 + 0.16 * 26 + w2, w3 + 1) + 2)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} 64" width="{width * 4}" height="256" role="img" aria-label="Nigeria 2.0 Leadership Business Summit 2026">
{MARK}
<path fill="{name_fill}" d="{nigeria}"/>
<path fill="{two_fill}" d="{two}"/>
<path fill="{tag_fill}" d="{tag}"/>
</svg>
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    files = {
        "nlbs-mark.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512" role="img" aria-label="Nigeria 2.0">\n{MARK}\n</svg>\n',
        # For navy or photo backgrounds (the site header and footer use this look).
        "nlbs-logo-dark.svg": lockup("#FFFFFF", GOLD, MIST),
        # For white or ivory backgrounds (letters, slides, partner pages).
        "nlbs-logo-light.svg": lockup(NAVY_950, GOLD_DEEP, NAVY_700),
    }
    for name, svg in files.items():
        (OUT / name).write_text(svg)
        print(f"public/brand/{name}  {len(svg) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
