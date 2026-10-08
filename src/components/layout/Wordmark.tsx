import Link from "next/link";
import { LogoMark } from "@/components/layout/LogoMark";
import { cn } from "@/lib/utils";

export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Nigeria 2.0 home"
      className={cn("group inline-flex items-center gap-3 text-white", className)}
    >
      <LogoMark className="size-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-semibold tracking-[0.16em] uppercase">
          Nigeria <span className="text-gold">2.0</span>
        </span>
        {!compact && (
          <span className="mt-1.5 hidden text-[0.6rem] font-medium tracking-[0.18em] text-mist uppercase sm:block">
            Leadership Business Summit 2026
          </span>
        )}
      </span>
    </Link>
  );
}
