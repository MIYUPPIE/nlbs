"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Clock, Mail } from "lucide-react";
import { fetchUniversityStats, type UniversityStat } from "@/lib/central";
import { universities, universityProgramme as p } from "@/data/universities";
import { cn } from "@/lib/utils";

type Loaded = Map<string, UniversityStat> | null | "loading";

/** Loads the backend's per-university numbers once, in the browser (the site is static). */
function useStats(): Loaded {
  const [stats, setStats] = useState<Loaded>("loading");
  useEffect(() => {
    let live = true;
    fetchUniversityStats().then((s) => live && setStats(s));
    return () => {
      live = false;
    };
  }, []);
  return stats;
}

const STATUS = {
  confirmed: {
    label: "Confirmed",
    icon: BadgeCheck,
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  received: {
    label: "Confirmation being checked",
    icon: Clock,
    className: "bg-amber-50 text-amber-900 ring-amber-200",
  },
  invited: { label: "Invited", icon: Mail, className: "bg-ivory text-navy-950 ring-line" },
} as const;

export function StatusPill({ status }: { status: UniversityStat["status"] }) {
  const s = STATUS[status];
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        s.className,
      )}
    >
      <s.icon aria-hidden="true" className="size-3.5" />
      {s.label}
    </span>
  );
}

/** One university: its status and how many of its students have applied, straight from the backend. */
export function UniversityLiveStatus({ slug, short }: { slug: string; short: string }) {
  const stats = useStats();
  if (stats === "loading") {
    return (
      <p className="text-sm text-mist" aria-live="polite">
        Loading live numbers…
      </p>
    );
  }
  const s = stats?.get(slug);
  if (!s) {
    return (
      <p className="text-sm text-mist" aria-live="polite">
        {p.countUnavailable}
      </p>
    );
  }
  return (
    <div aria-live="polite" className="space-y-3" data-testid="university-live">
      <StatusPill status={s.status} />
      <p className="text-white">
        <span className="font-display text-5xl text-gold-bright" data-testid="university-count">
          {s.applications.toLocaleString("en-NG")}
        </span>
        <span className="mt-1 block text-sm text-mist">
          {s.applications === 1 ? "student has" : "students have"} applied through {short} so far. Counted by
          our system, updated every few minutes.
        </span>
      </p>
    </div>
  );
}

/** All invited universities, alphabetical (not a ranking), with live status and counts. */
export function UniversitiesBoard() {
  const stats = useStats();
  const sorted = [...universities].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div>
      {stats === null && <p className="mb-4 text-sm text-muted">{p.countUnavailable}</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((u) => {
          const s = stats instanceof Map ? stats.get(u.slug) : undefined;
          return (
            <li key={u.slug}>
              <Link
                href={`${p.base}/${u.slug}/`}
                className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-navy-700"
              >
                <span>
                  <span className="block font-semibold text-navy-950">{u.name}</span>
                  <span className="text-sm text-muted">{u.state}</span>
                </span>
                <span className="flex flex-wrap items-center justify-between gap-2">
                  {s ? (
                    <StatusPill status={s.status} />
                  ) : (
                    stats === "loading" && <span className="text-xs text-muted">Status loading</span>
                  )}
                  {s && (
                    <span className="text-sm text-muted" data-testid={`board-count-${u.slug}`}>
                      {s.applications.toLocaleString("en-NG")} applied
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
