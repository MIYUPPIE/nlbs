"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CalendarClock, Lock } from "lucide-react";
import { talentApplication as t } from "@/data/talent-application";
import { TalentApplicationForm } from "@/components/talent/TalentApplicationForm";
import { buttonClasses } from "@/components/ui/GoldButton";
import { applicationWindow, type WindowStatus } from "@/lib/talent-form";

const noopSubscribe = () => () => {};

/**
 * The page is a static file, so the application window is checked in the
 * browser (Lagos time). The central backend enforces the same window, so a
 * wrong device clock cannot get an application in outside it.
 * NEXT_PUBLIC_TALENT_APPLICATIONS_OVERRIDE=open|closed forces it at build time.
 */
function useWindowStatus(): WindowStatus | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => applicationWindow(Date.now(), process.env.NEXT_PUBLIC_TALENT_APPLICATIONS_OVERRIDE),
    () => null,
  );
}

export function TalentWindowGate() {
  const status = useWindowStatus();

  if (status === null) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 text-muted sm:p-12" aria-busy="true">
        Loading the application form…
      </div>
    );
  }

  if (status === "open") return <TalentApplicationForm />;

  return (
    <div className="rounded-3xl border border-line bg-white p-8 sm:p-12">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-navy-950 text-gold">
        {status === "upcoming" ? (
          <CalendarClock aria-hidden="true" className="size-6" />
        ) : (
          <Lock aria-hidden="true" className="size-6" />
        )}
      </span>
      <h2 className="mt-6 font-display text-4xl text-navy-950">
        {status === "upcoming" ? `Applications open ${t.portalOpens}` : "Applications for 2026 have closed"}
      </h2>
      <p className="mt-3 max-w-lg text-muted">
        {status === "upcoming"
          ? `The form will be available here from ${t.portalOpens} until ${t.deadline}. Prepare your 1-minute video and your answers now.`
          : `The deadline was ${t.deadline}. Shortlisted applicants are being contacted on WhatsApp.`}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/talent#apply" className={buttonClasses("gold")}>
          How to prepare
        </Link>
        <Link href="/faq#talent-fund-core-product" className={buttonClasses("outline-dark")}>
          Talent Fund FAQs
        </Link>
      </div>
    </div>
  );
}
