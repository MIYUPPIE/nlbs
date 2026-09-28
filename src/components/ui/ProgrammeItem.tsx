import { Clock, Users } from "lucide-react";
import type { ProgrammeItem as Item } from "@/data/programme";
import { Icon } from "@/components/ui/Icon";

/** Timeline entry used on the /programme page. */
export function ProgrammeItem({ item, index }: { item: Item; index: number }) {
  return (
    <li data-reveal className="relative grid grid-cols-[auto_1fr] gap-x-6 pb-12 last:pb-0 sm:gap-x-10">
      <div className="relative flex flex-col items-center">
        <span className="relative z-10 flex size-12 items-center justify-center rounded-full border border-gold/50 bg-navy-950 text-gold sm:size-14">
          <Icon name={item.icon} className="size-5 sm:size-6" />
        </span>
        <span aria-hidden="true" className="absolute top-12 bottom-0 w-px bg-line sm:top-14" />
      </div>
      <article className="rounded-2xl border border-line bg-white p-6 transition-colors hover:border-gold/60 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
          Format {String(index + 1).padStart(2, "0")}
          {item.access === "selected" && " · By invitation"}
        </p>
        <h3 className="mt-2 font-display text-2xl text-navy-950 sm:text-3xl">{item.title}</h3>
        <p className="mt-3 font-medium text-navy-900">{item.summary}</p>
        <p className="mt-3 leading-relaxed text-muted">{item.detail}</p>
        <dl className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-sm sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2">
            <dt>
              <Clock aria-hidden="true" className="size-4 text-gold-ink" />
              <span className="sr-only">Time</span>
            </dt>
            <dd className="text-muted">{item.time ?? "Time to be announced"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>
              <Users aria-hidden="true" className="size-4 text-gold-ink" />
              <span className="sr-only">Audience</span>
            </dt>
            <dd className="text-muted">{item.audience}</dd>
          </div>
        </dl>
      </article>
    </li>
  );
}
