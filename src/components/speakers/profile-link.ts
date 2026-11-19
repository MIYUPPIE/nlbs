/**
 * Profile links: plain anchors to /speakers/#profile-<id> (works without JS)
 * that open the speaker's modal instead when the page has one.
 * SpeakerDialogController handles the click for every such link.
 */
export const profileHref = (id: string) => `/speakers/#profile-${id}`;
export const dialogId = (id: string) => `speaker-dialog-${id}`;

/** Opens the speaker's modal if this page renders it. Returns false if not. */
export function openSpeakerProfile(id: string): boolean {
  const el = document.getElementById(dialogId(id));
  if (!(el instanceof HTMLDialogElement) || typeof el.showModal !== "function") return false;
  if (!el.open) el.showModal();
  // The browser focuses the first focusable element, which can be a source link
  // at the bottom; start at the close button so the profile opens at the top.
  el.querySelector<HTMLElement>("[data-dialog-close]")?.focus();
  return true;
}
