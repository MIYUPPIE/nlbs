# Nigeria 2.0: Nigerian Leadership Business Summit 2026

Official website for **Nigeria 2.0**, Monday 23 November 2026, Eko Convention Centre, Lagos. Convened by HBC Business Help.

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 · Aceternity UI patterns · Motion · Lucide · Zod.

## Run

```bash
npm install          # also points git at .githooks (pre-commit gate)
npm run dev          # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` and set values (see **Forms** below).

## Content rule

Only facts confirmed in the build brief are published. They live in `src/data/`:

| File                                         | What to edit                                                                                             |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `event.ts`                                   | Event facts, statistics (every figure is `expected` or `target`), contact details (`null` = placeholder) |
| `programme.ts`                               | Six programme formats. `time: null` renders "Time to be announced"                                       |
| `speakers.ts`                                | Placeholders. Set `confirmed: true` + real details + `/public/speakers/*.jpg` to publish                 |
| `partners.ts`                                | Add `{ name, logo }` to a category to replace its placeholder slots                                      |
| `partnership.ts`, `registration-plan.ts`     | Partnership tracks and tiers; delegate routes, timeline and arrival details                              |
| `content.ts`, `audience.ts`, `navigation.ts` | Section copy, audience groups, nav and routes                                                            |

`tests/content-integrity.test.ts` fails the build if unverified names or claims from draft client documents (named keynotes, media partners, pricing, times, contact details) appear in `src/`. When the convener confirms one, remove it from that test's list in the same commit that publishes it.

## Photos

Every photo on the site is a real, freely licensed photograph. None is an AI image, and none is passed off as the summit. There are two kinds: `place` (the venue, Lagos) and `event` (people at other real Nigerian conferences, captioned with the event they show).

| Photo                          | Where it renders                                      |
| ------------------------------ | ----------------------------------------------------- |
| `lagos-victoria-island-aerial` | Homepage hero background                              |
| `venue-eko-hotels`             | Summit Experience section (About)                     |
| `venue-eko-night`              | Summit Experience section (About), contact venue card |
| `lagos-business-district`      | CTA band (every page that ends with it)               |
| `room-*` (five event photos)   | Homepage "In the room" section, after About           |
| `lagos-skyline-marina`         | Backdrop of "The 2026 Summit at a glance" band        |
| `lagos-island-cityscape`       | About section, under the heading                      |
| `lagos-road-victoria-island`   | 10-Year Roadmap, above the phases                     |

- **Source of truth:** `content/photos.json` lists Wikimedia Commons file titles with alt text and captions.
- **Sync:** run `npm run photos:sync` (`scripts/sync-photos.mjs`). It pulls licence, author and source from Commons, rejects anything outside CC0, public domain, CC BY or CC BY-SA, then writes `public/photos/<id>.webp` (resized, EXIF and GPS stripped) and `src/data/photos.generated.json`. Never edit the generated file by hand.
- **Credit:** photos render without captions or credits (convener decision, 2 Oct 2026). All attribution lives on `/credits` (`src/app/credits/page.tsx`), which lists every synced photo and is linked from the footer on every page. CC BY and CC BY-SA require that credit, so never remove the page or its footer link.
- **Event photos:** a `kind: "event"` entry must set `event` to the real event it shows, and its caption must contain that name. The sync refuses anything else. These photos sit in their own section, never in the 2025 edition section.
- **Provenance:** prefer files with camera EXIF from an identifiable photographer. Skip contest uploads still under review, and professional press shots with no camera data (likely copied).
- **2025 edition:** no public photos of the 2025 summit exist, so `EditionSection` keeps its placeholder. When the convener supplies real summit photos, add them with the photographer credited. Never caption another event's photo as the summit.
- `tests/photos.test.ts` guards licences, the credits page, file sizes, EXIF and the rule that no photo is passed off as the summit. `e2e/content-pages.spec.ts` checks that every placed photo loads uncaptioned and that `/credits` credits all of them.

## AI-generated illustrations

Illustrations are kept separate from photos. They are listed in `src/data/illustrations.ts` and stored under `public/illustrations/`.

