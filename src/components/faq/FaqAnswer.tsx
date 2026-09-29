import { linkify } from "@/lib/faq";

/** Answer text with URLs and emails turned into links. Server- and client-safe. */
export function FaqAnswer({ text }: { text: string }) {
  return (
    <>
      {linkify(text).map((p, i) =>
        p.type === "text" ? (
          <span key={i}>{p.value}</span>
        ) : p.type === "url" ? (
          <a
            key={i}
            href={p.value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium break-all text-navy-700 underline decoration-gold/60 underline-offset-4 hover:decoration-navy-700"
          >
            {p.value.replace(/^https?:\/\//, "")}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <a
            key={i}
            href={`mailto:${p.value}`}
            className="font-medium break-all text-navy-700 underline decoration-gold/60 underline-offset-4 hover:decoration-navy-700"
          >
            {p.value}
          </a>
        ),
      )}
    </>
  );
}
