import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { orderedSpeakers } from "@/data/speakers";
import { SpeakerProfileBody } from "@/components/speakers/SpeakerProfileBody";

/**
 * Every speaker's full profile, in page. The modals show the same content;
 * this is what links reach without JavaScript, and what search engines read.
 */
export function SpeakerProfilesSection() {
  const withBio = orderedSpeakers().filter((s) => s.bio && s.bio.length > 0);
  if (withBio.length === 0) return null;
  return (
    <Section tone="light" id="profiles" labelledBy="profiles-title">
      <Container>
        <SectionHeading id="profiles-title" eyebrow="Profiles" title="Speaker profiles" />
        <div className="mt-12 space-y-8 lg:mt-16">
          {withBio.map((s) => (
            <article
              key={s.id}
              id={`profile-${s.id}`}
              aria-labelledby={`profile-${s.id}-name`}
              data-reveal
              className="grid scroll-mt-28 gap-8 rounded-3xl border border-line bg-white p-6 sm:p-8 md:grid-cols-12 lg:p-10"
            >
              <div className="md:col-span-4 lg:col-span-3">
                <Image
                  src={s.photo.src}
                  alt={`Portrait of ${s.name}`}
                  width={s.photo.width}
                  height={s.photo.height}
                  sizes="(min-width: 768px) 25vw, 90vw"
                  className="aspect-[4/5] w-full max-w-xs rounded-2xl object-cover object-top"
                />
              </div>
              <div className="md:col-span-8 lg:col-span-9">
                <SpeakerProfileBody speaker={s} headingId={`profile-${s.id}-name`} />
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
