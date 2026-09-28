import Image from "next/image";
import { ArrowUpRight, UserRound } from "lucide-react";
import type { Speaker } from "@/data/speakers";

/**
 * Confirmed speakers show full details and links. Placeholders show the
 * card structure with an explicit "to be announced" label so no unverified
 * name is presented as real.
 */
export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const confirmed = speaker.confirmed;
  return (
    <article
      data-reveal
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-[border-color,box-shadow] duration-300 hover:border-gold/60 hover:shadow-[0_24px_60px_-35px_rgba(7,26,51,0.5)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-navy-950">
        {confirmed && speaker.photo ? (
          <Image
            src={speaker.photo}
            alt={`Portrait of ${speaker.name}`}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className="object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-70" />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-700/60 to-transparent"
            />
            <UserRound
              aria-hidden="true"
              strokeWidth={1}
              className="relative size-16 text-white/20 transition-colors duration-500 group-hover:text-gold/40 sm:size-24"
            />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-navy-950/80 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.18em] text-gold uppercase backdrop-blur sm:top-4 sm:left-4 sm:px-3 sm:text-[0.65rem]">
          {speaker.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {confirmed ? (
          <>
            <h3 className="text-base font-semibold text-navy-950 sm:text-lg">{speaker.name}</h3>
            <p className="mt-1 text-xs text-muted sm:text-sm">{speaker.role}</p>
            <p className="text-sm font-medium text-navy-700">{speaker.organisation}</p>
            {speaker.links && speaker.links.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3">
                {speaker.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gold-ink hover:text-navy-950"
                    >
                      {link.label}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold text-navy-950 sm:text-lg">{speaker.name}</h3>
            <p className="mt-1 text-xs text-muted sm:text-sm">{speaker.role}</p>
            <p className="text-xs text-muted sm:text-sm">{speaker.organisation}</p>
            <p className="mt-3 text-[0.65rem] font-semibold tracking-[0.16em] text-gold-ink uppercase sm:mt-4 sm:text-xs">
              To be announced
            </p>
          </>
        )}
      </div>
    </article>
  );
}
