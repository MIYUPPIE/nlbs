import { ArrowUpRight } from "lucide-react";
import { displayName, type Speaker } from "@/data/speakers";

/**
 * Name, role, bio and sources: shared by the profile modal and the profiles
 * section on /speakers (the no-JS fallback), so both always say the same.
 */
export function SpeakerProfileBody({
  speaker: s,
  headingId,
  as: Heading = "h3",
}: {
  speaker: Speaker;
  headingId: string;
  as?: "h2" | "h3";
}) {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">{s.category}</p>
      <Heading id={headingId} className="mt-2 font-display text-3xl leading-tight text-navy-950 sm:text-4xl">
        {displayName(s)}
      </Heading>
      <p className="mt-2 font-medium text-navy-700">{[s.role, s.organisation].filter(Boolean).join(", ")}</p>
      {s.tagline && <p className="mt-1 text-sm text-muted">{s.tagline}</p>}
      <div className="mt-6 space-y-4 leading-relaxed text-ink">
        {(s.bio ?? []).map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      <div className="mt-8 border-t border-line pt-5 text-xs text-muted">
        {s.sources && s.sources.length > 0 ? (
          <>
            <p className="font-semibold tracking-[0.16em] text-navy-950 uppercase">Sources</p>
            <ul className="mt-2 space-y-1.5">
              {s.sources.map((src) => (
                <li key={src.url}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1 text-gold-ink underline-offset-2 hover:text-navy-950 hover:underline"
                  >
                    {src.title}
                    <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Profile supplied to the summit by the speaker.</p>
        )}
      </div>
    </>
  );
}
