// Stand-in for the central backend during e2e (contract:
// central-backend/contracts/submissions.v1.md). Enforces what matters to the
// browser: CORS preflight, the X-Site-Key public key and the Origin allowlist.
// Stores the last body per form so tests can assert exactly what was sent:
//   GET /__last/<form>  -> last JSON body for that form (404 if none)
//   GET /__last/<form>?email=<e> -> last body for that form from that email,
//     so parallel tests posting the same form never read each other's body
//   POST /__reset       -> forget everything
//   GET /__health       -> 200 (Playwright readiness)
//   POST /__pay/<ref>   -> marks a registration paid (what Paystack's webhook does)
// Paid seats (26 Nov 2026): a registration answers with a Paystack-shaped
// checkout for ₦15,000 a seat, and /api/v1/submissions/<ref>/payment serves
// the /register/pay page. N2-OLDR-EG01 is a seeded earlier (free) registrant.
import { createServer } from "node:http";

const PORT = Number(process.env.FAKE_CENTRAL_PORT ?? 3299);
const KEY = process.env.FAKE_CENTRAL_KEY ?? "pk_e2e_nlbs";
const ORIGINS = (process.env.FAKE_CENTRAL_ORIGINS ?? "http://localhost:3200").split(",");
const last = new Map();
const SEAT_KOBO = 1_500_000;
/** reference -> { seats, paid } */
const seats = new Map();
const seedSeats = () => {
  seats.clear();
  seats.set("N2-OLDR-EG01", { seats: 1, paid: false });
  seats.set("N2-OLDR-EG02", { seats: 1, paid: false }); // paid by the "back from Paystack" test
};
seedSeats();
const checkoutFor = (ref, n) => ({
  url: `https://checkout.paystack.com/${ref.toLowerCase()}-p1`,
  amount: n * SEAT_KOBO,
  currency: "NGN",
});
// Mirrors src/data/universities.ts (tests/universities.test.ts pins the same list).
const UNIVERSITY_SLUGS = [
  "unilag",
  "ui",
  "covenant",
  "oau",
  "abu",
  "unn",
  "unilorin",
  "futa",
  "uniben",
  "uniport",
  "lasu",
  "pau",
  "babcock",
  "unijos",
  "futminna",
  "buk",
  "landmark",
  "unical",
  "funaab",
  "nile",
  "baze",
];
function remember(body) {
  last.set(body.form, body);
  if (typeof body.email === "string") last.set(`${body.form}|${body.email.trim().toLowerCase()}`, body);
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const chunk = () => Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * 32)]).join("");

function send(res, status, body, origin) {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (origin && ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

createServer((req, res) => {
  const origin = req.headers.origin;
  const url = new URL(req.url, "http://x");

  if (req.method === "GET" && url.pathname === "/__health") return send(res, 200, { ok: true });
  if (req.method === "GET" && url.pathname.startsWith("/__last/")) {
    const form = url.pathname.slice("/__last/".length);
    const email = url.searchParams.get("email");
    const body = last.get(email ? `${form}|${email.toLowerCase()}` : form);
    return body ? send(res, 200, body) : send(res, 404, { ok: false });
  }
  if (req.method === "POST" && url.pathname.startsWith("/__pay/")) {
    const s = seats.get(url.pathname.slice("/__pay/".length));
    if (!s) return send(res, 404, { ok: false });
    s.paid = true;
    return send(res, 200, { ok: true });
  }
  if (req.method === "POST" && url.pathname === "/__reset") {
    last.clear();
    seedSeats();
    return send(res, 200, { ok: true });
  }
  // Talent Fund university numbers (GET, aggregates only). Fixed values the e2e
  // asserts: UNILAG confirmed with 7 applications, OAU received with 3, the rest invited.
  if (url.pathname === "/api/v1/talent/universities") {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : "",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Accept, X-Site-Key",
        "Access-Control-Max-Age": "600",
      });
      return res.end();
    }
    if (req.headers["x-site-key"] !== KEY)
      return send(res, 401, { ok: false, error: "Missing or invalid site key." }, origin);
    if (!ORIGINS.includes(origin))
      return send(res, 403, { ok: false, error: "This origin is not allowed for this site." }, origin);
    const fixed = { unilag: ["confirmed", 7], oau: ["received", 3] };
    return send(
      res,
      200,
      {
        ok: true,
        updatedAt: new Date().toISOString(),
        universities: UNIVERSITY_SLUGS.map((slug) => ({
          slug,
          status: fixed[slug]?.[0] ?? "invited",
          applications: fixed[slug]?.[1] ?? 0,
        })),
      },
      origin,
    );
  }
  const payMatch = url.pathname.match(/^\/api\/v1\/submissions\/([A-Z0-9-]+)\/payment$/);
  if (payMatch) {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : "",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept, X-Site-Key",
        "Access-Control-Max-Age": "600",
      });
      return res.end();
    }
    if (req.headers["x-site-key"] !== KEY)
      return send(res, 401, { ok: false, error: "Missing or invalid site key." }, origin);
    if (!ORIGINS.includes(origin))
      return send(res, 403, { ok: false, error: "This origin is not allowed for this site." }, origin);
    const ref = payMatch[1];
    const s = seats.get(ref);
    if (!s) return send(res, 404, { ok: false, error: "Order not found." }, origin);
    if (req.method === "POST") {
      if (s.paid) return send(res, 409, { ok: false, error: "This order is already paid." }, origin);
      return send(res, 200, { ok: true, reference: ref, payment: checkoutFor(ref, s.seats) }, origin);
    }
    return send(
      res,
      200,
      {
        ok: true,
        reference: ref,
        status: s.paid ? "paid" : "pending",
        paid: s.paid,
        amount: s.seats * SEAT_KOBO,
        currency: "NGN",
        seats: s.seats,
        seatPrice: SEAT_KOBO,
        seatsLeft: 37,
      },
      origin,
    );
  }
  if (url.pathname !== "/api/v1/submissions")
    return send(res, 404, { ok: false, error: "Not found." }, origin);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, X-Site-Key",
      "Access-Control-Max-Age": "600",
    });
    return res.end();
  }

  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    if (req.headers["x-site-key"] !== KEY)
      return send(res, 401, { ok: false, error: "Missing or invalid site key." }, origin);
    if (!ORIGINS.includes(origin))
      return send(res, 403, { ok: false, error: "This origin is not allowed for this site." }, origin);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return send(res, 400, { ok: false, error: "Invalid JSON." }, origin);
    }
    if (typeof body.website === "string" && body.website !== "")
      return send(res, 201, { ok: true, reference: `N2-${chunk()}-${chunk()}` }, origin);
    if (!["registration", "enquiry", "talent", "sponsor", "university", "privacy"].includes(body.form))
      return send(res, 404, { ok: false, error: "Unknown form." }, origin);
    remember(body);
    const reference = `N2-${chunk()}-${chunk()}`;
    if (body.form === "registration") {
      const n = 1 + (Array.isArray(body.guests) ? body.guests.length : 0);
      seats.set(reference, { seats: n, paid: false });
      return send(res, 201, { ok: true, reference, payment: checkoutFor(reference, n) }, origin);
    }
    send(res, 201, { ok: true, reference }, origin);
  });
}).listen(PORT, () => console.log(`fake central on :${PORT}`));
