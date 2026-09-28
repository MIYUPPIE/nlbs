import { cn } from "@/lib/utils";

type Tone = "light" | "white" | "dark" | "deep";

const tones: Record<Tone, string> = {
  light: "surface-light bg-ivory text-ink",
  white: "surface-light bg-white text-ink",
  dark: "bg-navy-900 text-white",
  deep: "bg-navy-950 text-white",
};

/** Page section with consistent vertical rhythm and surface tone. */
export function Section({
  id,
  tone = "light",
  className,
  children,
  labelledBy,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-tone={tone}
      className={cn("relative overflow-hidden py-20 sm:py-24 lg:py-32", tones[tone], className)}
    >
      {children}
    </section>
  );
}
