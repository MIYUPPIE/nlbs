import { CalendarClock, CircleCheck, MapPin } from "lucide-react";
import { talentApplication as t } from "@/data/talent-application";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TargetBadge } from "@/components/ui/TargetBadge";

export function TalentApplicationSection() {
  return (
    <>
      <Section tone="light" id="talent-fund-breakdown" labelledBy="fund-breakdown-title">
        <Container>
          <SectionHeading
            id="fund-breakdown-title"
            eyebrow="How the 10,000 breaks down"
            title="Skill. Place. Fund."
            lead="Three pathways, one fund. Every year, delivered online and through six physical hubs."
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {t.allocation.map((a) => (
              <li key={a.label} data-reveal className="rounded-3xl border border-line bg-white p-8">
                <TargetBadge kind="target" tone="light" />
                <p className="mt-5 font-display text-6xl leading-none text-navy-950">
                  {a.value.toLocaleString("en-US")}
                </p>
                <p className="mt-3 text-lg font-semibold text-navy-950">{a.label}</p>
                <p className="mt-1 text-sm text-muted">{a.detail}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div data-reveal className="rounded-3xl bg-navy-950 p-7 text-white">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                <MapPin aria-hidden="true" className="size-4" /> Six hubs
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {t.hubs.map((h) => (
                  <li key={h} className="rounded-full border border-white/15 px-3 py-1.5 text-sm">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal className="rounded-3xl border border-line bg-white p-7">
              <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
                Inclusion targets
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {t.inclusion.map((h) => (
                  <li key={h} className="rounded-full bg-ivory px-3 py-1.5 text-sm font-medium text-navy-950">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="white" id="apply" labelledBy="apply-title">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <SectionHeading id="apply-title" eyebrow="Talent Fund 2026" title={t.heading} lead={t.lead} />
                <dl className="mt-8 grid grid-cols-2 gap-3" data-reveal>
                  <div className="rounded-2xl bg-ivory p-5">
                    <dt className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-gold-ink uppercase">
                      <CalendarClock aria-hidden="true" className="size-4" /> Portal opens
                    </dt>
                    <dd className="mt-2 font-display text-2xl text-navy-950">{t.portalOpens}</dd>
                  </div>
                  <div className="rounded-2xl bg-navy-950 p-5 text-white">
                    <dt className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-gold uppercase">
                      <CalendarClock aria-hidden="true" className="size-4" /> Deadline
                    </dt>
                    <dd className="mt-2 font-display text-2xl">
                      <time dateTime={t.deadlineIso}>{t.deadline}</time>
                    </dd>
                  </div>
                </dl>
                <GoldButton href={t.portal} size="lg" className="mt-8">
                  Go to the application portal
                </GoldButton>
                <ul className="mt-8 space-y-3">
                  {t.eligibility.map((e) => (
                    <li key={e} className="flex gap-3 text-sm text-muted">
                      <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="lg:col-span-7">
              <h3 className="text-xs font-semibold tracking-[0.22em] text-gold-ink uppercase">
                Choose one track
              </h3>
              <ul className="mt-5 space-y-4">
                {t.tracks.map((tr) => (
                  <li
                    key={tr.name}
                    data-reveal
                    className="rounded-3xl border border-line bg-ivory p-6 sm:p-7"
                  >
                    <div className="flex items-start gap-5">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy-950 text-gold">
                        <Icon name={tr.icon} className="size-5" />
                      </span>
                      <div>
                        <h4 className="font-display text-3xl text-navy-950">{tr.name}</h4>
                        <p className="mt-1 font-medium text-navy-900">{tr.summary}</p>
                        <p className="mt-3 text-sm text-muted">
                          <span className="font-semibold text-navy-950">For: </span>
                          {tr.forWho}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          <span className="font-semibold text-navy-950">Prepare: </span>
                          {tr.prepare}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div data-reveal className="mt-6 rounded-3xl border border-gold/50 bg-white p-6 sm:p-7">
                <h3 className="font-semibold text-navy-950">Every applicant will need</h3>
                <ul className="mt-4 space-y-3">
                  {t.checklist.map((c) => (
                    <li key={c} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold-ink" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
