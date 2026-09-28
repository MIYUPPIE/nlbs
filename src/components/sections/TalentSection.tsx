import { talent } from "@/data/content";
import { formatStat, statById } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TargetBadge } from "@/components/ui/TargetBadge";

export function TalentSection({ cta = true }: { cta?: boolean }) {
  const target = statById("talent");
  return (
    <Section tone="deep" id="talent" labelledBy="talent-title">
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-40 size-[36rem] rounded-full bg-gold/[0.07] blur-3xl"
      />
      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              id="talent-title"
              tone="dark"
              eyebrow={talent.fundName}
              title={talent.heading}
              lead={talent.lead}
            />
            <ul className="mt-12 grid gap-3 sm:grid-cols-2">
              {talent.focus.map((f) => (
                <li
                  key={f.label}
                  data-reveal
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <Icon name={f.icon} className="size-4.5" />
                  </span>
                  <span className="font-medium text-white">{f.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5" data-reveal>
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-navy-700/60 to-navy-950 p-8 sm:p-10">
              <div>
                <TargetBadge kind={target.kind} />
                <p className="mt-6 font-display text-7xl leading-none text-gold sm:text-8xl">
                  {formatStat(target)}
                </p>
                <p className="mt-4 text-xl font-semibold text-white">young Nigerians</p>
                <p className="mt-2 text-mist">
                  The {talent.fundName} target. Programme details will be published as they are confirmed.
                </p>
              </div>
              {cta && (
                <GoldButton href="/talent" size="lg" className="mt-10 self-start">
                  Talent &amp; Skills Initiative
                </GoldButton>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
