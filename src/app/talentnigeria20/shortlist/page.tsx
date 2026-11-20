import type { Metadata } from "next";
import { ChevronDown, Search, ShieldCheck } from "lucide-react";
import { contact } from "@/data/event";
import { shortlist, shortlistMeta, shortlistTracks, trackSummary } from "@/data/talent-shortlist";
import { PageHero } from "@/components/layout/PageHero";
import { ShortlistFinder } from "@/components/talent/ShortlistFinder";
import { Container } from "@/components/ui/Container";
import { groupByState, slugify } from "@/lib/shortlist";

/**
 * Talent Fund 2026 final shortlist (convener PDF of 16 Nov 2026, see
 * src/data/talent-shortlist.ts). Linked from the Talent pages and navigation,
 * but kept out of search engines: it lists young applicants by name, so it is
 * noindex and not in the sitemap (tests/shortlist.test.ts).
 */
export const metadata: Metadata = {
  title: "Talent Fund 2026 Final Shortlist",
  description:
    "Find your name on the Nigeria 2.0 Talent Fund 2026 final shortlist, confirm your details and join the shortlisted applicants' WhatsApp group.",
  alternates: { canonical: "/talentnigeria20/shortlist" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

const fmt = (n: number) => n.toLocaleString("en-US");

export default function ShortlistPage() {
  const groups = groupByState(shortlist, shortlistTracks);
  const byTrack = shortlistTracks.map((t) => ({
    track: t,
    count: shortlist.filter((e) => e.track === t).length,
  }));

  return (
    <>
      <PageHero
        eyebrow="Nigeria 2.0 Talent Fund 2026"
        title={
          <>
            The final <span className="text-gold">shortlist</span>
          </>
        }
        lead={`${fmt(shortlist.length)} young Nigerians from ${groups.length - 1} states and the FCT have been shortlisted for Skills, Jobs and Capital. Find your name, confirm your details and join the WhatsApp group for further instructions.`}
      >
        <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="shortlist-stats">
          <div className="col-span-2 rounded-2xl border border-gold/40 bg-gold/10 p-5 sm:col-span-1">
            <dt className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Shortlisted</dt>
            <dd className="mt-1 font-display text-5xl leading-none">{fmt(shortlist.length)}</dd>
          </div>
          {byTrack.map((t) => (
            <div key={t.track} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <dt className="text-xs font-semibold tracking-[0.18em] text-mist uppercase">{t.track}</dt>
              <dd className="mt-1 font-display text-4xl leading-none">{fmt(t.count)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-mist">
          Final list published <time dateTime={shortlistMeta.publishedIso}>{shortlistMeta.published}</time>.
        </p>
      </PageHero>

      <section aria-label="Find your name" className="surface-light bg-ivory py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-8">
              <ShortlistFinder />
            </div>
            <aside className="lg:col-span-4" aria-labelledby="how-title">
              <div className="space-y-4 lg:sticky lg:top-28">
                <div className="rounded-3xl bg-navy-950 p-7 text-white">
                  <h2 id="how-title" className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                    How it works
                  </h2>
                  <ol className="mt-5 space-y-5">
                    {[
                      ["Find your name", "Search by any part of your name, in any order."],
                      [
                        "Confirm your details",
                        "Choose the talent option and state you applied with. They must match the shortlist.",
                      ],
                      [
                        "Join the WhatsApp group",
                        "The group link appears once your details match. Instructions are shared there.",
                      ],
                    ].map(([title, body], i) => (
                      <li key={title} className="flex gap-4">
                        <span className="font-display text-3xl leading-none text-gold">{i + 1}</span>
                        <span>
                          <span className="block font-semibold">{title}</span>
                          <span className="mt-1 block text-sm text-mist">{body}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="rounded-3xl border border-line bg-white p-7">
                  <h2 className="flex items-center gap-2 font-semibold text-navy-950">
                    <ShieldCheck aria-hidden="true" className="size-5 text-gold-ink" /> Free, always
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    The Talent Fund never asks shortlisted applicants for payment. Use only the group link on
                    this page. Questions:{" "}
                    <a href={`mailto:${contact.email}`} className="font-semibold text-navy-700 underline">
                      {contact.email}
                    </a>
                    {contact.phone && <> or {contact.phone}</>}.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section
        id="full-list"
        aria-labelledby="list-title"
        className="scroll-mt-24 bg-white py-12 sm:py-16 lg:py-20"
      >
        <Container>
          <p className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.24em] text-gold-ink uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            {fmt(shortlist.length)} names
          </p>
          <h2 id="list-title" className="mt-4 font-display text-4xl text-navy-950 sm:text-5xl">
            The full shortlist by state
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Open your state to see every shortlisted name by talent option. Then use{" "}
            <a
              href="#find-your-name"
              className="inline-flex items-center gap-1 font-semibold text-navy-700 underline"
            >
              <Search aria-hidden="true" className="size-3.5" /> Find your name
            </a>{" "}
            to confirm your details and join the group.
          </p>

          <ul className="mt-10 grid gap-3 md:grid-cols-2" data-testid="shortlist-states">
            {groups.map((g) => (
              <li key={g.state} id={`state-${slugify(g.state)}`} className="min-w-0">
                <details className="group rounded-2xl border border-line bg-ivory open:bg-white open:shadow-[0_20px_50px_-30px_rgba(7,26,51,0.35)]">
                  <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-2xl text-navy-950">{g.state}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {g.tracks.map((t) => `${t.track} ${t.names.length}`).join(" · ")}
                      </span>
                    </span>
                    <span className="rounded-full bg-navy-950 px-3 py-1 text-sm font-semibold text-gold">
                      {fmt(g.total)}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-5 text-navy-700 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="grid gap-5 border-t border-line px-5 py-5">
                    {g.tracks
                      .filter((t) => t.names.length > 0)
                      .map((t) => (
                        <div key={t.track}>
                          <h3 className="flex items-baseline justify-between gap-3 text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">
                            {t.track}
                            <span className="font-normal tracking-normal text-muted normal-case">
                              {trackSummary[t.track]}
                            </span>
                          </h3>
                          <ol className="mt-2 grid gap-x-6 sm:grid-cols-2">
                            {t.names.map((n, i) => (
                              <li
                                key={`${n}-${i}`}
                                className="border-b border-line/70 py-1.5 text-sm break-words text-navy-950"
                              >
                                {n}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
