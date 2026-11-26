/** Wire format returned by every form submission (the central backend's contract). */
export type SubmissionResponse =
  | {
      ok: true;
      reference: string;
      /** Paid forms (delegate seats): where to pay, or null with paymentError if checkout could not open. */
      payment?: Checkout | null;
      paymentError?: string;
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** A Paystack checkout opened by the central backend. Amount in kobo. */
export type Checkout = { url: string; amount: number; currency: string };
