# Nigeria 2.0 seamless Instagram carousel

Seven 1080x1350 (4:5) slides cut from one 7560x1350 panorama, so a swipe feels like moving through one scene.

```bash
npm run carousel:render          # writes social/summit-carousel/out/
npx vitest run tests/summit-carousel.test.ts   # gate tests (also part of npm test)
```

Output (gitignored): `slide_1.jpg` .. `slide_7.jpg`, `panorama.jpg`, `panorama.html` (debug), `report.json` (joins, crossers, seam diffs, errors).

## Slides

| #   | Purpose                                                                                           | Copy source                                                                              |
| --- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Cover: NIGERIA 2.0, hook, date, time, venue, Swipe →                                              | `event.ts`                                                                               |
| 2   | Why: from dialogue to deals, three levers                                                         | `content.ts` pillars, intro                                                              |
| 3   | Goals: 800+, $50M+, 10,000, 200+, each badged Expected or Target                                  | `event.ts` stats                                                                         |
| 4   | Chief Host + two Keynotes                                                                         | `speakers.ts`                                                                            |
| 5   | Guests of honour, Patron, Speaker                                                                 | `speakers.ts`                                                                            |
| 6   | What to expect on the day (6 items)                                                               | `content.ts` whatToExpect                                                                |
| 7   | Tagline, registration closed + QR by email, convener, handle, site, logos, partners, Save / Share | `event.ts`, `vision.ts`, `partners.ts`, `registration-window.ts`, `registration-plan.ts` |

Only the connective lines (headings, the hook) are written in `content.ts`. Every fact is imported from `src/data`, so the carousel cannot drift from the website.

## Seamless rules and where they are enforced

| Rule                                                          | Enforced by                                                                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Text keeps 60px from every slide edge, never crosses a join   | `render.spec.ts` measures every glyph (Range rects) and logo                                                        |
| Every join has a crossing element (stricter than every other) | `render.spec.ts` (`crossesJoin`, 40px reach both sides)                                                             |
| Crossing elements never touch text                            | `render.spec.ts` (12px padding); the ghost "2.0" is the only element allowed behind text, capped at 20% opacity     |
| One continuous thread                                         | `render.spec.ts`: exactly one path, from x < 0 into slide 7                                                         |
| Background flows across joins                                 | single full-width gradient + seam check: mean RGB diff between the columns either side of a join must stay under 10 |
| Slide 1 stands alone                                          | cover holds title, hook, date, venue                                                                                |

Crossers: 1|2 gold orbit, 2|3 ghost "2.0", 3|4 Chief Host portrait, 4|5 column of five guest portraits, 5|6 cable-stayed bridge, 6|7 rising gold bars. The thread is the gold growth line along the skyline, ending in an arrow on slide 7.

## Assets

Speaker and convener photos come from `public/speakers` and `public/people` (supplied by the convener). Logos come from `public/brand` and `public/partners`. No Wikimedia photos and no AI images are used, so the carousel needs no credit line. The skyline is drawn by code from a seeded PRNG. Fonts (Geist, Instrument Serif, OFL) are in `fonts/` so renders need no network.

## Editing

Change copy in `content.ts`, layout in `html.ts`, then re-render. If the render fails, open `out/report.json` and `out/slide_N.jpg`: the error names the slide, the text run and how many px it is off.
