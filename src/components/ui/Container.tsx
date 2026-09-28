import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  size = "default",
}: {
  className?: string;
  children: React.ReactNode;
  size?: "default" | "narrow" | "wide";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-10",
        size === "default" && "max-w-7xl",
        size === "narrow" && "max-w-4xl",
        size === "wide" && "max-w-[88rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}
