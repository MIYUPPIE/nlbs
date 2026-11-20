// Builds public/partners/*.png, one uniform 480x240 (2:1) tile per partner, from the
// sources in assets-src/partners/. Run: node scripts/build-partner-logos.mjs
//
// Sources (checked 20 Nov 2026):
// - Keystone Bank: the bank's official lockup (Wikimedia Commons "File:Keystone Logo.png",
//   the logo on en.wikipedia.org/wiki/Keystone_Bank_Limited), tagline cropped off.
// - allevents.ng: the official logo served by allevents.ng (/Content/Images/logo-300x78.png).
// - Dmax Media, TA Media Communications, Praxis Medical Nigeria: no logo file is published
//   anywhere online, so these are cut from the convener's flyer and upscaled. When the
//   convener supplies the original files, drop them in assets-src/partners/ and switch
//   the entry to `{ src: "<file>" }`.
//
// Every logo is trimmed to its artwork, fitted inside the tile with the same padding, and
// laid on its own brand background, so the tiles line up whatever the source looked like.
// tests/speakers.test.ts checks every output is a 480x240 PNG.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export const TILE = { width: 480, height: 240 };
const PAD = { x: 56, y: 44 };
const FLYER = "assets-src/partners/flyer-nov-2026.jpeg";

const logos = [
  {
    out: "keystone-bank.png",
    src: "keystone-bank-official.png",
    crop: { left: 24, top: 24, width: 714, height: 272 }, // inside the rounded navy box, above the tagline
    bg: "#142142",
  },
  {
    out: "dmax-media.png",
    src: FLYER,
    crop: { left: 450, top: 1207, width: 94, height: 51 },
    bg: "#ffffff",
    whiten: true,
  },
  { out: "allevents-ng.png", src: "allevents-ng-official.png", bg: "#ffffff" },
  { out: "ta-media.png", src: FLYER, crop: { left: 650, top: 1208, width: 82, height: 50 }, bg: "#000000" },
  {
    out: "praxis-medical.png",
    src: FLYER,
    crop: { left: 744, top: 1207, width: 82, height: 52 },
    bg: "#ffffff",
    whiten: true,
  },
];

mkdirSync("public/partners", { recursive: true });

for (const l of logos) {
  const path = l.src === FLYER ? FLYER : join("assets-src/partners", l.src);
  let img = sharp(path).ensureAlpha();
  if (l.crop) img = img.extract(l.crop);
  // The flyer's light tiles are off-white (about rgb 243) with JPEG noise; lift them to pure
  // white so the cut logo sits on the same white as the official files.
  if (l.whiten)
    img = sharp(
      await img
        .removeAlpha()
        .linear(255 / 236, 0)
        .png()
        .toBuffer(),
    ).ensureAlpha();
  // Flatten onto the brand background first so trim sees one flat colour around the artwork.
  const flat = await img.flatten({ background: l.bg }).png().toBuffer();
  const art = await sharp(flat)
    .trim({ background: l.bg, threshold: 40 })
    .resize(TILE.width - 2 * PAD.x, TILE.height - 2 * PAD.y, {
      fit: "inside",
      kernel: "lanczos3",
      withoutEnlargement: false,
    })
    .sharpen(l.src === FLYER ? { sigma: 0.8 } : undefined)
    .png()
    .toBuffer();
  await sharp({ create: { ...TILE, channels: 3, background: l.bg } })
    .composite([{ input: art, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(join("public/partners", l.out));
  console.log("wrote partners/" + l.out);
}
