import { Megaphone } from "lucide-react";
import { talentApplication as t } from "@/data/talent-application";
import { cn } from "@/lib/utils";

/**
 * The 27 Oct 2026 extension (30 Oct to 10 Nov), shown wherever the deadline
 * is. `compact` keeps only the title and the first sentence for tight columns.
 */
export function DeadlineExtensionNotice({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const e = t.extension;
  const body = compact ? `${e.body.split(". ")[0]}.` : e.body;
  return (
    <aside
      aria-labelledby="deadline-extension-title"
      data-testid="deadline-extension"
      className={cn("flex gap-4 rounded-2xl border border-gold/40 bg-ivory p-5", className)}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-gold">
        <Megaphone aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <h2 id="deadline-extension-title" className="font-semibold text-navy-950">
          {e.title}
        </h2>
        <p className="mt-1 text-sm text-muted">{body}</p>
      </div>
    </aside>
  );
}