| Illustration                                      | Where it renders                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| `technology-productivity`                         | Banner in the Technology section (homepage, /technology, /exhibition) |
| `pillars`, `audience`, `programme`, `deal-making` | Banner under each section heading                                     |
| `investment`, `talent`, `startup-pitch`           | Right-hand column of each section                                     |
| `exhibition`, `faq`                               | Left column under the call to action (FAQ: desktop only)              |
| `edition`                                         | Abstract backdrop of the 2026 card in "Building on 2025" (no people)  |

- Every illustration's alt text starts with "AI-generated illustration:". Each one is disclosed under "AI-generated illustrations" on `/credits`, with its generator and date. The banner element carries `data-ai-generated="true"`.
- Illustrations show ideas only, never the summit, a real event or a named person. `tests/illustrations.test.ts` enforces this, along with file size, dimensions and stripped metadata.
- To add or replace one: generate it, then run `node scripts/add-illustration.mjs <file.png> <id>` and record the printed size in `illustrations.ts`. Render it with `<SectionImage image={illustration("<id>")} />`.
- Every homepage section shows an image except Speakers and Partners, which stay as placeholders until real speakers and partners are confirmed (`tests/illustrations.test.ts`).

## Client documents

| Source (in `../latest`)                            | Where it lives                                                                                                                                                                       | Notes                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `1.md` (101 FAQs)                                  | `content/faq.md` → `/faq` + homepage teaser                                                                                                                                          | Parsed at build by `src/lib/faq.ts`, which validates numbering and category ranges. `content/faq-overrides.json` patches Q13, Q19, Q67, Q75, Q93 and Q101 (missing, malformed or contradicting the brief). To update, paste the new file over `content/faq.md`; the build fails if it is malformed. Prettier ignores `content/*.md`. |
| `2.md` (About)                                     | `src/data/vision.ts` → About (vision, roadmap, why now, differentiators, summit experience, leadership), homepage roadmap, Partners (Founding 800)                                   | Named keynote speakers and a confirmed-President claim are omitted (they contradict the brief).                                                                                                                                                                                                                                      |
| Concept note, audience profile, event flyer        | `src/data/content.ts` (objectives, expected outcomes, what to expect, 50 startups), `src/data/audience.ts` (six groups with seat estimates, delegate mix, why this audience matters) | Source material for pages, never downloads. `tests/content-integrity.test.ts` fails if a client document is published as a file or linked for download. Named companies, AUM and revenue figures from the profile are left out.                                                                                                      |
| Youth application form                             | `src/data/talent-application.ts` → `/talent#apply`                                                                                                                                   | Applicant-facing details only; the internal scoring workflow is not published.                                                                                                                                                                                                                                                       |
| Sponsorship prospectus, stakeholder/sponsor briefs | `src/data/partnership.ts` → `/partners` (two tracks, tiers and slots, comparison, sponsor benefits by tier, next steps)                                                              | Convener decision (29 Sep 2026): Stakeholders + Sponsors replaces the 2.md Founding 800 tiers, fees on request. FAQ Q24, 46-48, 50, 53, 55, 63, 69 and 72 are overridden to match. Target companies, pitch scripts and revenue targets stay internal. `tests/partnership.test.ts` guards all of this.                                |
| Registration + entry plan (`35996679-….jpeg`)      | `src/data/registration-plan.ts` → `/register` (routes in by category, pre-event timeline, arrival) and the optional WhatsApp, nominated-by and access-needs form fields              | Badge colours, staffing, equipment, tools and sponsor data capture stay internal.                                                                                                                                                                                                                                                    |

Where a document contradicts the brief, the brief wins (e.g. the $50M+ target stays; prospectus figures are not used).

## Forms and hosting

The site is a **static export** (`output: "export"`): plain files for cPanel `public_html`, no Node server. Every form posts **from the visitor's browser** to the central backend (`central-backend` repo, `POST /api/v1/submissions`) with the NLBS public key:

