import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline-light" | "outline-dark" | "ghost-light";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-navy-950 hover:bg-gold-bright shadow-[0_8px_30px_-12px_rgba(212,175,55,0.6)]",
  "outline-light":
    "border border-white/25 text-white hover:border-gold hover:text-gold-bright bg-white/[0.03]",
  "outline-dark":
    "border border-navy-950/20 text-navy-950 hover:border-navy-950 hover:bg-navy-950 hover:text-white",
  "ghost-light": "text-white hover:text-gold-bright",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[0.95rem]",
};

export function buttonClasses(variant: Variant = "gold", size: Size = "md", className?: string) {
  return cn(
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors duration-200",
    variants[variant],
    sizes[size],
    className,
  );
}

/** Link styled as a button. The primary conversion element across the site. */
export function GoldButton({
  href,
  children,
  variant = "gold",
  size = "md",
  arrow = true,
  className,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const external = /^https?:\/\//.test(href);
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </>
  );
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses(variant, size, className)}
        {...rest}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
      {content}
    </Link>
  );
}
