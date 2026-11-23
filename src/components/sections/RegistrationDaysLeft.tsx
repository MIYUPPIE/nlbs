"use client";

import { useSyncExternalStore } from "react";
import { daysLeftLabel, registrationDaysLeft } from "@/lib/registration-window";

/** Re-reads the clock every minute, so a tab left open crosses midnight correctly. */
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}

/**
 * "14 days left" on the visitor's clock. Renders nothing on the server and
 * during hydration (the static HTML cannot know today's date), then fills in.
 */
export function RegistrationDaysLeft({ className }: { className?: string }) {
  const days = useSyncExternalStore(
    subscribe,
    () => registrationDaysLeft(Date.now()),
    () => null,
  );
  const label = days === null ? null : daysLeftLabel(days);
  return (
    <span data-testid="registration-days-left" className={className} aria-live="polite">
      {label}
    </span>
  );
}
