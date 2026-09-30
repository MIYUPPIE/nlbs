/** Wire format returned by every form submission (the central backend's contract). */
export type SubmissionResponse =
  { ok: true; reference: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };
