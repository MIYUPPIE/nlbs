import Image from "next/image";
import Link from "next/link";
import { contact, event } from "@/data/event";
import { footerNav, footerSecondaryNav } from "@/data/navigation";
import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/layout/Wordmark";
import { GoldButton } from "@/components/ui/GoldButton";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div aria-hidden="true" className="bg-grid mask-fade-b absolute inset-0 opacity-60" />
      <Container className="relative">
        <div className="grid gap-14 border-b border-white/10 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-5">
            <Wordmark />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-mist">{event.name}</p>
            <p className="mt-8 font-display text-3xl leading-tight text-white sm:text-4xl">
              Invest in People.
              <br />
              <span className="text-gold">Invest in Possibilities.</span>
            </p>
            <GoldButton href="/register" className="mt-8">
              Register for the Summit
            </GoldButton>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Summit</h2>
              <ul className="mt-5 space-y-3">
                {footerNav.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/80 transition-colors hover:text-gold-bright"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">Opportunities</h2>
              <ul className="mt-5 space-y-3">
                {footerSecondaryNav.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/80 transition-colors hover:text-gold-bright"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {contact.socials.length > 0 && (
                <>
                  <h2 className="mt-10 text-xs font-semibold tracking-[0.2em] text-gold uppercase">Follow</h2>
                  <ul className="mt-5 space-y-3">
                    {contact.socials.map((s) => (
                      <li key={s.href}>
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/80 transition-colors hover:text-gold-bright"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">The Summit</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-mist">Date</dt>
                  <dd className="mt-1 text-white/90">{event.date.display}</dd>
                </div>
                <div>
                  <dt className="text-mist">Venue</dt>
                  <dd className="mt-1 text-white/90">{event.venue.display}</dd>
                </div>
                <div>
                  <dt className="text-mist">Convened by</dt>
                  <dd className="mt-2">
                    <span className="inline-flex rounded-md bg-white px-3 py-2">
                      <Image
                        src="/brand/hbc-logo.png"
                        alt="HBC Business Help"
                        width={200}
                        height={83}
                        className="h-7 w-auto"
                      />
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </nav>
        </div>
        <div className="flex flex-col gap-3 py-8 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {event.convener}. All rights reserved.</p>
          <p>{event.theme}</p>
        </div>
      </Container>
    </footer>
  );
}
