import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { event } from "@/data/event";
import { seatPayment, seatTotalDisplay } from "@/data/registration-plan";
import {
  asCheckout,
  fetchSeatStatus,
  normaliseReference,
  requestPaymentLink,
  startSeatPayment,
  submitToCentral,
} from "@/lib/central";
import { prepare } from "@/lib/outgoing";
import { guestsFrom, registrationSchema, seatCount } from "@/lib/registration";
import { validRegistration } from "./fixtures";

/**
 * Paid delegate seats (convener, 26 Nov 2026): ₦15,000 each, everyone pays,
 * 1 to 20 seats per order, 800 in the hall, paid through Paystack via the
 * central backend.
 */

const config = { apiUrl: "https://api.example.test", siteKey: "pk_test" };
const ROOT = join(__dirname, "..");
const PHP = join(ROOT, "../central-backend/services/api/config/central.php");

function fakeFetch(status: number, body: unknown, seen: { url?: string; init?: RequestInit } = {}) {
  return (async (url: string, init?: RequestInit) => {
    seen.url = url;
    seen.init = init;
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  }) as unknown as typeof fetch;
}

describe("seat price and limits", () => {
  it("is ₦15,000 a seat, up to 20 per order, 800 in the hall", () => {
    expect(seatPayment.price).toBe(15_000);
    expect(seatPayment.priceDisplay).toBe("₦15,000");
    expect(seatPayment.maxSeats).toBe(20);
    expect(seatPayment.capacity).toBe(800);
    expect(seatTotalDisplay(1)).toBe("₦15,000");
    expect(seatTotalDisplay(3)).toBe("₦45,000");
    expect(seatTotalDisplay(20)).toBe("₦300,000");
  });

  it.skipIf(!existsSync(PHP))("matches what the central backend charges and enforces", () => {
    const php = readFileSync(PHP, "utf8");
    expect(php).toContain(
      `'NLBS_SEAT_PRICE_KOBO', ${(seatPayment.price * 100).toLocaleString("en").replace(/,/g, "_")})`,
    );
    expect(php).toContain(`'NLBS_SEAT_CAPACITY', ${seatPayment.capacity})`);
    expect(php).toContain(`'max_seats' => ${seatPayment.maxSeats},`);
    expect(php).toContain(`'NLBS_PAY_CALLBACK_URL', 'https://www.nlbs.com.ng${seatPayment.payPath}'`);
    // The confirmation email states the same date, hours and venue as the site.
    expect(php).toContain(`'date' => '${event.date.display}'`);
    expect(php).toContain(`'hours' => '${event.date.hoursDisplay}'`);
    expect(php).toContain(`'venue' => '${event.venue.display}'`);
  });
});

describe("seats and guests on the form", () => {
  const base = { ...validRegistration, whatsapp: "", nominatedBy: "", accessNeeds: "" };

  it("defaults to one seat and needs no guests", () => {
    expect(registrationSchema.safeParse(base).success).toBe(true);
    expect(seatCount(undefined)).toBe(1);
    expect(seatCount("0")).toBe(1);
    expect(seatCount("25")).toBe(20);
  });

  it("needs a name and a distinct email for every guest seat", () => {
    const r = registrationSchema.safeParse({
      ...base,
      seats: "3",
      guest1Name: "Ifeoma Nwosu",
      guest1Email: "ifeoma@example.com",
    });
    expect(r.success).toBe(false);
    const paths = r.success ? [] : r.error.issues.map((i) => i.path[0]);
    expect(paths).toEqual(["guest2Name", "guest2Email"]);

    const dup = registrationSchema.safeParse({
      ...base,
      seats: "2",
      guest1Name: "Same Person",
      guest1Email: base.email.toUpperCase(),
    });
    expect(dup.success ? [] : dup.error.issues.map((i) => i.message)).toEqual([
      "Each person needs their own email address.",
    ]);
  });

  it("ignores guest rows beyond the chosen number of seats", () => {
    const r = registrationSchema.safeParse({ ...base, seats: "1", guest1Name: "", guest1Email: "" });
    expect(r.success).toBe(true);
    expect(
      guestsFrom({ seats: "2", guest1Name: " A  B ", guest1Email: " X@Y.com ", guest2Name: "left over" }),
    ).toEqual([{ fullName: "A B", email: "x@y.com" }]);
  });

  it("rejects an impossible seat count", () => {
    expect(registrationSchema.safeParse({ ...base, seats: "21" }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...base, seats: "two" }).success).toBe(false);
  });

  it("sends guests as a list and never a price", () => {
    const p = prepare.registration({
      ...base,
      seats: "2",
      guest1Name: "Bayo Lawal",
      guest1Email: "bayo@example.com",
    });
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.fields.guests).toEqual([{ fullName: "Bayo Lawal", email: "bayo@example.com" }]);
    for (const k of ["seats", "amount", "price", "guest1Name", "guest1Email"])
      expect(p.fields).not.toHaveProperty(k);
  });
});

