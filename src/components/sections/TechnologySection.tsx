import { technologyAreas } from "@/data/content";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/BentoGrid";
import { Container } from "@/components/ui/Container";
import { GoldButton } from "@/components/ui/GoldButton";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Bento layout: 2+1, 1+1+1, 2+1 (the last "1" is the exhibition tile).
const spans = ["md:col-span-2", "md:col-span-1", "md:col-span-1", "md:col-span-1", "md:col-span-2"];

/**
 * Decorative tile header: dot matrix, a gold hairline and the area's icon
 * at large scale. Deliberately abstract so it cannot be read as data.
 */
function TileHeader({ icon }: { icon: IconName }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-20 overflow-hidden rounded-xl bg-navy-950 md:h-full md:min-h-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(rgb(168_179_199/0.18)_1px,transparent_1px)] [background-size:14px_14px]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <Icon
        name={icon}
        strokeWidth={1}
        className="absolute -right-3 -bottom-6 size-28 text-gold/25 transition-[color,transform] duration-500 group-hover/bento:-translate-y-1 group-hover/bento:text-gold/45"
      />
    </div>
  );
}

export function TechnologySection({ cta = true }: { cta?: boolean }) {
  return (
    <Section tone="light" id="technology" labelledBy="technology-title">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="technology-title"
            eyebrow="Technology"
            title="Technology for a More Productive Nigeria"
            lead="Practical adoption, not hype. Five areas where technology can lift productivity across businesses, industries and public institutions."
          />
          {cta && (
            <GoldButton href="/technology" variant="outline-dark" className="self-start lg:self-auto">
              Explore Technology
            </GoldButton>
          )}
        </div>
        <BentoGrid className="mt-12 lg:mt-16">
          {technologyAreas.map((area, i) => (
            <BentoGridItem
              key={area.title}
              className={spans[i]}
              header={<TileHeader icon={area.icon} />}
              icon={
                <span className="flex size-10 items-center justify-center rounded-lg bg-navy-950 text-gold">
                  <Icon name={area.icon} className="size-5" />
                </span>
              }
              title={area.title}
              description={area.description}
            />
          ))}
          <li className="flex flex-col justify-between rounded-2xl bg-gold p-6 text-navy-950 md:col-span-1">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase">Innovation Exhibition</p>
            <div>
              <p className="font-display text-3xl leading-tight">See it working on the exhibition floor.</p>
              <GoldButton
                href="/exhibition"
                variant="outline-dark"
                className="mt-6 border-navy-950/40 bg-transparent"
              >
                View the exhibition
              </GoldButton>
            </div>
          </li>
        </BentoGrid>
      </Container>
    </Section>
  );
}
