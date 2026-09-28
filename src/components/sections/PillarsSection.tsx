import { pillars } from "@/data/content";
import { event } from "@/data/event";
import { Container } from "@/components/ui/Container";
import { PillarCard } from "@/components/ui/PillarCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PillarsSection() {
  return (
    <Section tone="white" labelledBy="pillars-title">
      <Container>
        <SectionHeading
          id="pillars-title"
          eyebrow="Three Strategic Pillars"
          title={
            <>
              Capital. Talent. <span className="text-gold-ink">Technology.</span>
            </>
          }
          lead={`The levers ${event.shortName} brings together to move Nigeria's economy from potential to performance.`}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:mt-16">
          {pillars.map((p, i) => (
            <PillarCard key={p.id} pillar={p} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
