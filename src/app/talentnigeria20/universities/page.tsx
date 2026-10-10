import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { talentApplication as t } from "@/data/talent-application";
import { universityProgramme as p } from "@/data/universities";
import { contact } from "@/data/event";
import { PageHero } from "@/components/layout/PageHero";
import { UniversitiesBoard } from "@/components/talent/UniversityStats";
import { Container } from "@/components/ui/Container";

/**
 * Talent Fund university nominations. Unlisted like /sponsors: shared with
 * invited universities directly, not linked from the site, not in the
 * sitemap, not indexed (tests/universities.test.ts).
 */
export const metadata: Metadata = {
  title: "Talent Fund: University Nominations",
  description: "How invited universities nominate their students to the Nigeria 2.0 Talent Fund 2026.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function UniversitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Nigeria 2.0 Talent Fund 2026"
        title="University nominations"
        lead="We are inviting universities to put their best final-year students and recent graduates forward for skills, jobs and capital. Students apply themselves through their university's link. No payment is required from universities or students."
      />
      <section aria-labelledby="how-title" className="surface-light bg-ivory py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <h2 id="how-title" className="font-display text-4xl text-navy-950">
                What we ask of your university
              </h2>
              <ol className="mt-8 space-y-5">
                {p.asks.map((a, i) => (
                  <li key={a.title} className="flex gap-5 rounded-2xl border border-line bg-white p-6">
                    <span className="font-display text-3xl text-gold-ink">{i + 1}</span>
                    <span>
                      <span className="block font-semibold text-navy-950">{a.title}</span>
                      <span className="mt-1 block text-sm text-muted">{a.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <aside className="lg:col-span-5" aria-labelledby="timeline-title">
              <div className="rounded-3xl bg-navy-950 p-8 text-white">
                <h2
                  id="timeline-title"
                  className="text-xs font-semibold tracking-[0.22em] text-gold uppercase"
                >
                  Timeline
                </h2>
                <dl className="mt-6 space-y-4">
                  {p.timeline.map((x) => (
                    <div
                      key={x.label}
                      className="flex justify-between gap-4 border-b border-white/10 pb-4 last:border-0"
                    >
                      <dt className="text-mist">{x.label}</dt>
                      <dd className="text-right font-semibold">{x.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </section>
      <section aria-labelledby="offer-title" className="bg-white py-12 sm:py-16 lg:py-20">
        <Container>
          <h2 id="offer-title" className="font-display text-4xl text-navy-950">
            What your students can get
          </h2>
          <p className="mt-3 max-w-2xl text-muted">{t.lead}</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {t.allocation.map((a) => (
              <li key={a.label} className="rounded-2xl border border-line p-6">
                <p className="font-display text-4xl text-navy-950">{a.value.toLocaleString("en-NG")}</p>
                <p className="mt-1 font-semibold text-gold-ink">{a.label}</p>
                <p className="mt-2 text-sm text-muted">{a.detail}</p>
              </li>
            ))}
          </ul>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {t.eligibility.map((e) => (
              <li key={e} className="flex gap-3 text-sm text-muted">
                <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                {e}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section aria-labelledby="board-title" className="surface-light bg-ivory py-12 sm:py-16 lg:py-20">
        <Container>
          <h2 id="board-title" className="font-display text-4xl text-navy-950">
            Invited universities
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Open your university&apos;s page for its student link and the confirmation form. Status and
            application numbers come straight from our system. &quot;Confirmed&quot; means we have checked the
            university&apos;s signed confirmation.
          </p>
          <div className="mt-8">
            <UniversitiesBoard />
          </div>
          <p className="mt-8 text-sm text-muted">
            Not on the list? Your students can still apply at{" "}
            <a href="/talentnigeria20/" className="text-navy-700 underline">
              /talentnigeria20
            </a>{" "}
            and name your university, or write to{" "}
            <a href={`mailto:${contact.email}`} className="text-navy-700 underline">
              {contact.email}
            </a>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
