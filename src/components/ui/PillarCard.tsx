import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Pillar } from "@/data/content";
import { Icon } from "@/components/ui/Icon";

export function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  return (
    <article
      data-reveal
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white p-8 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_30px_70px_-35px_rgba(7,26,51,0.45)] sm:p-10"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100"
      />
      <div className="flex items-start justify-between">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-navy-950 text-gold">
          <Icon name={pillar.icon} className="size-6" />
        </span>
        {/* Decorative watermark numeral, rendered as CSS content so it is not read as text. */}
        <span
          aria-hidden="true"
          data-index={String(index + 1).padStart(2, "0")}
          className="font-display text-5xl leading-none text-navy-950/10 before:content-[attr(data-index)]"
        />
      </div>
      <p className="mt-10 text-xs font-semibold tracking-[0.24em] text-gold-ink uppercase">{pillar.label}</p>
      <h3 className="mt-3 font-display text-3xl leading-tight text-navy-950">{pillar.title}</h3>
      <p className="mt-4 flex-1 leading-relaxed text-muted">{pillar.body}</p>
      <Link
        href={pillar.href}
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-950 after:absolute after:inset-0 hover:text-gold-ink"
      >
        Explore {pillar.label}
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </article>
  );
}
