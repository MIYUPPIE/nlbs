import { exhibitionCategories } from "@/data/content";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/BentoGrid";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ExhibitionSection({ cta = true }: { cta?: boolean }) {
  return (
    <Section tone="white" id="exhibition" labelledBy="exhibition-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                id="exhibition-title"
                eyebrow="Innovation Exhibition"
                title="Where Innovation Meets Opportunity"
                lead="Technology companies, startups and institutions showcase products, platforms and solutions to the leaders who can adopt, fund and scale them."
              />
              {cta && (
                <GoldButton href="/contact?topic=exhibition" size="lg" className="mt-10">
                  Exhibit at Nigeria 2.0
                </GoldButton>
              )}
            </div>
          </div>
          <div className="lg:col-span-8">
            <h3 className="sr-only">Exhibition categories</h3>
            <BentoGrid className="grid-cols-2 md:auto-rows-auto md:grid-cols-3">
              {exhibitionCategories.map((c) => (
                <BentoGridItem
                  key={c.label}
                  className="min-h-36 p-5 sm:p-6"
                  icon={
                    <span className="flex size-10 items-center justify-center rounded-lg bg-navy-950 text-gold transition-colors group-hover/bento:bg-gold group-hover/bento:text-navy-950">
                      <Icon name={c.icon} className="size-5" />
                    </span>
                  }
                  title={c.label}
                />
              ))}
            </BentoGrid>
          </div>
        </div>
      </Container>
    </Section>
  );
}
