import { pillars } from "@/data/content";
import { event } from "@/data/event";
import { illustration } from "@/data/illustrations";
import { Container } from "@/components/ui/Container";
import { PillarCard } from "@/components/ui/PillarCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionImage } from "@/components/ui/SectionImage";

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
        <SectionImage
          image={illustration("pillars")}
          className="mt-12 aspect-[4/3] sm:aspect-[16/9] lg:mt-16 lg:aspect-[21/9]"
        />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <PillarCard key={p.id} pillar={p} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
