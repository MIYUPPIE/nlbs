import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { talentApplication as t } from "@/data/talent-application";
import { studentLink, universities, universityBySlug, universityProgramme as p } from "@/data/universities";
import { contact } from "@/data/event";
import { siteUrl } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { CopyLink } from "@/components/talent/CopyLink";
import { UniversityConfirmForm } from "@/components/talent/UniversityConfirmForm";
import { UniversityLiveStatus } from "@/components/talent/UniversityStats";
import { Container } from "@/components/ui/Container";

/** One page per invited university, built at export time. Unlisted (see ../page.tsx). */
export const dynamicParams = false;

export function generateStaticParams() {
  return universities.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const u = universityBySlug((await params).slug);
  return {
    title: u ? `Talent Fund: ${u.name}` : "Talent Fund",
    description: u ? `How ${u.name} nominates students to the Nigeria 2.0 Talent Fund 2026.` : undefined,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

export default async function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
  const u = universityBySlug((await params).slug);
  if (!u) notFound();
  const link = studentLink(siteUrl, u.slug);

  return (
    <>
      <PageHero
        eyebrow="Nigeria 2.0 Talent Fund 2026 · University nomination"
        title={u.name}
        lead={`${u.name} is invited to put its best students forward for the Talent Fund: training, jobs and capital for young Nigerians. Students apply themselves using the link below, so every application is theirs and every number on this page is real.`}
      />
      <section
        aria-label={`${u.short} student link and live numbers`}
        className="bg-navy-950 py-12 text-white sm:py-16"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                Share with your students
              </h2>
              <p className="mt-3 text-mist">
                Students who apply through this link are counted for {u.short}. The form takes about 4 minutes
                and closes on {t.deadline} (extended from {t.extension.previousDeadline}).
              </p>
              <div className="mt-6">
                <CopyLink url={link} label={`Talent Fund application link for ${u.short} students`} />
              </div>
            </div>
            <div className="lg:col-span-5">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                {u.short} right now
              </h2>
              <div className="mt-4">
                <UniversityLiveStatus slug={u.slug} short={u.short} />
              </div>
            </div>
          </div>
        </Container>
      </section>
      <section aria-labelledby="ask-title" className="surface-light bg-ivory py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-8">
              <UniversityConfirmForm university={u} />
            </div>
            <aside className="space-y-4 lg:col-span-4" aria-labelledby="ask-title">
              <div className="rounded-3xl border border-line bg-white p-7">
                <h2 id="ask-title" className="font-semibold text-navy-950">
                  What we ask of {u.short}
                </h2>
                <ul className="mt-4 space-y-3">
                  {p.asks.map((a) => (
                    <li key={a.title} className="flex gap-3 text-sm text-muted">
                      <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                      <span>
                        <strong className="text-navy-950">{a.title}.</strong> {a.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-navy-950 p-7 text-white">
                <h2 className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Timeline</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  {p.timeline.map((x) => (
                    <div key={x.label}>
                      <dt className="text-mist">{x.label}</dt>
                      <dd className="font-semibold">{x.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-3xl border border-line bg-white p-7">
                <h2 className="font-semibold text-navy-950">What students can get</h2>
                <ul className="mt-4 space-y-3">
                  {t.allocation.map((a) => (
                    <li key={a.label} className="text-sm text-muted">
                      <strong className="text-navy-950">
                        {a.value.toLocaleString("en-NG")} {a.label}:
                      </strong>{" "}
                      {a.detail}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted">
                  No payment is required. Questions:{" "}
                  <a href={`mailto:${contact.email}`} className="text-navy-700 underline">
                    {contact.email}
                  </a>
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
