"use client";

import { useSyncExternalStore } from "react";
import { closesAtMs } from "@/lib/registration-window";

const noopSubscribe = () => () => {};

const forcedOpen = process.env.NEXT_PUBLIC_REGISTRATION_OVERRIDE === "open";

/**
 * False on the server and during hydration; afterwards, whether the visitor's
 * clock is past the registration deadline. A build forced open (e2e) ignores
 * the clock. Covers a build made before the deadline that is served after it.
 */
export function usePastRegistrationDeadline(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => !forcedOpen && Date.now() >= closesAtMs,
    () => false,
  );
}
