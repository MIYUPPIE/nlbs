import { audience } from "@/data/audience";
import { statById, formatStat } from "@/data/event";
import { HoverEffect } from "@/components/aceternity/HoverEffect";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AudienceSection() {
  const delegates = statById("delegates");
  return (
    <Section tone="deep" labelledBy="audience-title">
      <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0" />
      <Container className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="audience-title"
            tone="dark"
            eyebrow="Who Will Be in the Room"
            title="Decision makers across the economy, in one room."
          />
          <p className="max-w-xs text-sm text-mist lg:text-right" data-reveal>
            <span className="block font-display text-4xl text-gold">{formatStat(delegates)}</span>
            {delegates.label.toLowerCase()} from six communities.
          </p>
        </div>
        <HoverEffect
          className="-mx-1.5 mt-12"
          items={audience.map((a) => ({ title: a.label, description: a.description, icon: a.icon }))}
        />
      </Container>
    </Section>
  );
}