| File                  | Role                                                                                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/outgoing.ts` | What each form sends: Zod validation, then the clean-up the old API routes did (talent screening and WhatsApp normalisation, sponsor pass holders and allowance). Unit-tested against the backend's contract fixtures.                                 |
| `src/lib/central.ts`  | Sends it and maps every backend answer (201/200, 422 field errors, 403 closed window, 401/403/413/429/5xx, network failure) to a plain message. No config means "not open yet", never a fake success.                                                  |
| `.env.production`     | `NEXT_PUBLIC_CENTRAL_API_URL` and `NEXT_PUBLIC_CENTRAL_SITE_KEY` (a `pk_` key, public by design: the backend accepts it only from `https://www.nlbs.com.ng` / `https://nlbs.com.ng`, rate-limited). Public values only; a test fails on any `sk_` key. |
| `public/.htaccess`    | What a static export cannot do itself: HTTPS + `www` redirect, `/apply` and `/talent/apply` redirects, `noindex` on `/sponsors/`, caching, security headers, PNG type for `/icon` and `/opengraph-image`, the 404 page, no folder listings.            |

The backend enforces the Talent Fund window (1 to 30 Oct 2026, Lagos) and validates everything again. The page checks the same window in the browser (`NEXT_PUBLIC_TALENT_APPLICATIONS_OVERRIDE=open|closed` forces it at build time).

### Deploy to cPanel

```bash
npm run build:cpanel        # -> dist/nlbs-site-<version>.zip
```

The script builds with `.env.production` only and refuses to ship a build that has test settings, a secret key, the wrong backend URL or no `.htaccess`. On the server, extract the zip in `public_html` (replace everything). The backend must allow browser posts for NLBS (central-backend `0d49d8b` or later with the static-site change) before the new site goes live.

### Tests

- `npm run check`: typecheck, lint, unit tests (including the backend contract).
- `npm run test:e2e`: builds against a fake backend (and deletes that `out/` afterwards, so a test build can never be uploaded) (`e2e/servers/fake-central.mjs`), serves `out/` with **Apache 2.4 in Docker** using the real `.htaccess`, and runs Playwright across every page. Needs Docker.

## Partner form (unlisted)

`/sponsors` is the partner booking form (track, tier, organisation and billing, main contact, strategy-call availability, VIP pass holders). It is always available to anyone with the address, but no page links to it, it is not in the sitemap and it sends `noindex`. Share the URL directly. `tests/sponsor-form.test.ts` fails if a link to it is added anywhere in `src/`.

Sent to the central backend like the other forms; requests appear under _NLBS > Partners_ with `passHolders` as `[{ name, email }]` and `passAllowance` for the tier.

## Talent Fund application

`/talentnigeria20` (aliases `/talent/apply`, `/apply`) implements `youth_application_form_questions.pdf` as a three-step form: Who are you, Which track, and the 8 filter questions, with track-specific Q4 (Skills: skill; Jobs: PDF CV up to 2 MB + portfolio link; Capital: business name, CAC status, monthly revenue).

- **Auto-reject** (PDF rules): age 36+ or "No" to Q5 shows "Thank you, you are not eligible." and blocks submission; the API enforces the same.
- **Window**: open 00:00 1 Oct to 23:59 30 Oct 2026, Lagos time, enforced on the page and API. `TALENT_APPLICATIONS_OVERRIDE=open|closed` to open early or extend.
- **Video (Q3)** is a link (YouTube, Drive, TikTok, Instagram, Loom). Phone video files exceed what the site can accept without file storage.
- **Screening** (`screen()` in `src/lib/talent-form.ts`), sent to the central backend with the application (which re-checks it against its own rubric), never shown to applicants: video 30, Platinum Partner referral 15, age 18-30 and available 15. Problem statement (20) and pitch (20) are left for reviewers, with `bandRange` showing the best and worst band (70+ shortlist, 50-69 waitlist, under 50 reject). Flags: `generic_problem_statement`, `skill_level_track_mismatch`, `received_prior_support`, `partner_referral_unverified`, `needs_hub_access`.
- WhatsApp numbers are normalised to `+234…`; answers from unchosen tracks are dropped; drafts auto-save on the device (never the CV).
- Deviations from the PDF: "from April 2026" dropped (contradicts the deadline); Platinum Partner names are typed by the applicant until the partners are confirmed.

