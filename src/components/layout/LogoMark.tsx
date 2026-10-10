import { LOGO } from "@/lib/logo";
import { cn } from "@/lib/utils";

/** The NLBS rising-bars icon (see src/lib/logo.ts). Decorative: the link around it carries the name. */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export, already sized
    <img
      src={LOGO.icon}
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      className={cn("shrink-0", className)}
    />
  );
}
