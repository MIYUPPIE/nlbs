import { cn } from "@/lib/utils";

/**
 * Aceternity UI Bento Grid (https://ui.aceternity.com/components/bento-grid),
 * restyled for the summit palette. Server component, CSS-only hover.
 */
export function BentoGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <ul role="list" className={cn("grid grid-cols-1 gap-4 md:auto-rows-[17rem] md:grid-cols-3", className)}>
      {children}
    </ul>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  tone = "light",
}: {
  className?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <li
      data-reveal
      className={cn(
        "group/bento relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5",
        dark
          ? "border-white/10 bg-white/[0.03] text-white hover:border-gold/50"
          : "border-line bg-white text-ink hover:border-gold/60 hover:shadow-[0_24px_60px_-30px_rgba(7,26,51,0.35)]",
        className,
      )}
    >
      {header}
      <div className="relative transition-transform duration-300 group-hover/bento:translate-x-1">
        {icon}
        <h3
          className={cn("mt-4 text-lg font-semibold tracking-tight", dark ? "text-white" : "text-navy-950")}
        >
          {title}
        </h3>
        {description && (
          <p className={cn("mt-2 text-sm leading-relaxed", dark ? "text-mist" : "text-muted")}>
            {description}
          </p>
        )}
      </div>
    </li>
  );
}
