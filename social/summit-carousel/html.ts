/**
 * Builds the carousel panorama (7560x1350) as one HTML document.
 *
 * Layers, back to front:
 *   1. background  one gradient + dot grid + glows across the full width
 *   2. skyline     seeded Lagos skyline silhouette (data-layer="bg")
 *   3. ghost       the giant "2.0" outline across join 2|3 (data-layer="ghost")
 *   4. thread      one gold line from x<0 to the arrow on slide 7 (data-thread)
 *   5. crossers    ring, portraits, bridge, bars (data-cross, must not touch text)
 *   6. slides      seven 1080-wide sections holding ALL text (data-slide)
 *
 * Coordinates inside a slide are local (0..1080). Crossers use panorama
 * coordinates. The render spec measures every glyph and fails if text sits
 * within 60px of a slide edge or touches a crosser.
 */
import type { Carousel, Person } from "./content";
import { PANORAMA_W, SLIDE_COUNT, SLIDE_H, SLIDE_W, seeded, slideX, smoothPath } from "./layout";

export type Resolve = (publicPath: string) => string;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const ICONS: Record<string, string> = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  landmark: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
};

const icon = (name: string, size: number, color = "var(--gold)") =>
  `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

/** Absolutely positioned block in slide-local coordinates. */
const at = (x: number, y: number, w: number | null, inner: string, extra = "") =>
  `<div class="blk" style="left:${x}px;top:${y}px;${w ? `width:${w}px;` : ""}${extra}">${inner}</div>`;

const PILLAR_ICON: Record<string, string> = { Capital: "landmark", Talent: "users", Technology: "cpu" };

/* ---------- crossers (panorama coordinates) ---------- */

const portrait = (cx: number, cy: number, d: number, src: string, name: string, cross: string, ring = 6) =>
  `<div class="portrait" data-cross="${cross}" style="left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px;border-width:${ring}px">
    <img src="${src}" alt="${esc(name)}">
  </div>`;

/** Gold orbit across join 1|2. */
const ring = (cx: number, cy: number, r: number) =>
  `<svg class="ring" data-cross="orbit" style="left:${cx - r}px;top:${cy - r}px" width="${r * 2}" height="${r * 2}" viewBox="0 0 ${r * 2} ${r * 2}" aria-hidden="true">
    <defs><radialGradient id="ringGlow"><stop offset="0" stop-color="#e5c45a" stop-opacity=".28"/><stop offset=".7" stop-color="#d4af37" stop-opacity=".06"/><stop offset="1" stop-color="#d4af37" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${r}" cy="${r}" r="${r - 2}" fill="url(#ringGlow)" stroke="#d4af37" stroke-width="3"/>
    <circle cx="${r}" cy="${r}" r="${r * 0.72}" fill="none" stroke="#d4af37" stroke-opacity=".55" stroke-width="2" stroke-dasharray="4 10"/>
    <circle cx="${r}" cy="${r}" r="${r * 0.44}" fill="#d4af37" fill-opacity=".14" stroke="#e5c45a" stroke-width="2"/>
    <circle cx="${r + Math.cos(-0.9) * (r - 2)}" cy="${r + Math.sin(-0.9) * (r - 2)}" r="11" fill="#e5c45a"/>
    <circle cx="${r + Math.cos(2.3) * r * 0.72}" cy="${r + Math.sin(2.3) * r * 0.72}" r="7" fill="#f8f7f2"/>
  </svg>`;

/** Cable-stayed bridge in the skyline across join 5|6. */
const bridge = (cx: number) => {
  const deckY = 1262;
  const topY = 1168;
  const span = 430;
  // Local coordinates: x 0..2*span, y relative to topY.
  const h = deckY - topY + 26;
  const lines = Array.from({ length: 9 }, (_, i) => {
    const off = ((i + 1) / 9) * span;
    return `<path d="M${span},8 L${span - off},${deckY - topY}"/><path d="M${span},8 L${span + off},${deckY - topY}"/>`;
  }).join("");
  return `<svg class="bridge" data-cross="bridge" style="left:${cx - span}px;top:${topY}px" width="${span * 2}" height="${h}" viewBox="0 0 ${span * 2} ${h}" aria-hidden="true">
    <g stroke="#d4af37" stroke-opacity=".55" stroke-width="1.6" fill="none">${lines}</g>
    <rect x="${span - 7}" y="0" width="14" height="${h}" rx="3" fill="#e5c45a"/>
    <rect x="0" y="${deckY - topY - 3}" width="${span * 2}" height="9" rx="3" fill="#123b67" stroke="#d4af37" stroke-opacity=".6"/>
  </svg>`;
};

/** Three rising bars (the growth motif) across join 6|7. */
const bars = (cx: number) => {
  const w = 300;
  const h = 330;
  const bar = (x: number, height: number, o: number) =>
    `<path d="M${x},${h} L${x + 52},${h} L${x + 92},${h - height} L${x + 40},${h - height} Z" fill="url(#barGold)" fill-opacity="${o}"/>`;
  return `<svg class="bars" data-cross="bars" style="left:${cx - w / 2}px;top:${1170 - h}px" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs><linearGradient id="barGold" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7a5e10"/><stop offset=".55" stop-color="#d4af37"/><stop offset="1" stop-color="#f3dc8a"/></linearGradient></defs>
    ${bar(8, 150, 0.75)}${bar(104, 235, 0.88)}${bar(200, h - 4, 1)}
  </svg>`;
};

/** Giant outlined "2.0" across join 2|3: a quiet ghost layer behind text. */
const ghost = (cx: number) =>
  `<svg class="ghost" data-cross="ghost" data-layer="ghost" style="left:${cx - 520}px;top:330px" width="1040" height="760" viewBox="0 0 1040 760" aria-hidden="true">
    <text x="520" y="640" text-anchor="middle" font-family="Geist" font-weight="800" font-size="700" letter-spacing="-30" fill="none" stroke="#d4af37" stroke-width="3">2.0</text>
  </svg>`;

/* ---------- background layers ---------- */

const skyline = () => {
  const rnd = seeded(2026);
  const parts: string[] = [];
  let x = -20;
  while (x < PANORAMA_W + 20) {
    const w = 34 + Math.floor(rnd() * 70);
    const tall = rnd() > 0.82;
    const h = tall ? 120 + Math.floor(rnd() * 70) : 40 + Math.floor(rnd() * 80);
    const y = SLIDE_H - h;
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`);
    if (tall && rnd() > 0.4) parts.push(`<rect x="${x + w / 2 - 2}" y="${y - 26}" width="4" height="26"/>`);
    x += w + Math.floor(rnd() * 8);
  }
  // Lit windows: a sparse, seeded grid of gold dots on the taller blocks.
  const win: string[] = [];
  for (let i = 0; i < 520; i++) {
    const wx = Math.floor(rnd() * PANORAMA_W);
    const wy = SLIDE_H - 18 - Math.floor(rnd() * 120);
    win.push(`<rect x="${wx}" y="${wy}" width="4" height="6"/>`);
  }
  return `<svg class="skyline" data-layer="bg" width="${PANORAMA_W}" height="${SLIDE_H}" viewBox="0 0 ${PANORAMA_W} ${SLIDE_H}" aria-hidden="true">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b4b80" stop-opacity=".55"/><stop offset="1" stop-color="#0b2545" stop-opacity=".95"/></linearGradient>
    <clipPath id="skyClip"><g>${parts.join("")}</g></clipPath></defs>
    <g fill="url(#sky)">${parts.join("")}</g>
    <g fill="#e5c45a" fill-opacity=".35" clip-path="url(#skyClip)">${win.join("")}</g>
  </svg>`;
};

