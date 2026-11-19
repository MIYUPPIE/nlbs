// Builds the site's people and partner images from the convener's originals in assets-src/
// (kept out of public/, which bans raw JPEGs). Static export has no image server, so photos
// must be pre-sized. Run: node scripts/optimize-people.mjs
//
// - public/people/*.webp    leadership portraits, 4:5
// - public/speakers/*.webp  speaker and guest-of-honour portraits, 4:5, never upscaled
// - public/partners/*.png   partner logos cut from the convener's flyer (2x, lossless)
//
// Crops are hand-placed on each face. tests/speakers.test.ts checks every output's
// size and 4:5 ratio, so a bad crop fails the gate.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const people = [
  // 960x1280 -> centred crop to 4:5, then 640x800.
  {
    in: "people/convener.jpeg",
    out: "people/wale-busari.webp",
    crop: { left: 0, top: 0, width: 960, height: 1200 },
    size: [640, 800],
  },
  // 720x650 -> 4:5 window (520x650) centred on the face (x ~ 315), native resolution.
  {
    in: "people/patron.jpeg",
    out: "people/seyi-tinubu.webp",
    crop: { left: 55, top: 0, width: 520, height: 650 },
    size: [520, 650],
  },
  // 565x640 -> 512x640 window on the face (x ~ 268), native resolution.
  {
    in: "speakers/babajide-sanwo-olu.jpeg",
    out: "speakers/babajide-sanwo-olu.webp",
    crop: { left: 12, top: 0, width: 512, height: 640 },
    size: [512, 640],
  },
  // 1280x1280 -> 1024x1280 window on the face (x ~ 731), then 640x800.
  {
    in: "speakers/taiwo-oyedele.jpeg",
    out: "speakers/taiwo-oyedele.webp",
    crop: { left: 219, top: 0, width: 1024, height: 1280 },
    size: [640, 800],
  },
  // 1024x1280, already 4:5.
  {
    in: "speakers/samson-ajayi.jpeg",
    out: "speakers/samson-ajayi.webp",
    crop: { left: 0, top: 0, width: 1024, height: 1280 },
    size: [640, 800],
  },
  // 400x400 -> 320x400 centred, native resolution.
  {
    in: "speakers/bosun-tijani.jpeg",
    out: "speakers/bosun-tijani.webp",
    crop: { left: 40, top: 0, width: 320, height: 400 },
    size: [320, 400],
  },
  // 654x551 with a 23 px white strip on top and a search-engine badge bottom left (x 10-34):
  // skip the strip and start right of the badge. 420x525 window, native resolution.
  {
    in: "speakers/jumoke-oduwole.jpeg",
    out: "speakers/jumoke-oduwole.webp",
    crop: { left: 40, top: 24, width: 420, height: 525 },
    size: [420, 525],
  },
  // 1080x935 -> 748x935 window on the face (x ~ 572), then 640x800.
  {
    in: "speakers/olayemi-cardoso.jpeg",
    out: "speakers/olayemi-cardoso.webp",
    crop: { left: 198, top: 0, width: 748, height: 935 },
    size: [640, 800],
  },
  // 4000x4975 -> 3980x4975 (4:5), then 640x800.
  {
    in: "speakers/seye-olurotimi.jpeg",
    out: "speakers/seye-olurotimi.webp",
    crop: { left: 10, top: 0, width: 3980, height: 4975 },
    size: [640, 800],
  },
];

// Partner tiles from the flyer's bottom (inset 3 px to drop the flyer's tile border) "In partnership with" row (854x1279 original).
// The convener supplied no separate logo files; replace these with vector logos when they do.
const flyer = "assets-src/partners/flyer-nov-2026.jpeg";
const logos = [
  { out: "keystone-bank.png", crop: { left: 345, top: 1209, width: 91, height: 48 } },
  { out: "dmax-media.png", crop: { left: 451, top: 1209, width: 92, height: 48 } },
  { out: "allevents-ng.png", crop: { left: 557, top: 1209, width: 80, height: 48 } },
  { out: "ta-media.png", crop: { left: 651, top: 1209, width: 80, height: 48 } },
  { out: "praxis-medical.png", crop: { left: 747, top: 1209, width: 80, height: 48 } },
];

mkdirSync("public/people", { recursive: true });
mkdirSync("public/speakers", { recursive: true });
mkdirSync("public/partners", { recursive: true });

for (const j of people) {
  await sharp(join("assets-src", j.in))
    .rotate() // honour EXIF orientation, then strip all metadata (sharp default)
    .extract(j.crop)
    .resize(...j.size)
    .webp({ quality: 82 })
    .toFile(join("public", j.out));
  console.log("wrote", j.out);
}

for (const l of logos) {
  await sharp(flyer)
    .extract(l.crop)
    .resize(l.crop.width * 2, l.crop.height * 2, { kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(join("public/partners", l.out));
  console.log("wrote partners/" + l.out);
}