describe("payment with the central backend", () => {
  const checkout = {
    url: "https://checkout.paystack.com/n2-ab12-cd34-p1",
    amount: 4_500_000,
    currency: "NGN",
  };

  it("returns the Paystack checkout from a registration", async () => {
    const res = await submitToCentral(
      "registration",
      {},
      config,
      fakeFetch(201, { ok: true, reference: "N2-AB12-CD34", payment: checkout }),
    );
    expect(res).toEqual({ ok: true, reference: "N2-AB12-CD34", payment: checkout });
  });

  it("keeps the registration when checkout could not open, with the reason", async () => {
    const res = await submitToCentral(
      "registration",
      {},
      config,
      fakeFetch(201, {
        ok: true,
        reference: "N2-AB12-CD34",
        payment: null,
        paymentError: "Only 1 seat is left.",
      }),
    );
    expect(res).toEqual({
      ok: true,
      reference: "N2-AB12-CD34",
      payment: null,
      paymentError: "Only 1 seat is left.",
    });
  });

  it("forms without payment are unchanged", async () => {
    const res = await submitToCentral(
      "enquiry",
      {},
      config,
      fakeFetch(201, { ok: true, reference: "N2-AB12-CD34" }),
    );
    expect(res).toEqual({ ok: true, reference: "N2-AB12-CD34" });
  });

  it("only ever follows an https Paystack checkout", () => {
    expect(asCheckout(checkout)).toEqual(checkout);
    expect(asCheckout({ ...checkout, url: "https://paystack.com/pay/x" })).not.toBeNull();
    for (const url of [
      "http://checkout.paystack.com/x",
      "https://evil.example/checkout.paystack.com",
      "https://checkout.paystack.com.evil.example/x",
      "javascript:alert(1)",
    ]) {
      expect(asCheckout({ ...checkout, url })).toBeNull();
    }
    expect(asCheckout({ ...checkout, amount: "45000" })).toBeNull();
  });

  it("reads the seat status by reference", async () => {
    const seen: { url?: string } = {};
    const res = await fetchSeatStatus(
      "N2-AB12-CD34",
      config,
      fakeFetch(
        200,
        {
          ok: true,
          reference: "N2-AB12-CD34",
          paid: false,
          status: "pending",
          amount: 1_500_000,
          seats: 1,
          seatsLeft: 412,
        },
        seen,
      ),
    );
    expect(seen.url).toBe("https://api.example.test/api/v1/submissions/N2-AB12-CD34/payment");
    expect(res).toEqual({
      ok: true,
      seat: {
        reference: "N2-AB12-CD34",
        paid: false,
        status: "pending",
        amount: 1_500_000,
        seats: 1,
        seatsLeft: 412,
      },
    });
  });

  it("says when a reference is unknown, without calling the server for a malformed one", async () => {
    expect(await fetchSeatStatus("N2-AB12-CD34", config, fakeFetch(404, { ok: false }))).toMatchObject({
      ok: false,
      notFound: true,
    });
    let called = false;
    const spy = (async () => {
      called = true;
      return new Response("{}");
    }) as unknown as typeof fetch;
    expect(await fetchSeatStatus("hello", config, spy)).toMatchObject({ ok: false, notFound: true });
    expect(called).toBe(false);
    expect(normaliseReference(" n2-ab12-cd34 ")).toBe("N2-AB12-CD34");
  });

  it("opens a checkout, or shows the backend's reason (sold out, closed, already paid)", async () => {
    const seen: { init?: RequestInit } = {};
    expect(
      await startSeatPayment("N2-AB12-CD34", config, fakeFetch(200, { ok: true, payment: checkout }, seen)),
    ).toEqual({
      ok: true,
      checkout,
    });
    expect(seen.init?.method).toBe("POST");
    expect(
      await startSeatPayment(
        "N2-AB12-CD34",
        config,
        fakeFetch(409, { ok: false, error: "All 800 seats at Nigeria 2.0 are taken." }),
      ),
    ).toEqual({ ok: false, error: "All 800 seats at Nigeria 2.0 are taken.", paid: false });
    expect(
      await startSeatPayment(
        "N2-AB12-CD34",
        config,
        fakeFetch(409, { ok: false, error: "This order is already paid." }),
      ),
    ).toMatchObject({ ok: false, paid: true });
    expect(await startSeatPayment("N2-AB12-CD34", null)).toMatchObject({ ok: false });
  });

  it("asks the backend to email a forgotten payment link, and shows its neutral answer", async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    const neutral = "If that email address has a registration, we have sent its payment link there.";
    expect(
      await requestPaymentLink(
        " ada@example.com ",
        config,
        fakeFetch(200, { ok: true, message: neutral }, seen),
      ),
    ).toEqual({
      ok: true,
      message: neutral,
    });
    expect(seen.url).toBe("https://api.example.test/api/v1/registrations/links");
    expect(JSON.parse(String(seen.init?.body))).toEqual({ email: "ada@example.com" });
    expect(
      await requestPaymentLink(
        "x",
        config,
        fakeFetch(422, { ok: false, fieldErrors: { email: "Enter a valid email address." } }),
      ),
    ).toMatchObject({ ok: false, fieldError: "Enter a valid email address." });
  });
});
