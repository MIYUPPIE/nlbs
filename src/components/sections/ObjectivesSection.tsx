import { expectedOutcomes, objectives } from "@/data/content";
import { formatStat, statById } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TargetBadge } from "@/components/ui/TargetBadge";

export function ObjectivesSection() {
  return (
    <Section tone="light" labelledBy="objectives-title">
      <Container>
        <SectionHeading
          id="objectives-title"
          eyebrow="Strategic Objectives"
          title="Four objectives. One working day."
          lead="The summit builds on the 2025 edition and moves decisively from dialogue to deals."
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {objectives.map((o, i) => (
            <li key={o.title} className="rounded-3xl border border-line bg-white p-7" data-reveal>
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-navy-950 text-gold">
                  <Icon name={o.icon} className="size-5" />
                </span>
                <span className="font-display text-2xl text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl text-navy-950">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{o.detail}</p>
            </li>
          ))}
        </ul>

        <div className="mt-16 rounded-3xl bg-navy-950 p-8 text-white sm:p-10" data-reveal>
          <h3 className="flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-gold uppercase">
            Expected outcomes <TargetBadge kind="target" />
          </h3>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {expectedOutcomes.map((o) => {
              const stat = o.statId ? statById(o.statId) : null;
              return (
                <li key={o.title} className="bg-navy-950 p-6">
                  {stat && <p className="font-display text-4xl text-gold">{formatStat(stat)}</p>}
                  <p className={stat ? "mt-2 text-sm text-mist" : "text-sm text-mist"}>{o.title}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
