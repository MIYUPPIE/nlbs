import Image from "next/image";
import { illustrations } from "@/data/illustrations";
import { photos } from "@/data/photos";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { PhotoCredit } from "@/components/ui/PhotoCredit";
import { Section } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Photo Credits",
  description: "Photographers, licences and sources for every photograph on the Nigeria 2.0 website.",
  path: "/credits",
});

/**
 * Attribution for every synced photo, in one place. The images render without
 * captions on the site, so this page is where CC BY and CC BY-SA credit lives;
 * the footer links here from every page.
 */
export default function CreditsPage() {
  return (
    <>
      <PageHero
        eyebrow="Photo credits"
        title="The photographers behind these pictures."
        lead="Every photograph on this site is real and used under a free licence. None shows Nigeria 2.0 or its 2025 edition: they show the venue, Lagos, and other Nigerian conferences. AI-generated illustrations are listed separately below."
        showEvent={false}
      />
      <Section tone="white" labelledBy="credits-title">
        <Container>
          <h2 id="credits-title" className="font-display text-3xl text-navy-950">
            All photographs
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <li key={p.id} id={p.id} className="overflow-hidden rounded-3xl border border-line bg-ivory">
                <div className="relative aspect-[4/3] bg-navy-950">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2 p-6">
                  <p className="leading-snug font-medium text-navy-950">{p.caption}</p>
                  <PhotoCredit photo={p} className="text-sm text-muted [&_a]:text-gold-ink" />
                  <p className="text-xs text-muted">Resized and converted to WebP for this site.</p>
                </div>
              </li>
            ))}
          </ul>

          <h2 id="illustrations-title" className="mt-16 font-display text-3xl text-navy-950">
            AI-generated illustrations
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            These images were made with an AI image generator. They illustrate ideas, not real people, places
            or events.
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {illustrations.map((i) => (
              <li
                key={i.id}
                id={i.id}
                data-ai-generated="true"
                className="overflow-hidden rounded-3xl border border-line bg-ivory"
              >
                <div className="relative aspect-[4/3] bg-navy-950">
                  <Image
                    src={i.src}
                    alt={i.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2 p-6">
                  <p className="leading-snug font-medium text-navy-950">{i.description}</p>
                  <p className="text-sm text-muted">
                    AI-generated with {i.generator}, {i.createdOn}.
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