/** The thread: one unbroken gold line, rising gently, ending in an arrow on slide 7. */
export const threadPoints = (): [number, number][] => {
  const pts: [number, number][] = [[-30, 1300]];
  for (let i = 0; i < SLIDE_COUNT; i++) {
    const wave = i % 2 === 0 ? 14 : -14;
    pts.push([slideX(i) + SLIDE_W / 2, 1288 - i * 13 + wave]);
  }
  pts.push([slideX(SLIDE_COUNT - 1) + 990, 1200]);
  return pts;
};

const thread = () => {
  const pts = threadPoints();
  const d = smoothPath(pts);
  const nodes = pts
    .slice(1, -1)
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#071a33" stroke="#e5c45a" stroke-width="4"/>`)
    .join("");
  return `<svg class="thread" data-thread width="${PANORAMA_W}" height="${SLIDE_H}" viewBox="0 0 ${PANORAMA_W} ${SLIDE_H}" aria-hidden="true">
    <defs>
      <linearGradient id="threadGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8952b"/><stop offset=".5" stop-color="#e5c45a"/><stop offset="1" stop-color="#f3dc8a"/></linearGradient>
      <marker id="arrow" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1,1 L11,6 L1,11 Z" fill="#f3dc8a"/></marker>
    </defs>
    <path d="${d}" fill="none" stroke="#e5c45a" stroke-opacity=".22" stroke-width="16" stroke-linecap="round"/>
    <path id="threadPath" d="${d}" fill="none" stroke="url(#threadGold)" stroke-width="5" stroke-linecap="round" marker-end="url(#arrow)"/>
    ${nodes}
  </svg>`;
};

