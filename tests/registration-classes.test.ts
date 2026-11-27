import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { delegateClasses, openClassKeys } from "@/data/registration-plan";
import { asCheckout, fetchClassAvailability, submitToCentral } from "@/lib/central";
import { prepare } from "@/lib/outgoing";
import { registrationSchema } from "@/lib/registration";
import { validRegistration } from "./fixtures";

/** Delegate classes (convener, 26 Nov 2026): what the site shows must be what the backend charges. */
const PHP = join(__dirname, "..", "../central-backend/services/api/config/central.php");
const config = { apiUrl: "https://api.example.test", siteKey: "pk_test" };
const reply = (status: number, body: unknown) =>
  (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("delegate classes", () => {
  it("are the convener's five classes, four sold here", () => {
    expect(delegateClasses.map((c) => [c.label, c.priceDisplay, c.capacity, c.open])).toEqual([
      ["VIP", "₦250,000", 62, true],
      ["Executive Class", "₦200,000", 196, true],
      ["Business Class", "₦150,000", 351, true],
      ["Standard", "₦100,000", 108, true],
      ["Basic Entry Level", "₦20,000", 252, false],
    ]);
    expect(openClassKeys).toEqual(delegateClasses.filter((c) => c.open).map((c) => c.key));
    for (const c of delegateClasses) expect(c.priceDisplay).toBe(`₦${c.price.toLocaleString("en-NG")}`);
  });

  it.skipIf(!existsSync(PHP))("match the prices, seats and sale status the backend enforces", () => {
    const php = readFileSync(PHP, "utf8");
    for (const c of delegateClasses) {
      const kobo = (c.price * 100).toLocaleString("en").replace(/,/g, "_");
      expect(php).toMatch(
        new RegExp(
          `'${c.key}' => \\['label' => '${c.label}', 'price' => ${kobo}, 'capacity' => ${c.capacity}, 'code' => '[A-Z]{3}', 'public' => ${c.open}\\]`,
        ),
      );
    }
  });

  it("the form requires one of the four open classes and sends it", () => {
    const base = { ...validRegistration, whatsapp: "", nominatedBy: "", accessNeeds: "" };
    expect(registrationSchema.safeParse({ ...base, tier: "" }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...base, tier: "basic" }).success).toBe(false);
    const p = prepare.registration({ ...base, tier: "vip" });
    expect(p.ok && p.fields.tier).toBe("vip");
    expect(p.ok && "amount" in p.fields).toBe(false);
  });
});

describe("paying with the central backend", () => {
  const checkout = {
    url: "https://checkout.paystack.com/n2-ab12-cd34-p1",
    amount: 25_000_000,
    currency: "NGN",
  };

  it("returns the checkout and the personal pay page", async () => {
    const res = await submitToCentral(
      "registration",
      {},
      config,
      reply(201, {
        ok: true,
        reference: "N2-AB12-CD34",
        payment: checkout,
        payUrl: "https://api.example.test/pay/abc",
      }),
    );
    expect(res).toEqual({
      ok: true,
      reference: "N2-AB12-CD34",
      payment: checkout,
      payUrl: "https://api.example.test/pay/abc",
    });
  });

  it("keeps the registration with the backend's reason when checkout cannot open", async () => {
    const res = await submitToCentral(
      "registration",
      {},
      config,
      reply(201, {
        ok: true,
        reference: "N2-AB12-CD34",
        payment: null,
        paymentError: "VIP is full.",
        payUrl: "https://api.example.test/pay/abc",
      }),
    );
    expect(res).toMatchObject({
      ok: true,
      payment: null,
      paymentError: "VIP is full.",
      payUrl: "https://api.example.test/pay/abc",
    });
  });

  it("only ever follows an https Paystack checkout", () => {
    expect(asCheckout(checkout)).toEqual(checkout);
    for (const url of [
      "http://checkout.paystack.com/x",
      "https://evil.example/x",
      "https://checkout.paystack.com.evil.example/x",
      "javascript:alert(1)",
    ]) {
      expect(asCheckout({ ...checkout, url })).toBeNull();
    }
  });

  it("reads which classes are open, and copes with the backend being away", async () => {
    const live = await fetchClassAvailability(
      config,
      reply(200, {
        ok: true,
        classes: [
          { key: "vip", left: 0, open: false },
          { key: "standard", left: 4, open: true },
        ],
      }),
    );
    expect(live?.get("vip")).toEqual({ key: "vip", left: 0, open: false });
    expect(live?.get("standard")?.open).toBe(true);
    expect(await fetchClassAvailability(config, reply(500, {}))).toBeNull();
    expect(await fetchClassAvailability(null)).toBeNull();
  });
});

describe("class picker hides prices until a class is chosen", () => {
  it("renders no price in the class cards or the register sidebar", () => {
    const form = readFileSync(join(__dirname, "../src/components/forms/RegistrationForm.tsx"), "utf8");
    const radioBlock = form.slice(
      form.indexOf('aria-label="Delegate class"'),
      form.indexOf('f-tier-error" role'),
    );
    expect(radioBlock).not.toContain("priceDisplay");
    const page = readFileSync(join(__dirname, "../src/app/register/page.tsx"), "utf8");
    expect(page).not.toContain("priceDisplay");
  });
});
