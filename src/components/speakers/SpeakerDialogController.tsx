"use client";

import { useEffect } from "react";
import { openSpeakerProfile } from "@/components/speakers/profile-link";

/**
 * One listener for the whole page:
 * - a click on any `a[data-profile-id]` opens that speaker's modal (the link's
 *   href stays as the fallback before hydration or if the modal is missing);
 * - a click on a modal's backdrop closes it.
 * Escape, focus trapping and focus return come from the native <dialog>.
 */
export function SpeakerDialogController() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as Element | null;
      if (target instanceof HTMLDialogElement && target.hasAttribute("data-speaker-dialog")) {
        // The dialog itself is only the target outside its panel: the backdrop.
        target.close();
        return;
      }
      const link = target?.closest<HTMLAnchorElement>("a[data-profile-id]");
      if (link && openSpeakerProfile(link.dataset.profileId!)) e.preventDefault();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
