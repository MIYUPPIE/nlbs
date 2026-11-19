import Image from "next/image";
import { X } from "lucide-react";
import { speakers } from "@/data/speakers";
import { SpeakerProfileBody } from "@/components/speakers/SpeakerProfileBody";
import { SpeakerDialogController } from "@/components/speakers/SpeakerDialogController";
import { dialogId } from "@/components/speakers/profile-link";

/**
 * A native modal <dialog> per speaker, rendered once per page that links to
 * profiles (/ and /speakers). Closed dialogs are not rendered by the browser
 * until opened. Styles: `.speaker-dialog` in globals.css (open animation,
 * backdrop, scroll lock).
 */
export function SpeakerDialogs() {
  return (
    <>
      {speakers.map((s) => (
        <dialog
          key={s.id}
          id={dialogId(s.id)}
          data-speaker-dialog
          aria-labelledby={`${dialogId(s.id)}-name`}
          className="speaker-dialog"
        >
          <div className="relative">
            {/* Close first in the DOM and focused on open (openSpeakerProfile), so the modal opens at the top. */}
            <form method="dialog" className="absolute top-3 right-3 z-10 sm:top-4 sm:right-4">
              <button
                type="submit"
                data-dialog-close
                aria-label={`Close profile of ${s.name}`}
                className="flex size-10 items-center justify-center rounded-full bg-navy-950/80 text-white backdrop-blur transition-colors hover:bg-gold hover:text-navy-950 md:bg-navy-950 md:text-white"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </form>
            <div className="grid max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-3xl bg-white shadow-2xl md:grid-cols-12 md:overflow-hidden">
              <div className="relative h-56 bg-navy-950 sm:h-72 md:col-span-5 md:h-auto">
                <Image
                  src={s.photo.src}
                  alt={`Portrait of ${s.name}`}
                  fill
                  sizes="(min-width: 768px) 26rem, 100vw"
                  className="object-cover object-[50%_15%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/70 to-transparent"
                />
              </div>
              <div className="p-6 sm:p-8 md:col-span-7 md:max-h-[calc(100dvh-2rem)] md:overflow-y-auto md:overscroll-contain lg:p-10">
                <SpeakerProfileBody speaker={s} headingId={`${dialogId(s.id)}-name`} as="h2" />
              </div>
            </div>
          </div>
        </dialog>
      ))}
      <SpeakerDialogController />
    </>
  );
}
