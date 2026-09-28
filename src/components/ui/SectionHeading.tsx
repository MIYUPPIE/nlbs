import { cn } from "@/lib/utils";

/**
 * Eyebrow + headline + lead. `tone` picks colours that pass contrast on the
 * surface: gold-ink on light, gold on dark.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  tone = "light",
  align = "left",
  as: Tag = "h2",
  className,
  titleClassName,
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
  titleClassName?: string;
}) {
  const dark = tone === "dark";
  return (
    <div data-reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-5 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.22em] uppercase",
            dark ? "text-gold" : "text-gold-ink",
          )}
        >
          <span aria-hidden="true" className={cn("h-px w-8", dark ? "bg-gold" : "bg-gold-ink")} />
          {eyebrow}
        </p>
      )}
      <Tag
        id={id}
        className={cn(
          "font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl",
          dark ? "text-white" : "text-navy-950",
          titleClassName,
        )}
      >
        {title}
      </Tag>
      {lead && (
        <p className={cn("mt-6 text-lg leading-relaxed text-pretty", dark ? "text-mist" : "text-muted")}>
          {lead}
        </p>
      )}
    </div>
  );
}
