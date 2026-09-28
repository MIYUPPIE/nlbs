import { cn } from "@/lib/utils";
import type { StatKind } from "@/data/event";

/**
 * Text badge that marks a figure as a projection. Uses words, not colour,
 * so the meaning survives for every reader.
 */
export function TargetBadge({
  kind,
  tone = "dark",
  className,
}: {
  kind: StatKind;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-[0.16em] uppercase",
        tone === "dark" ? "border-gold/40 text-gold" : "border-gold-ink/40 text-gold-ink",
        className,
      )}
    >
      {kind === "target" ? "Target" : "Expected"}
    </span>
  );
}
