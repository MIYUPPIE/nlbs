import { afterEach, describe, expect, it, vi } from "vitest";
import { registrationSchema } from "@/lib/registration";
import { handleSubmission } from "@/lib/submission-handler";
import { deliverSubmission } from "@/lib/delivery";
import { POST as registerPOST } from "@/app/api/register/route";
import { POST as enquiryPOST } from "@/app/api/enquiry/route";
import { validEnquiry, validRegistration } from "./fixtures";

const req = (body: unknown) =>
  new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const okFetch = vi.fn(async () => new Response("{}", { status: 200 }));

const run = (body: unknown, env: Record<string, string | undefined>, fetchImpl: typeof fetch = okFetch) =>
  handleSubmission(req(body), {
    kind: "registration",
    schema: registrationSchema,
    traceLabel: (d) => d.delegateType,
    unavailableMessage: "closed",
    env,
    fetchImpl,
  });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  okFetch.mockClear();
});

describe("handleSubmission status contract", () => {
  it("400 on malformed JSON", async () => {
    const res = await run("{nope", { NODE_ENV: "development" });
    expect(res.status).toBe(400);
  });

  it("413 on oversized bodies", async () => {
    const res = await run(
      { ...validRegistration, fullName: "x".repeat(20_000) },
      { NODE_ENV: "development" },
    );
    expect(res.status).toBe(413);
  });

  it("422 with per-field errors on invalid input", async () => {
    const res = await run({ ...validRegistration, email: "bad" }, { NODE_ENV: "development" });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.fieldErrors.email).toBe("Enter a valid email address.");
  });

  it("silently accepts honeypot submissions without delivering them", async () => {
    const res = await run(
      { ...validRegistration, website: "http://spam" },
      { NODE_ENV: "production", REGISTRATION_WEBHOOK_URL: "https://hook.test" },
    );
    expect(res.status).toBe(200);
    expect(okFetch).not.toHaveBeenCalled();
  });

  it("200 in development without a webhook", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const res = await run(validRegistration, { NODE_ENV: "development" });
    expect(res.status).toBe(200);
    expect((await res.json()).reference).toMatch(/^N2-/);
  });

  it("503 in production without a webhook (never fake a confirmation)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await run(validRegistration, { NODE_ENV: "production" });
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("closed");
  });

  it("200 in production without a webhook only when explicitly allowed", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const res = await run(validRegistration, {
      NODE_ENV: "production",
      REGISTRATION_ALLOW_UNCONNECTED: "true",
    });
    expect(res.status).toBe(200);
  });

  it("forwards to the webhook with auth and without the honeypot field", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const res = await run(validRegistration, {
      NODE_ENV: "production",
      REGISTRATION_WEBHOOK_URL: "https://hook.test/in",
      REGISTRATION_WEBHOOK_SECRET: "s3cret",
    });
    expect(res.status).toBe(200);
    expect(okFetch).toHaveBeenCalledTimes(1);
    const [url, init] = okFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hook.test/in");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer s3cret");
    const sent = JSON.parse(String(init.body));
    expect(sent).toMatchObject({ kind: "registration", email: "ada@example.com", event: "nigeria-2-0-2026" });
    expect(sent.reference).toMatch(/^N2-/);
    expect("website" in sent).toBe(false);
  });

  it("502 when the webhook rejects", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await run(
      validRegistration,
      { NODE_ENV: "production", REGISTRATION_WEBHOOK_URL: "https://hook.test" },
      vi.fn(async () => new Response("no", { status: 500 })),
    );
    expect(res.status).toBe(502);
  });

  it("502 when the webhook is unreachable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await run(
      validRegistration,
      { NODE_ENV: "production", REGISTRATION_WEBHOOK_URL: "https://hook.test" },
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    expect(res.status).toBe(502);
  });

  it("never caches responses", async () => {
    const res = await run("{nope", { NODE_ENV: "development" });
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("deliverSubmission logging", () => {
  it("does not log personal data", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await deliverSubmission("registration", validRegistration, "Business", { NODE_ENV: "development" });
    const logged = info.mock.calls.flat().join(" ");
    expect(logged).not.toContain("ada@example.com");
    expect(logged).not.toContain("Ada Obi");
    expect(logged).toContain("label=Business");
  });
});

describe("route handlers", () => {
  it("/api/register validates with the registration schema", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(console, "info").mockImplementation(() => {});
    expect((await registerPOST(req(validRegistration))).status).toBe(200);
    expect((await registerPOST(req({ ...validRegistration, delegateType: "x" }))).status).toBe(422);
  });

  it("/api/enquiry validates with the enquiry schema", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(console, "info").mockImplementation(() => {});
    expect((await enquiryPOST(req(validEnquiry))).status).toBe(200);
    expect((await enquiryPOST(req({ ...validEnquiry, message: "" }))).status).toBe(422);
  });

  it("/api/register refuses in production when no webhook is configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("REGISTRATION_WEBHOOK_URL", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect((await registerPOST(req(validRegistration))).status).toBe(503);
  });
});