/* ---------- slides (local coordinates) ---------- */

const kicker = (t: string) => `<p class="kicker">${esc(t)}</p>`;

const slide1 = (c: Carousel, r: Resolve) =>
  [
    `<img class="logo" data-textlike src="${r("/brand/nlbs-logo.png")}" alt="Nigerian Leadership Business Summit 2026" style="left:72px;top:72px;width:230px">`,
    at(72, 252, 760, kicker(c.cover.kicker)),
    at(
      72,
      318,
      null,
      `<h1 class="wordmark">${esc(c.cover.wordmark.lead)}<span>${esc(c.cover.wordmark.accent)}</span></h1>`,
    ),
    at(72, 780, 860, `<p class="hook">${esc(c.cover.hook)}</p>`),
    at(
      72,
      992,
      900,
      `<p class="meta">${icon("calendar", 30)}<span>${esc(c.cover.date)}</span><span class="dot"></span>${icon("clock", 30)}<span>${esc(c.cover.time)}</span></p>
       <p class="meta">${icon("pin", 30)}<span>${esc(c.cover.venue)}</span></p>`,
    ),
    `<p class="swipe" style="right:76px;top:1104px">${esc(c.cover.swipe)}</p>`,
  ].join("");

const slide2 = (c: Carousel) =>
  [
    at(268, 118, 744, `${kicker(c.why.kicker)}<h2 class="h">${esc(c.why.heading)}</h2>`),
    at(268, 330, 744, `<p class="body mid">${esc(c.why.body)}</p>`),
    at(
      72,
      676,
      940,
      c.why.points
        .map(
          (p) => `<div class="pillar">
            <div class="pillar-ic">${icon(PILLAR_ICON[p.label] ?? "cpu", 40)}</div>
            <div><p class="pillar-label">${esc(p.label)} · ${esc(p.title)}</p><p class="pillar-detail">${esc(p.detail)}</p></div>
          </div>`,
        )
        .join(""),
    ),
  ].join("");

const slide3 = (c: Carousel) =>
  [
    at(72, 118, 900, `${kicker(c.numbers.kicker)}<h2 class="h h-one">${esc(c.numbers.heading)}</h2>`),
    at(72, 296, 800, `<p class="body small">${esc(c.numbers.body)}</p>`),
    at(
      72,
      392,
      800,
      `<div class="stats">${c.numbers.stats
        .map(
          (s) => `<div class="stat">
            <p class="stat-kind">${s.kind === "target" ? "Target" : "Expected"}</p>
            <p class="stat-value">${esc(s.value)}</p>
            <p class="stat-label">${esc(s.label)}</p>
          </div>`,
        )
        .join("")}</div>`,
    ),
  ].join("");

const personBlock = (p: Person, r: Resolve, d: number) =>
  `<div class="person">
    <div class="avatar" style="width:${d}px;height:${d}px"><img src="${r(p.photo)}" alt="${esc(p.name)}"></div>
    <p class="person-label">${esc(p.label)}</p>
    <p class="person-name">${esc(p.name)}</p>
    <p class="person-role">${esc(p.role)}</p>
  </div>`;

