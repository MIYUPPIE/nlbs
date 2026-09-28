import type { Stat } from "@/data/event";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { TargetBadge } from "@/components/ui/TargetBadge";
import { cn } from "@/lib/utils";

export function StatCard({
  stat,
  tone = "dark",
  className,
}: {
  stat: Stat;
  tone?: "dark" | "light";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div data-reveal className={cn("flex flex-col", className)}>
      <TargetBadge kind={stat.kind} tone={tone} className="self-start" />
      <p
        className={cn(
          "mt-5 font-display text-5xl leading-none tracking-tight sm:text-6xl",
          dark ? "text-gold" : "text-navy-950",
        )}
      >
        <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
      </p>
      <p className={cn("mt-4 text-base font-semibold", dark ? "text-white" : "text-navy-950")}>
        {stat.label}
      </p>
      <p className={cn("mt-2 text-sm leading-relaxed", dark ? "text-mist" : "text-muted")}>{stat.note}</p>
    </div>
  );
}
