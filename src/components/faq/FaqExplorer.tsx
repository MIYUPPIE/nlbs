"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronsDownUp, ChevronsUpDown, Link2, MessageCircleQuestion, Plus, Search, X } from "lucide-react";
import { faqAnchor, filterFaq, normalize, type FaqCategory } from "@/lib/faq";
import { FaqAnswer } from "@/components/faq/FaqAnswer";
import { buttonClasses } from "@/components/ui/GoldButton";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/** Wraps matching terms in <mark>. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;
  const norm = normalize(text);
  const ranges: [number, number][] = [];
  for (const t of terms) {
    let i = norm.indexOf(t);
    while (i !== -1) {
      ranges.push([i, i + t.length]);
      i = norm.indexOf(t, i + t.length);
    }
  }
  if (ranges.length === 0) return <>{text}</>;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  const out: React.ReactNode[] = [];
  let pos = 0;
  merged.forEach(([s, e], k) => {
    if (s > pos) out.push(text.slice(pos, s));
    out.push(
      <mark key={k} className="rounded-sm bg-gold/30 px-0.5 text-navy-950">
        {text.slice(s, e)}
      </mark>,
    );
    pos = e;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return <>{out}</>;
}

/**
 * Searchable, categorised FAQ. Items are native <details>, so the page works
 * fully without JavaScript; this component adds search, expand/collapse all,
 * live category counts and opening the item named in the URL hash.
 */