const slide4 = (c: Carousel, r: Resolve) => {
  const h = c.voices.chiefHost;
  return [
    at(72, 110, 900, `${kicker(c.voices.kicker)}<h2 class="h h-one">${esc(c.voices.heading)}</h2>`),
    at(
      222,
      398,
      770,
      `<p class="person-label">${esc(h.label)}</p>
       <p class="honorific">${esc(h.honorific)}</p>
       <p class="host-name">${esc(h.name)}</p>
       <p class="person-role big">${esc(h.role)}</p>`,
    ),
    at(
      72,
      772,
      918,
      `<div class="keynotes">${c.voices.keynotes.map((p) => personBlock(p, r, 150)).join("")}</div>`,
    ),
  ].join("");
};

/** Row centres for the guest portraits that straddle join 4|5. */
export const GUEST_ROWS = [404, 574, 744, 914, 1084];
export const GUEST_D = 140;

const slide5 = (c: Carousel) =>
  [
    at(72, 110, 900, `${kicker(c.guests.kicker)}<h2 class="h h-one">${esc(c.guests.heading)}</h2>`),
    ...c.guests.people.map((p, i) =>
      at(
        108,
        GUEST_ROWS[i] - 66,
        906,
        `<div class="guest"><p class="person-label">${esc(p.label)}</p><p class="guest-name">${esc(p.name)}</p><p class="person-role">${esc(p.role)}</p></div>`,
        "height:132px;display:flex;align-items:center",
      ),
    ),
  ].join("");

const slide6 = (c: Carousel) =>
  [
    at(72, 110, 900, `${kicker(c.day.kicker)}<h2 class="h h-one">${esc(c.day.heading)}</h2>`),
    at(
      72,
      318,
      846,
      `<ol class="expect">${c.day.items
        .map(
          (it, i) =>
            `<li><span class="num">${String(i + 1).padStart(2, "0")}</span><div><p class="expect-title">${esc(it.title)}</p><p class="expect-detail">${esc(it.detail)}</p></div></li>`,
        )
        .join("")}</ol>`,
    ),
  ].join("");

const slide7 = (c: Carousel, r: Resolve) => {
  const [l1, l2] = c.cta.closing.split(/(?<=\.)\s+/);
  const v = c.cta.convener;
  return [
    at(72, 104, 920, `<h2 class="h closing">${esc(l1)}<br><span>${esc(l2 ?? "")}</span></h2>`),
    at(72, 318, 900, `<p class="body small">${esc(c.cta.body)}</p>`),
    at(
      72,
      470,
      900,
      `<div class="convener"><div class="avatar" style="width:112px;height:112px"><img src="${r(v.photo)}" alt="${esc(v.name)}"></div>
        <div><p class="person-name">${esc(v.name)} <span class="cred">${esc(v.credentials)}</span></p><p class="person-role big">${esc(v.title)}</p></div></div>`,
    ),
    at(
      72,
      628,
      900,
      `<p class="meta">${icon("at", 30)}<span>${esc(c.cta.follow)}</span><span class="dot"></span>${icon("globe", 30)}<span>${esc(c.cta.site)}</span></p>`,
    ),
    at(
      72,
      712,
      900,
      `<div class="brands"><img data-textlike src="${r("/brand/nlbs-logo.png")}" alt="Nigerian Leadership Business Summit 2026" style="height:100px"><span class="hbc"><img data-textlike src="${r("/brand/hbc-logo.png")}" alt="HBC Business Help" style="height:44px"></span></div>`,
    ),
    at(
      196,
      850,
      800,
      `<p class="kicker small">${esc(c.cta.partnersLabel)}</p><div class="partners">${c.cta.partners
        .map((p) => `<img data-textlike src="${r(p.logo)}" alt="${esc(p.name)}">`)
        .join("")}</div>`,
    ),
    at(
      196,
      1018,
      700,
      `<div class="actions"><span class="btn gold">${icon("bookmark", 30, "#071a33")}${esc(c.cta.save)}</span><span class="btn">${icon("send", 30)}${esc(c.cta.share)}</span></div>`,
    ),
  ].join("");
};

