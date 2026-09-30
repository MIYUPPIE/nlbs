/**
 * Talent Fund applicants pre-order Advising The Founder before continuing.
 * The backend decides (GET /api/v1/talent/preorder-check, and again on
 * submit); these cover the link out, the reference format and how every
 * backend answer reaches the applicant.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { checkPreorder, NOT_OPEN } from "@/lib/central";
import { BOOK_PREORDER, bookPreorderUrl, normalizePreorderReference } from "@/lib/talent-form";

const CONFIG = { apiUrl: "https://api.nlbs.com.ng", siteKey: "pk_test_123" };
const APPLICANT = { email: "amaka@example.com", whatsapp: "+2348031234567" };

const reply = (status: number, body: unknown) =>
  vi.fn(
    async () =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );

describe("normalizePreorderReference", () => {
  it.each([
    ["BK-7K4Q-9XPA", "BK-7K4Q-9XPA"],
    [" bk-7k4q-9xpa ", "BK-7K4Q-9XPA"],
    ["BK - 7K4Q - 9XPA", "BK-7K4Q-9XPA"],
  ])("%s → %s", (input, out) => expect(normalizePreorderReference(input)).toBe(out));

  it.each(["", "BK7K4Q9XPA", "BK-7K4-9XPA", "<script>", "BK-7K4Q-9XPA-P1"])("rejects %s", (input) =>
    expect(normalizePreorderReference(input)).toBeNull(),
  );
});

describe("bookPreorderUrl", () => {
  it("prefills the book order and asks to be sent back to the application", () => {
    const url = new URL(
      bookPreorderUrl(
        { fullName: "Amaka Obi", email: "amaka@example.com", whatsapp: "0803 123 4567" },
        "https://www.nlbs.com.ng/talentnigeria20/",
      ),
    );
    expect(url.origin + url.pathname).toBe(BOOK_PREORDER.url);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      from: "nlbs-talent",
      name: "Amaka Obi",
      email: "amaka@example.com",
      phone: "0803 123 4567",
      return: "https://www.nlbs.com.ng/talentnigeria20/",
    });
  });

  it("leaves out details the applicant has not entered", () => {
    const q = new URL(bookPreorderUrl({}, "https://www.nlbs.com.ng/talentnigeria20/")).searchParams;
    expect(q.has("name") || q.has("email") || q.has("phone")).toBe(false);
  });

  it("returns to an origin the book site accepts", () => {
    // book/index.html CONFIG.returnOrigins must include the NLBS origin.
    const html = readFileSync(join(__dirname, "..", "..", "book", "index.html"), "utf8");
    expect(html).toMatch(/returnOrigins:\s*\[[^\]]*'https:\/\/www\.nlbs\.com\.ng'/);
  });
});

describe("checkPreorder", () => {
  it("asks the backend with the site key, reference and applicant contact", async () => {
    const fetchImpl = reply(200, { ok: true, valid: true, seatsLeft: 1 });
    expect(await checkPreorder("BK-7K4Q-9XPA", APPLICANT, CONFIG, fetchImpl)).toEqual({
      valid: true,
      seatsLeft: 1,
    });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const u = new URL(url);
    expect(u.origin + u.pathname).toBe("https://api.nlbs.com.ng/api/v1/talent/preorder-check");
    expect(Object.fromEntries(u.searchParams)).toEqual({
      reference: "BK-7K4Q-9XPA",
      email: "amaka@example.com",
      phone: "+2348031234567",
    });
    expect((init.headers as Record<string, string>)["X-Site-Key"]).toBe("pk_test_123");
  });

  it("treats a switched-off requirement as valid", async () => {
    expect(
      await checkPreorder(
        "BK-7K4Q-9XPA",
        APPLICANT,
        CONFIG,
        reply(200, { ok: true, valid: true, required: false }),
      ),
    ).toEqual({
      valid: true,
    });
  });

  it.each(["not_found", "unpaid", "used_up"])("passes the backend's %s message through", async (status) => {
    const res = await checkPreorder(
      "BK-7K4Q-9XPA",
      APPLICANT,
      CONFIG,
      reply(200, { ok: true, valid: false, status, message: `msg ${status}` }),
    );
    expect(res).toEqual({ valid: false, status, message: `msg ${status}` });
  });

  it("maps transport problems to plain messages", async () => {
    expect(await checkPreorder("BK-7K4Q-9XPA", APPLICANT, null)).toEqual({
      valid: false,
      status: "error",
      message: NOT_OPEN.talent,
    });
    const offline = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect((await checkPreorder("BK-7K4Q-9XPA", APPLICANT, CONFIG, offline)).valid).toBe(false);
    const limited = await checkPreorder(
      "BK-7K4Q-9XPA",
      APPLICANT,
      CONFIG,
      reply(429, { ok: false, error: "Too many" }),
    );
    expect(limited).toMatchObject({ valid: false, status: "error" });
    expect((limited as { message: string }).message).toMatch(/wait a minute/);
  });
});
