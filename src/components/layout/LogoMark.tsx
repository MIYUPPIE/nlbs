import { LOGO_MARK } from "@/lib/logo";
import { cn } from "@/lib/utils";

/** The Nigeria 2.0 mark (see src/lib/logo.ts). Decorative: the link around it carries the name. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      dangerouslySetInnerHTML={{ __html: LOGO_MARK }}
    />
  );
}
