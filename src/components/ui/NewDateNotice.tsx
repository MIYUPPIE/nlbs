import { Megaphone } from "lucide-react";
import { event } from "@/data/event";
import { cn } from "@/lib/utils";

const r = event.reschedule;

/** Gold "New date" pill, placed next to the summit date wherever it is shown on navy. */
export function NewDateBadge({ className }: { className?: string }) {
  return (
    <span
      data-testid="new-date-badge"
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-gold px-2 py-0.5 text-[0.6rem] leading-none font-bold tracking-[0.16em] whitespace-nowrap text-navy-950 uppercase",
        className,
      )}
    >
      {r.label}
    </span>
  );
}

/**
 * The convener's date change (flyer of 21 Nov 2026), on a navy surface.
 * `full` is the homepage hero announcement; `inline` is the one-line note
 * under the date strip on inner pages.
 */
export function NewDateNotice({
  variant = "full",
  className,
}: {
  variant?: "full" | "inline";
  className?: string;
}) {
  const moved = (
    <>
      Moved from <s className="decoration-gold/70">{r.previousDisplay}</s>.
    </>
  );

  if (variant === "inline") {
    return (
      <p data-testid="new-date-notice" className={cn("text-sm text-mist", className)}>
        <span className="font-semibold text-gold">{r.label}.</span> {moved} {r.validity}
      </p>
    );
  }

  return (
    <aside
      aria-labelledby="new-date-title"
      data-testid="new-date-notice"
      className={cn(
        "flex gap-4 rounded-2xl border border-gold/40 bg-navy-950/70 p-4 backdrop-blur-md sm:p-5",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold text-navy-950">
        <Megaphone aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <h2 id="new-date-title" className="text-sm font-semibold text-white sm:text-base">
          {r.label}: <time dateTime={event.date.iso}>{event.date.display}</time>
        </h2>
        <p className="mt-1 text-sm text-mist">
          {moved} {r.tagline}
        </p>
        <p className="mt-1 text-sm font-medium text-gold">{r.validity}</p>
      </div>
    </aside>
  );
}
