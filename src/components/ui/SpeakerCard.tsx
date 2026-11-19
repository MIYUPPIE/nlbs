import { Fragment } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Speaker } from "@/data/speakers";
import { profileHref } from "@/components/speakers/profile-link";

/**
 * One speaker or guest of honour: portrait, category, name, role. The whole
 * card opens the speaker's profile modal (a stretched link; without JS it goes
 * to the profile on /speakers).
 */
export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <article
      data-reveal
      data-speaker={speaker.id}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-[border-color,box-shadow] duration-300 hover:border-gold/60 hover:shadow-[0_24px_60px_-35px_rgba(7,26,51,0.5)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-navy-950">
        <Image
          src={speaker.photo.src}
          alt={`Portrait of ${speaker.name}`}
          fill
          sizes="(min-width: 1024px) 22vw, 45vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/50 to-transparent"
        />
        <span className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] rounded-full bg-navy-950/85 px-2.5 py-1 text-[0.6rem] leading-tight font-semibold tracking-[0.14em] text-gold uppercase backdrop-blur sm:top-4 sm:left-4 sm:px-3 sm:text-[0.65rem]">
          {speaker.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {speaker.honorific && (
          <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-gold-ink uppercase sm:text-xs">
            {speaker.honorific}
          </p>
        )}
        {/* Hyphenated words ("Sanwo-Olu") stay whole instead of wrapping at the hyphen. */}
        <h3 className="text-base font-semibold text-navy-950 sm:text-lg">
          {speaker.name.split(" ").map((word, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              {word.includes("-") ? <span className="whitespace-nowrap">{word}</span> : word}
            </Fragment>
          ))}
        </h3>
        {speaker.role && <p className="mt-1 text-xs text-muted sm:text-sm">{speaker.role}</p>}
        {speaker.organisation && (
          <p className="mt-0.5 text-xs font-medium text-navy-700 sm:text-sm">{speaker.organisation}</p>
        )}
        {speaker.bio && (
          <a
            href={profileHref(speaker.id)}
            data-profile-id={speaker.id}
            aria-label={`View profile: ${speaker.name}`}
            className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-gold-ink after:absolute after:inset-0 after:rounded-2xl hover:text-navy-950 focus-visible:after:outline-2 focus-visible:after:outline-gold sm:text-sm"
          >
            View profile
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </a>
        )}
      </div>
    </article>
  );
}