export function FaqExplorer({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [active, setActive] = useState(categories[0]?.id);

  const filtered = useMemo(() => filterFaq(categories, query), [categories, query]);
  const terms = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query]);
  const visible = filtered.flatMap((c) => c.items.map((i) => i.number));
  const total = categories.reduce((n, c) => n + c.items.length, 0);
  const allOpen = visible.length > 0 && visible.every((n) => open.has(n));

  // Open and reveal the question named in the URL hash (#q-19).
  useEffect(() => {
    const openFromHash = () => {
      const m = /^#q-(\d+)$/.exec(window.location.hash);
      if (!m) return;
      const n = Number(m[1]);
      setOpen((prev) => new Set(prev).add(n));
      requestAnimationFrame(() => document.getElementById(faqAnchor(n))?.scrollIntoView({ block: "start" }));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  // Highlight the category currently in view.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    document.querySelectorAll("[data-faq-category]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  const toggle = (n: number, isOpen: boolean) =>
    setOpen((prev) => {
      if (prev.has(n) === isOpen) return prev;
      const next = new Set(prev);
      if (isOpen) next.add(n);
      else next.delete(n);
      return next;
    });

  const counts = new Map(filtered.map((c) => [c.id, c.items.length]));

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Sidebar: search + categories */}
      <aside className="min-w-0 lg:col-span-4" aria-label="Search and browse questions">
        <div className="lg:sticky lg:top-28">
          <div className="relative">
            <label htmlFor="faq-search" className="sr-only">
              Search the FAQ
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
            />
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 101 questions"
              autoComplete="off"
              className="h-13 w-full rounded-full border border-line bg-white pr-11 pl-11 text-base text-ink placeholder:text-muted/80 focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-ivory hover:text-navy-950"
              >
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
          <p aria-live="polite" className="mt-3 px-1 text-sm text-muted">
            {query
              ? `${visible.length} of ${total} questions match`
              : `${total} questions in ${categories.length} categories`}
          </p>

          <nav aria-label="FAQ categories" className="mt-6">
            <ul className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0 lg:flex-col lg:gap-1 lg:overflow-visible">
              {categories.map((c) => {
                const count = counts.get(c.id) ?? 0;
                const isActive = active === c.id && count > 0;
                return (
                  <li key={c.id} className="shrink-0">
                    <a
                      href={`#${c.id}`}
                      aria-disabled={count === 0 || undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:rounded-xl lg:border-transparent lg:py-2.5",
                        isActive
                          ? "border-navy-950 bg-navy-950 text-white lg:border-transparent"
                          : "border-line bg-white text-navy-950 hover:border-gold/60 lg:bg-transparent lg:hover:bg-white",
                        count === 0 && "pointer-events-none opacity-40",
                      )}
                    >
                      <span
                        className={cn(
                          "font-display text-base leading-none",
                          isActive ? "text-gold" : "text-gold-ink",
                        )}
                      >
                        {c.letter}
                      </span>
                      <span className="lg:flex-1">{c.title}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs tabular-nums",
                          isActive ? "bg-white/10 text-white" : "bg-ivory text-muted",
                        )}
                      >
                        {count}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-8 hidden rounded-2xl bg-navy-950 p-6 text-white lg:block">
            <MessageCircleQuestion aria-hidden="true" className="size-6 text-gold" />
            <p className="mt-4 font-display text-2xl leading-tight">Still have a question?</p>
            <p className="mt-2 text-sm text-mist">The summit secretariat will get back to you.</p>
            <Link href="/contact" className={buttonClasses("gold", "md", "mt-5")}>
              Ask the team
            </Link>
          </div>
        </div>
      </aside>

      {/* Questions */}
      <div className="min-w-0 lg:col-span-8">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(visible))}
            disabled={visible.length === 0}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-navy-950 hover:bg-white disabled:opacity-40"
          >
            {allOpen ? (
              <ChevronsDownUp aria-hidden="true" className="size-4 text-gold-ink" />
            ) : (
              <ChevronsUpDown aria-hidden="true" className="size-4 text-gold-ink" />
            )}
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-3xl text-navy-950">No matching questions</p>
            <p className="mt-2 text-muted">Try fewer words, or ask the summit team directly.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => setQuery("")} className={buttonClasses("outline-dark")}>
                Clear search
              </button>
              <Link href="/contact" className={buttonClasses("gold")}>
                Ask a question
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-14">
          {filtered.map((c) => (
            <section key={c.id} id={c.id} data-faq-category aria-labelledby={`${c.id}-title`}>
              <div className="flex items-baseline gap-4 border-b border-line pb-4">
                <span aria-hidden="true" className="font-display text-4xl leading-none text-gold-ink">
                  {c.letter}
                </span>
                <h2 id={`${c.id}-title`} className="font-display text-3xl text-navy-950 sm:text-4xl">
                  {c.title}
                </h2>
                <span className="ml-auto shrink-0 text-xs font-semibold tracking-[0.16em] text-muted uppercase">
                  {c.items.length} {c.items.length === 1 ? "question" : "questions"}
                </span>
              </div>
              <ul className="mt-5 space-y-3">
                {c.items.map((it) => (
                  <li key={it.number} id={faqAnchor(it.number)}>
                    <details
                      open={open.has(it.number)}
                      onToggle={(e) => toggle(it.number, e.currentTarget.open)}
                      className="group rounded-2xl border border-line bg-white transition-colors open:border-gold/60 open:shadow-[0_18px_40px_-30px_rgba(7,26,51,0.45)] hover:border-gold/40"
                    >
                      <summary className="flex cursor-pointer list-none items-start gap-4 p-5 sm:gap-5 sm:p-6 [&::-webkit-details-marker]:hidden">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 w-8 shrink-0 font-display text-lg leading-none text-gold-ink tabular-nums sm:w-9 sm:text-xl"
                        >
                          {pad(it.number)}
                        </span>
                        <span className="min-w-0 flex-1 font-semibold [overflow-wrap:anywhere] text-navy-950 sm:text-lg">
                          <span className="sr-only">Question {it.number}: </span>
                          <Highlight text={it.question} terms={terms} />
                        </span>
                        <span
                          aria-hidden="true"
                          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-navy-950 transition-[transform,background-color,border-color] duration-300 group-open:rotate-45 group-open:border-navy-950 group-open:bg-navy-950 group-open:text-gold"
                        >
                          <Plus className="size-4" />
                        </span>
                      </summary>
                      <div className="pr-5 pb-6 pl-[4.25rem] sm:pr-16 sm:pl-[5rem]">
                        <p className="leading-relaxed [overflow-wrap:anywhere] text-ink/80">
                          <FaqAnswer text={it.answer} />
                        </p>
                        <a
                          href={`#${faqAnchor(it.number)}`}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-navy-950"
                        >
                          <Link2 aria-hidden="true" className="size-3.5" />
                          Link to this answer
                        </a>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-navy-950 p-8 text-white lg:hidden">
          <p className="font-display text-3xl leading-tight">Still have a question?</p>
          <p className="mt-2 text-mist">The summit secretariat will get back to you.</p>
          <Link href="/contact" className={buttonClasses("gold", "md", "mt-6")}>
            Ask the team
          </Link>
        </div>
      </div>
    </div>
  );
}
