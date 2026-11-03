// Builds public/people/*.webp (4:5 portraits) from the originals in assets-src/people
// (kept out of public/, which bans raw JPEGs). Static export has no image server,
// so photos must be pre-sized. Run: node scripts/optimize-people.mjs
import sharp from "sharp";
import { join } from "node:path";

const src = "assets-src/people";
const jobs = [
  // 960x1280 -> centred crop to 4:5, then 640x800.
  {
    in: "convener.jpeg",
    out: "wale-busari.webp",
    crop: { left: 0, top: 0, width: 960, height: 1200 },
    size: [640, 800],
  },
  // 720x650 -> 4:5 window (520x650) centred on the face (x ~ 315), native resolution.
  {
    in: "patron.jpeg",
    out: "seyi-tinubu.webp",
    crop: { left: 55, top: 0, width: 520, height: 650 },
    size: [520, 650],
  },
];
for (const j of jobs) {
  await sharp(join(src, j.in))
    .extract(j.crop)
    .resize(...j.size)
    .webp({ quality: 82 })
    .toFile(join("public/people", j.out));
  console.log("wrote", j.out);
}
