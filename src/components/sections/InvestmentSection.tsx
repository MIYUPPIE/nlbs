import { ArrowLeftRight } from "lucide-react";
import { investment } from "@/data/content";
import { formatStat, statById } from "@/data/event";
import { illustration } from "@/data/illustrations";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionImage } from "@/components/ui/SectionImage";
import { TargetBadge } from "@/components/ui/TargetBadge";

export function InvestmentSection({ cta = true }: { cta?: boolean }) {
  const target = statById("investment");
  const { enterprise, enablers, capital } = investment.groups;

  return (
    <Section tone="dark" id="investment" labelledBy="investment-title">
      <div aria-hidden="true" className="bg-grid mask-fade-center absolute inset-0 opacity-70" />
      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <SectionHeading
              id="investment-title"
              tone="dark"
              eyebrow="Capital"
              title={investment.heading}
              lead={investment.lead}
            />
            <div
              data-reveal
              className="mt-10 rounded-3xl border border-gold/30 bg-navy-950/60 p-8 backdrop-blur-sm"
            >
              <TargetBadge kind={target.kind} />
              <p className="mt-4 font-display text-6xl leading-none text-gold sm:text-7xl">
                {formatStat(target)}
              </p>
              <p className="mt-3 text-lg font-semibold text-white">{target.label}</p>
              <p className="mt-2 text-sm text-mist">
                A target the summit is working toward. It is not a record of commitments already made.
              </p>
            </div>
            {cta && (
              <GoldButton href="/investment" size="lg" className="mt-10">
                Explore Investment Opportunities
              </GoldButton>
            )}
          </div>

          <div className="lg:col-span-6" data-reveal>
            <SectionImage
              image={illustration("investment")}
              className="mb-10 aspect-[16/9] border border-white/10"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
            <h3 className="text-sm font-semibold tracking-[0.2em] text-white uppercase">
              Structured connections between
            </h3>
            <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
              <div className="space-y-6">
                {[enterprise, enablers].map((g) => (
                  <PartyGroup key={g.label} label={g.label} items={g.items} />
                ))}
              </div>
              <div className="flex h-full flex-col items-center justify-center">
                <span
                  aria-hidden="true"
                  className="w-px flex-1 bg-gradient-to-b from-transparent via-gold/50 to-transparent"
                />
                <span className="my-3 flex size-10 items-center justify-center rounded-full border border-gold/50 bg-navy-950 text-gold">
                  <ArrowLeftRight aria-hidden="true" className="size-4" />
                  <span className="sr-only">connected with</span>
                </span>
                <span
                  aria-hidden="true"
                  className="w-px flex-1 bg-gradient-to-b from-transparent via-gold/50 to-transparent"
                />
              </div>
              <PartyGroup label={capital.label} items={capital.items} accent />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function PartyGroup({ label, items, accent = false }: { label: string; items: string[]; accent?: boolean }) {
  return (
    <div>
      <p className="mb-3 text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">{label}</p>
      <ul className="space-y-3">
        {items.map((p) => (
          <li
            key={p}
            className={
              accent
                ? "rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-3.5 text-sm font-medium text-white sm:text-base"
                : "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-medium text-white sm:text-base"
            }
          >
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
