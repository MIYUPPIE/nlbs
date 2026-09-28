"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { mobileNav, primaryNav } from "@/data/navigation";
import { event } from "@/data/event";
import { buttonClasses } from "@/components/ui/GoldButton";
import { Wordmark } from "@/components/layout/Wordmark";
import { cn } from "@/lib/utils";

/**
 * Invoker Commands (HTML `commandfor` / `command`) open and close the drawer
 * natively, so the menu works even before hydration on slow connections.
 * React's handlers remain as the fallback for browsers without support.
 * Not yet in React's JSX types, hence the spread objects.
 */
const openCommand = { commandfor: "mobile-nav", command: "show-modal" } as Record<string, string>;
const closeCommand = { commandfor: "mobile-nav", command: "close" } as Record<string, string>;

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Transparent over the hero, then a translucent navy bar with blur once the
 * page scrolls. The mobile drawer is a native <dialog> opened with
 * showModal(), which provides focus trapping, Escape to close and an inert
 * background.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  // Keep aria-expanded in sync however the dialog was opened (native command or click).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const sync = () => setOpen(dialog.open);
    dialog.addEventListener("toggle", sync);
    return () => dialog.removeEventListener("toggle", sync);
  }, []);

  const openDrawer = () => {
    const dialog = dialogRef.current;
    // With native command support the dialog is already open by the time this runs.
    if (dialog && !dialog.open) dialog.showModal();
    setOpen(true);
  };
  const closeDrawer = () => dialogRef.current?.close();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-white/10 bg-navy-950/85 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-gold px-4 py-2 font-semibold text-navy-950 focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-18 max-w-[88rem] items-center justify-between gap-6 px-5 sm:px-8 lg:h-20 lg:px-10">
        <Wordmark />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors xl:px-4",
                      active ? "text-gold" : "text-white/80 hover:text-white",
                    )}
                  >
                    {link.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3.5 -bottom-0.5 h-px bg-gold xl:inset-x-4"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className={buttonClasses("gold", "md", "hidden sm:inline-flex")}
            aria-current={pathname === "/register" ? "page" : undefined}
          >
            Register
          </Link>
          <button
            ref={toggleRef}
            type="button"
            {...openCommand}
            onClick={openDrawer}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold hover:text-gold lg:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        id="mobile-nav"
        aria-label="Site menu"
        onClose={() => {
          setOpen(false);
          toggleRef.current?.focus();
        }}
        onClick={(e) => {
          // Clicking the backdrop (the dialog element itself) closes it.
          if (e.target === e.currentTarget) closeDrawer();
        }}
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-sm bg-navy-950 p-0 text-white opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-300 backdrop:bg-navy-950/70 backdrop:backdrop-blur-sm open:opacity-100 lg:hidden starting:open:translate-x-8 starting:open:opacity-0"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-18 items-center justify-between border-b border-white/10 px-5">
            <Wordmark compact />
            <button
              type="button"
              {...closeCommand}
              onClick={closeDrawer}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-gold hover:text-gold"
            >
              <X aria-hidden="true" className="size-5" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
            <ul className="flex flex-col">
              {mobileNav.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href} className="border-b border-white/[0.07]">
                    <Link
                      href={link.href}
                      onClick={closeDrawer}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between py-4 text-lg font-medium transition-colors",
                        active ? "text-gold" : "text-white/90 hover:text-gold-bright",
                      )}
                    >
                      {link.label}
                      {active && <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-white/10 p-5">
            <p className="text-xs tracking-[0.18em] text-mist uppercase">{event.date.display}</p>
            <p className="mt-1 text-sm text-white/80">{event.venue.display}</p>
            <Link
              href="/register"
              onClick={closeDrawer}
              className={buttonClasses("gold", "lg", "mt-5 w-full")}
            >
              Register for the Summit
            </Link>
          </div>
        </div>
      </dialog>
    </header>
  );
}
