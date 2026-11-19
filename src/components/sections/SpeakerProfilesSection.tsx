import Image from "next/image";
import { displayName } from "@/data/speakers";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { orderedSpeakers } from "@/components/sections/SpeakersSection";

/** Full written profiles, for the speakers who supplied one. */
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
                <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">{s.category}</p>
                <h3
                  id={`profile-${s.id}-name`}
                  className="mt-2 font-display text-3xl text-navy-950 sm:text-4xl"
                >
                  {displayName(s)}
                </h3>
                <p className="mt-2 font-medium text-navy-700">
                  {[s.role, s.organisation].filter(Boolean).join(", ")}
                </p>
                {s.tagline && <p className="mt-1 text-sm text-muted">{s.tagline}</p>}
                <div className="mt-6 space-y-4 leading-relaxed text-ink">
                  {(s.bio ?? []).map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
