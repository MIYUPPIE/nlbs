"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** A link to share, with a copy button (falls back to selecting the text). */
export function CopyLink({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked: the field stays selectable */
    }
  };
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="student-link">
        {label}
      </label>
      <input
        id="student-link"
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="h-12 min-w-0 flex-1 rounded-xl border border-white/20 bg-white/5 px-4 font-mono text-sm text-white"
      />
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-bright"
      >
        {copied ? (
          <Check aria-hidden="true" className="size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
