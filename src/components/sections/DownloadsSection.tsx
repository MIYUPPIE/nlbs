import Image from "next/image";
import { Download as DownloadIcon, Eye } from "lucide-react";
import { downloads } from "@/data/downloads";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function DownloadsSection({ ids, title = "Summit documents" }: { ids?: string[]; title?: string }) {
  const items = ids ? downloads.filter((d) => ids.includes(d.id)) : downloads;
  return (
    <Section tone="white" id="downloads" labelledBy="downloads-title">
      <Container>
        <SectionHeading
          id="downloads-title"
          eyebrow="Downloads"
          title={title}
          lead="Official documents from the summit secretariat, free to download and share."
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <li key={d.id} data-reveal>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ivory transition-[border-color,box-shadow] hover:border-gold/60 hover:shadow-[0_24px_60px_-35px_rgba(7,26,51,0.5)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-navy-950">
                  <Image
                    src={d.thumbnail}
                    alt={`Preview of the ${d.title}`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-navy-950/85 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-gold backdrop-blur">
                    {d.format}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl text-navy-950">{d.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{d.description}</p>
                  <p className="mt-4 text-xs text-muted">
                    {d.format} · {d.size}
                    {d.pages ? ` · ${d.pages} page${d.pages > 1 ? "s" : ""}` : ""}
                  </p>
                  <div className="mt-5 flex gap-3">
                    <a
                      href={d.href}
                      download
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-gold px-4 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-bright"
                    >
                      <DownloadIcon aria-hidden="true" className="size-4" />
                      Download
                      <span className="sr-only">{d.title}</span>
                    </a>
                    <a
                      href={d.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-navy-950/20 px-4 text-sm font-semibold text-navy-950 transition-colors hover:border-navy-950"
                    >
                      <Eye aria-hidden="true" className="size-4" />
                      View
                      <span className="sr-only">{d.title} (opens in a new tab)</span>
                    </a>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
