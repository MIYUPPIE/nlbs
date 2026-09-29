import Link from "next/link";
import { connection } from "next/server";
import { CalendarClock, CircleCheck, Lock } from "lucide-react";
import { talentApplication as t } from "@/data/talent-application";
import { PageHero } from "@/components/layout/PageHero";
import { TalentApplicationForm } from "@/components/talent/TalentApplicationForm";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/GoldButton";
import { applicationWindow } from "@/lib/talent-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Talent Fund 2026 Application",
  description:
    "Apply to the Nigeria 2.0 Talent Fund 2026: skills, jobs and capital for 10,000 young Nigerians aged 18 to 35. No payment required. Deadline 30 October 2026.",
  path: "/talentnigeria20",
});

/** Request-time window status. Only called after connection(), so never prerendered. */
const currentWindow = () => applicationWindow(Date.now(), process.env.TALENT_APPLICATIONS_OVERRIDE);

export default async function TalentApplicationPage() {
  // Rendered per request so the open/closed state is always current.
  await connection();
  const status = currentWindow();

  return (
    <>
      <PageHero
        eyebrow="Nigeria 2.0 Talent Fund 2026"
        title="Application form"
        lead="We are selecting 10,000 youths for Skills, Jobs and Capital. This form takes about 4 minutes. No payment required."
      />
      <section
        aria-label="Talent Fund application"
        className="surface-light bg-ivory py-12 sm:py-16 lg:py-20"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-8">
              {status === "open" ? (
                <TalentApplicationForm />
              ) : (
                <div className="rounded-3xl border border-line bg-white p-8 sm:p-12">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-navy-950 text-gold">
                    {status === "upcoming" ? (
                      <CalendarClock aria-hidden="true" className="size-6" />
                    ) : (
                      <Lock aria-hidden="true" className="size-6" />
                    )}
                  </span>
                  <h2 className="mt-6 font-display text-4xl text-navy-950">
                    {status === "upcoming"
                      ? `Applications open ${t.portalOpens}`
                      : "Applications for 2026 have closed"}
                  </h2>
                  <p className="mt-3 max-w-lg text-muted">
                    {status === "upcoming"
                      ? `The form will be available here from ${t.portalOpens} until ${t.deadline}. Prepare your 1-minute video and your answers now.`
                      : `The deadline was ${t.deadline}. Shortlisted applicants are being contacted on WhatsApp.`}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href="/talent#apply" className={buttonClasses("gold")}>
                      How to prepare
                    </Link>
                    <Link href="/faq#talent-fund-core-product" className={buttonClasses("outline-dark")}>
                      Talent Fund FAQs
                    </Link>
                  </div>
                </div>
              )}
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
