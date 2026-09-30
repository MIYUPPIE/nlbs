import { CircleCheck } from "lucide-react";
import { talentApplication as t } from "@/data/talent-application";
import { BOOK_PREORDER } from "@/lib/talent-form";
import { PageHero } from "@/components/layout/PageHero";
import { TalentWindowGate } from "@/components/talent/TalentWindowGate";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Talent Fund 2026 Application",
  description:
    "Apply to the Nigeria 2.0 Talent Fund 2026: skills, jobs and capital for 10,000 young Nigerians aged 18 to 35. Applicants pre-order Advising The Founder first. Deadline 30 October 2026.",
  path: "/talentnigeria20",
});

export default function TalentApplicationPage() {
  return (
    <>
      <PageHero
        eyebrow="Nigeria 2.0 Talent Fund 2026"
        title="Application form"
        lead="We are selecting 10,000 youths for Skills, Jobs and Capital. This form takes about 4 minutes. Before you continue past Section 1, you will pre-order the book Advising The Founder."
      />
      <section
        aria-label="Talent Fund application"
        className="surface-light bg-ivory py-12 sm:py-16 lg:py-20"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-8">
              <TalentWindowGate />
            </div>
            <aside className="lg:col-span-4" aria-labelledby="apply-aside-title">
              <div className="space-y-4 lg:sticky lg:top-28">
                <div className="rounded-3xl bg-navy-950 p-7 text-white">
                  <h2
                    id="apply-aside-title"
                    className="text-xs font-semibold tracking-[0.22em] text-gold uppercase"
                  >
                    Key dates
                  </h2>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div>
                      <dt className="text-mist">Opens</dt>
                      <dd className="mt-0.5 font-display text-2xl">{t.portalOpens}</dd>
                    </div>
                    <div>
                      <dt className="text-mist">Deadline</dt>
                      <dd className="mt-0.5 font-display text-2xl text-gold-bright">
                        <time dateTime={t.deadlineIso}>{t.deadline}</time>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-3xl border border-line bg-white p-7">
                  <h2 className="font-semibold text-navy-950">Before you start</h2>
                  <ul className="mt-4 space-y-3">
                    {[
                      ...t.eligibility,
                      `A paid pre-order of ${BOOK_PREORDER.title} (${BOOK_PREORDER.price}), made with your own email or WhatsApp number`,
                      "Have your 1-minute video link ready",
                      "Jobs track: your CV as a PDF (max 2 MB)",
                    ].map((e) => (
                      <li key={e} className="flex gap-3 text-sm text-muted">
                        <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