## Tests

| Lane                   | Command                             | What it covers                                                                                                                                                                                                                                                                                                  |
| ---------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gate (pre-commit, <2s) | `npm run check`                     | Types, lint, 108 unit tests: countdown/timezone math, schemas, API status contract, content integrity, WCAG contrast of design tokens, routes/sitemap/robots                                                                                                                                                    |
| Eval (before ship)     | `npm run build && npm run test:e2e` | 128 Playwright checks: no horizontal overflow at 1440/1280/1024/768/640/390/375 on all 12 routes, axe WCAG 2.1 AA (zero serious/critical), registration + enquiry flows, mobile drawer, programme tabs keyboard nav, frozen-clock countdown, reduced motion, no-JS rendering, pre-hydration behaviour, SEO tags |

Visual check: `node scripts/screenshot.mjs /path 390 out.png --segments --base=http://localhost:3000`.

## Design system

Tokens are in `src/app/globals.css` (`@theme`). Gold (`#D4AF37`) is for dark surfaces, CTAs, borders and icons. On ivory/white, gold text uses `gold-ink` (`#7A5E10`, 6.1:1) because raw gold is 1.96:1 there. `tests/contrast.test.ts` enforces this.

Aceternity components (adapted, in `src/components/aceternity/`): Spotlight, Background Beams (18 beams, deterministic timings, desktop only, static under reduced motion), Moving Border (partnership + final CTA), Bento Grid (technology, exhibition), Card Hover Effect (audience). Scroll reveal uses one IntersectionObserver; content is visible without JS, under reduced motion and in print.

## Logo

The Nigeria 2.0 logo is original work made for this site (Oct 2026), owned outright: an "N" whose two ivory pillars
(government and business) are joined by a gold diagonal (dialogue to deals), with a gold point above (the "2.0"),
on a navy tile with a gold hairline.

- **On the site:** `src/lib/logo.ts` holds the shapes. `LogoMark` draws them in the header and footer; `icon.tsx`,
  `apple-icon.tsx` and `opengraph-image.tsx` render the favicon, home-screen icon and share image from the same source.
- **For print, press and partners:** `public/brand/nlbs-logo-dark.svg` (navy or photo backgrounds),
  `nlbs-logo-light.svg` (white or ivory), `nlbs-mark.svg` (the tile alone). Lettering is outlined Geist (SIL OFL),
  so the files need no fonts. Live at `https://www.nlbs.com.ng/brand/<file>`.
- **To change it:** edit `MARK` in `scripts/brand/build-logo.py` and `src/lib/logo.ts` together, then run
  `python3 scripts/brand/build-logo.py`. `tests/brand.test.ts` fails if they drift, if lettering stops being outlined,
  if the mark stops reading at 16px, or if the watermarked Design.com preview (`logo.jpeg`) is ever used.

## Architecture

Server components by default. Client islands: header/drawer, countdown, count-up numbers, programme tabs, audience hover, beams, moving border, forms, reveal observer. The mobile drawer uses HTML Invoker Commands so it opens before hydration; form submit buttons stay disabled until hydration so a native submit can never put personal data in a URL.

## Privacy (NDPA 2023)

`/privacy/`, `/cookies/`, `/terms/` render `src/data/legal.json`, a generated copy of
`central-backend/contracts/privacy/dist/nlbs/legal.json`. Never edit it by hand: change the policy in the backend
contract, then `node ../central-backend/contracts/privacy/build.mjs && node ../tools/sync-legal.mjs nlbs`.
`/privacy/request/` posts the `privacy` form. Every form sends `privacyVersion`. Registration asks for explicit
consent when dietary/access needs are given (`accessNeedsConsent`).

`tests/legal.test.ts` fails if `legal.json` drifts from the backend, if the request types differ from the backend,
or if the site starts using a browser storage key, cookie, iframe, `next/script` or outside script the cookie
policy does not list. Adding analytics means a consent banner and a policy update first.
