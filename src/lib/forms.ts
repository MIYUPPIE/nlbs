/** Wire format returned by every form submission (the central backend's contract). */
export type SubmissionResponse =
  | {
      ok: true;
      reference: string;
      /** Delegate classes: where to pay now (Paystack), or null with paymentError if it could not open. */
      payment?: Checkout | null;
      paymentError?: string;
      /** Their own payment page on the backend, for paying later. */
      payUrl?: string;
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** A Paystack checkout opened by the central backend. Amount in kobo. */
export type Checkout = { url: string; amount: number; currency: string };
