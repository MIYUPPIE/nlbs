#!/usr/bin/env python3
"""NLBS logo assets for the site, from the convener's logo file.

Source: scripts/brand/nlbs-logo-source.jpg (copy of NLBS/logo.jpg, 1120x912, the logo on a flat navy background), the
convener's official Nigeria Leadership Business Summit 2026 logo (9 Oct 2026).
Not to be confused with logo.jpeg, the watermarked Design.com preview, which
is never used (tests/brand.test.ts).

The background is removed with colour-to-alpha against the measured navy, so
the logo sits on any surface. Writes to public/brand/:
  nlbs-logo.png / .webp    full logo, transparent, for dark backgrounds (white lettering)
  nlbs-logo-light.png / .webp  same, lettering in navy, for white or ivory backgrounds
  nlbs-logo-navy.png       the logo on its own navy, as supplied (dark slides, print)
  nlbs-icon.png / .webp    the rising bars alone, transparent, square (header, footer)
  nlbs-icon-tile.png       the bars on a navy tile, 512px (favicon, app icon, share image)

Usage: python3 scripts/brand/build-logo.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
SRC = Path(__file__).resolve().parent / "nlbs-logo-source.jpg"  # copy of NLBS/logo.jpg
OUT = ROOT / "public" / "brand"

BG = (1, 16, 38)  # measured background navy of logo.jpg
LOW, HIGH = 14, 70  # colour distance from BG: <= LOW is background, >= HIGH fully opaque
# Content boxes in source pixels (left, top, right, bottom), measured from the file.
LOGO_BOX = (66, 148, 1069, 727)
ICON_BOX = (376, 148, 761, 537)
NAVY_TILE = (7, 26, 51)  # site navy-950 #071A33
# Source rows of the white "NIGERIA LEADERSHIP" line, recoloured for light backgrounds.
WHITE_LINE_ROWS = (575, 672)


def to_alpha(img: Image.Image) -> Image.Image:
    """Turns the navy background transparent and recovers each pixel's own colour."""
    rgb = img.convert("RGB")
    out = Image.new("RGBA", rgb.size)
    src, dst = rgb.load(), out.load()
    w, h = rgb.size
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            d = max(abs(r - BG[0]), abs(g - BG[1]), abs(b - BG[2]))
            a = 0.0 if d <= LOW else 1.0 if d >= HIGH else (d - LOW) / (HIGH - LOW)
            if a == 0:
                dst[x, y] = (0, 0, 0, 0)
                continue
            # un-premultiply: pixel = a * colour + (1 - a) * BG
            c = [min(255, max(0, round((v - (1 - a) * bv) / a))) for v, bv in zip((r, g, b), BG)]
            dst[x, y] = (*c, round(a * 255))
    return out


def navy_lettering(img: Image.Image) -> Image.Image:
    """Recolours the white lettering line to navy, keeping its anti-aliased alpha."""
    out = img.copy()
    px = out.load()
    top, bottom = (r - LOGO_BOX[1] for r in WHITE_LINE_ROWS)
    for y in range(max(0, top), min(out.height, bottom)):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a and min(r, g, b) > 150 and max(r, g, b) - min(r, g, b) < 40:  # white or light grey
                px[x, y] = (*NAVY_TILE, a)
    return out


def pad(img: Image.Image, frac: float, square: bool = False) -> Image.Image:
    w, h = img.size
    m = round(max(w, h) * frac)
    W, H = (max(w, h) + 2 * m,) * 2 if square else (w + 2 * m, h + 2 * m)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.paste(img, ((W - w) // 2, (H - h) // 2), img)
    return canvas


def save(img: Image.Image, stem: str) -> None:
    img.save(OUT / f"{stem}.png", optimize=True)
    img.save(OUT / f"{stem}.webp", quality=90, method=6)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC)
    if src.size != (1120, 912):
        raise SystemExit(f"{SRC.name} is {src.size}; re-measure LOGO_BOX and ICON_BOX")

    cut = to_alpha(src.crop(LOGO_BOX))
    save(pad(cut, 0.04), "nlbs-logo")
    save(pad(navy_lettering(cut), 0.04), "nlbs-logo-light")
    src.convert("RGB").save(OUT / "nlbs-logo-navy.png", optimize=True)  # PNG: public/ holds no JPEGs (content-integrity test)

    icon = pad(to_alpha(src.crop(ICON_BOX)), 0.06, square=True)
    icon = icon.resize((512, 512), Image.Resampling.LANCZOS)
    save(icon, "nlbs-icon")

    tile = Image.new("RGBA", (512, 512), (*NAVY_TILE, 255))
    inner = icon.resize((400, 400), Image.Resampling.LANCZOS)
    tile.paste(inner, (56, 52), inner)
    tile.convert("RGB").save(OUT / "nlbs-icon-tile.png", optimize=True)

    for p in sorted(OUT.glob("nlbs-*")):
        print(f"public/brand/{p.name:22} {p.stat().st_size / 1024:6.1f} KB")


if __name__ == "__main__":
    main()