/* ---------- document ---------- */

export const buildHtml = (c: Carousel, r: Resolve, font: (file: string) => string): string => {
  const slides = [slide1(c, r), slide2(c), slide3(c), slide4(c, r), slide5(c), slide6(c), slide7(c, r)];
  const guestPortraits = c.guests.people
    .map((p, i) => portrait(slideX(4), GUEST_ROWS[i], GUEST_D, r(p.photo), p.name, `guest-${i + 1}`, 4))
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Nigeria 2.0 carousel panorama</title>
<style>
@font-face{font-family:Geist;font-weight:100 900;src:url("${font("geist-latin.woff2")}") format("woff2")}
@font-face{font-family:"Instrument Serif";font-weight:400;src:url("${font("instrument-serif-latin.woff2")}") format("woff2")}
:root{--navy-950:#071a33;--navy-900:#0b2545;--navy-700:#123b67;--navy-600:#1b4b80;--gold:#d4af37;--gold-bright:#e5c45a;--ivory:#f8f7f2;--mist:#a8b3c7;--green:#008751}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${PANORAMA_W}px;height:${SLIDE_H}px;overflow:hidden;background:var(--navy-950)}
body{font-family:Geist,sans-serif;color:var(--ivory);-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
#pano{position:relative;width:${PANORAMA_W}px;height:${SLIDE_H}px;overflow:hidden;
  background:
    radial-gradient(1px 1px at 18px 18px, rgba(168,179,199,.16) 1px, transparent 1.5px) 0 0/36px 36px,
    linear-gradient(90deg,#071a33 0%,#0b2545 18%,#0e2d55 34%,#0b2545 50%,#0a2140 62%,#0e2d55 80%,#071a33 100%)}
.glow{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none}
.skyline,.thread{position:absolute;left:0;top:0}
.ghost,.ring,.bridge,.bars{position:absolute;overflow:visible}
.ghost{opacity:.1}
.portrait{position:absolute;border-radius:50%;border-style:solid;border-color:var(--gold);overflow:hidden;background:var(--navy-700);box-shadow:0 0 0 10px rgba(212,175,55,.12),0 24px 60px rgba(0,0,0,.45)}
.portrait img,.avatar img{width:100%;height:100%;object-fit:cover;object-position:50% 22%;display:block}
.slide{position:absolute;top:0;width:${SLIDE_W}px;height:${SLIDE_H}px}
.blk{position:absolute}
.logo{position:absolute}
.kicker{font-size:22px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.kicker.small{font-size:18px;color:var(--mist)}
.h{font-family:"Instrument Serif",serif;font-weight:400;font-size:92px;line-height:1;letter-spacing:-.01em;margin-top:18px;color:var(--ivory)}
.h-one{font-size:84px}
.wordmark{font-size:176px;font-weight:800;line-height:.92;letter-spacing:-.04em;text-transform:uppercase;white-space:nowrap}
.wordmark span{display:block;color:var(--gold);font-size:300px;line-height:.86;letter-spacing:-.05em}
.hook{font-family:"Instrument Serif",serif;font-size:70px;line-height:1.04;color:var(--ivory)}
.meta{display:flex;align-items:center;gap:14px;font-size:30px;font-weight:500;color:var(--ivory);margin-bottom:16px;white-space:nowrap}
.meta .dot{width:7px;height:7px;border-radius:50%;background:var(--gold);margin:0 8px}
.swipe{position:absolute;font-size:30px;font-weight:600;letter-spacing:.04em;color:var(--gold-bright)}
.body{font-size:32px;line-height:1.42;color:#d9dfe9}
.body.mid{font-size:30px}
.body.small{font-size:27px;line-height:1.45;color:var(--mist)}
.pillar{display:flex;gap:26px;align-items:center;margin-bottom:40px}
.pillar-ic{flex:none;width:96px;height:96px;border-radius:50%;border:2px solid rgba(212,175,55,.6);display:grid;place-items:center;background:rgba(212,175,55,.08)}
.pillar-label{font-size:30px;font-weight:700;color:var(--ivory)}
.pillar-detail{font-size:24px;line-height:1.35;color:var(--mist);margin-top:4px}
.stats{display:grid;grid-template-columns:390px 390px;gap:20px}
.stat{height:320px;border-radius:28px;padding:34px 32px;background:linear-gradient(160deg,rgba(27,75,128,.55),rgba(11,37,69,.7));border:1.5px solid rgba(212,175,55,.35)}
.stat-kind{display:inline-block;font-size:16px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--navy-950);background:var(--gold);border-radius:99px;padding:6px 14px}
.stat-value{font-size:96px;font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--gold-bright);margin-top:26px}
.stat-label{font-size:26px;line-height:1.3;color:var(--ivory);margin-top:16px}
.person-label{font-size:18px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
.honorific{font-size:26px;color:var(--mist);margin-top:14px}
.host-name{font-family:"Instrument Serif",serif;font-size:76px;line-height:1;margin-top:6px}
.person-name{font-family:"Instrument Serif",serif;font-size:42px;line-height:1.05;margin-top:8px}
.person-name .cred{font-family:Geist,sans-serif;font-size:20px;font-weight:600;letter-spacing:.06em;color:var(--gold)}
.person-role{font-size:22px;line-height:1.35;color:var(--mist);margin-top:8px}
.person-role.big{font-size:26px}
.keynotes{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.avatar{border-radius:50%;overflow:hidden;border:4px solid var(--gold);margin-bottom:18px;background:var(--navy-700)}
.guest-name{font-family:"Instrument Serif",serif;font-size:44px;line-height:1.02;margin-top:6px}
.guest .person-role{margin-top:4px}
.expect{list-style:none}
.expect li{display:flex;gap:26px;align-items:center;height:128px}
.num{flex:none;width:70px;height:70px;border-radius:50%;border:2px solid var(--gold);display:grid;place-items:center;font-size:24px;font-weight:700;color:var(--gold-bright)}
.expect-title{font-size:34px;font-weight:700}
.expect-detail{font-size:25px;color:var(--mist);margin-top:4px}
.closing{font-size:96px;margin-top:0}
.closing span{color:var(--gold-bright)}
.convener{display:flex;gap:28px;align-items:center}
.convener .avatar{margin-bottom:0;flex:none}
.convener .person-name{margin-top:0}
.brands{display:flex;align-items:center;gap:28px}
.hbc{display:inline-flex;align-items:center;background:#fff;border-radius:14px;padding:10px 18px}
.partners{display:flex;gap:12px;margin-top:16px}
.partners img{width:142px;height:71px;border-radius:12px;display:block}
.actions{display:flex;gap:20px}
.btn{display:inline-flex;align-items:center;gap:14px;height:80px;padding:0 36px;border-radius:99px;font-size:30px;font-weight:700;border:2px solid var(--gold);color:var(--ivory)}
.btn.gold{background:var(--gold);color:var(--navy-950)}
.ic{flex:none}
</style></head>
<body><div id="pano">
  <div class="glow" style="left:620px;top:-140px;width:920px;height:880px;background:radial-gradient(closest-side,rgba(212,175,55,.22),transparent)"></div>
  <div class="glow" style="left:3620px;top:180px;width:1400px;height:1000px;background:radial-gradient(closest-side,rgba(0,135,81,.20),transparent)"></div>
  <div class="glow" style="left:2700px;top:200px;width:1080px;height:760px;background:radial-gradient(closest-side,rgba(212,175,55,.12),transparent)"></div>
  <div class="glow" style="left:5900px;top:620px;width:1200px;height:900px;background:radial-gradient(closest-side,rgba(212,175,55,.16),transparent)"></div>
  ${skyline()}
  ${ghost(slideX(2))}
  ${thread()}
  ${ring(slideX(1), 300, 210)}
  ${portrait(slideX(3), 520, 380, r(c.voices.chiefHost.photo), c.voices.chiefHost.name, "chief-host")}
  ${guestPortraits}
  ${bridge(slideX(5) - 170)}
  ${bars(slideX(6))}
  ${slides.map((s, i) => `<section class="slide" data-slide="${i}" style="left:${slideX(i)}px">${s}</section>`).join("\n  ")}
</div></body></html>`;
};
