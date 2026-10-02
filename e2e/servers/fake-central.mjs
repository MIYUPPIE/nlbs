// Stand-in for the central backend during e2e (contract:
// central-backend/contracts/submissions.v1.md). Enforces what matters to the
// browser: CORS preflight, the X-Site-Key public key and the Origin allowlist.
// Stores the last body per form so tests can assert exactly what was sent:
//   GET /__last/<form>  -> last JSON body for that form (404 if none)
//   GET /__last/<form>?email=<e> -> last body for that form from that email,
//     so parallel tests posting the same form never read each other's body
//   POST /__reset       -> forget everything
//   GET /__health       -> 200 (Playwright readiness)
// Talent applications need a paid book pre-order (like the real backend):
//   BK-PAID-2222  paid, many copies (shared by parallel tests), buyer amaka@example.com / +2348031234567
//   BK-ONE1-4444  paid, 1 copy, same buyer
//   BK-UNPD-3333  same buyer, not paid yet
import { createServer } from "node:http";

const PORT = Number(process.env.FAKE_CENTRAL_PORT ?? 3299);
const KEY = process.env.FAKE_CENTRAL_KEY ?? "pk_e2e_nlbs";
const ORIGINS = (process.env.FAKE_CENTRAL_ORIGINS ?? "http://localhost:3200").split(",");
const last = new Map();
function remember(body) {
  last.set(body.form, body);
  if (typeof body.email === "string") last.set(`${body.form}|${body.email.trim().toLowerCase()}`, body);
}

const PREORDERS = {
  "BK-PAID-2222": { paid: true, copies: 1000, email: "amaka@example.com", phone: "8031234567" },
  "BK-ONE1-4444": { paid: true, copies: 1, email: "amaka@example.com", phone: "8031234567" },
  "BK-UNPD-3333": { paid: false, copies: 1, email: "amaka@example.com", phone: "8031234567" },
};
const used = new Map(); // reference -> applications using it
const MESSAGES = {
  not_found:
    "We could not find a pre-order with this reference for your email or phone number. Use the same email or phone you used to pre-order.",
  unpaid: "This pre-order has not been paid yet. Complete the payment, then try again.",
  used_up:
    "This pre-order has already been used for Talent Fund applications. Each copy covers one application.",
};
function preorderStatus(reference, email, phone) {
  const ref = String(reference ?? "")
    .replace(/\s+/g, "")
    .toUpperCase();
  const p = PREORDERS[ref];
  const digits = String(phone ?? "")
    .replace(/\D/g, "")
    .slice(-10);
  if (
    !p ||
    (String(email ?? "")
      .trim()
      .toLowerCase() !== p.email &&
      digits !== p.phone)
  )
    return { status: "not_found", ref };
  if (!p.paid) return { status: "unpaid", ref };
  const left = p.copies - (used.get(ref) ?? 0);
  return left > 0 ? { status: "ok", ref, left } : { status: "used_up", ref };
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
  if (req.method === "POST" && url.pathname === "/__reset") {
    last.clear();
    used.clear();
    return send(res, 200, { ok: true });
  }
  const known = ["/api/v1/submissions", "/api/v1/talent/preorder-check"];
  if (!known.includes(url.pathname)) return send(res, 404, { ok: false, error: "Not found." }, origin);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : "",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, X-Site-Key",
      "Access-Control-Max-Age": "600",
    });
    return res.end();
  }

  if (url.pathname === "/api/v1/talent/preorder-check") {
    if (req.headers["x-site-key"] !== KEY)
      return send(res, 401, { ok: false, error: "Missing or invalid site key." }, origin);
    if (!ORIGINS.includes(origin))
      return send(res, 403, { ok: false, error: "This origin is not allowed for this site." }, origin);
    const r = preorderStatus(
      url.searchParams.get("reference"),
      url.searchParams.get("email"),
      url.searchParams.get("phone"),
    );
    return send(
      res,
      200,
      r.status === "ok"
        ? { ok: true, valid: true, seatsLeft: r.left }
        : { ok: true, valid: false, status: r.status, message: MESSAGES[r.status] },
      origin,
    );
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
    if (!["registration", "enquiry", "talent", "sponsor", "privacy"].includes(body.form))
      return send(res, 404, { ok: false, error: "Unknown form." }, origin);
    if (body.form === "talent") {
      if (!body.preorderReference)
        return send(
          res,
          422,
          {
            ok: false,
            error: "Please correct the highlighted fields.",
            fieldErrors: {
              preorderReference: "Pre-order Advising The Founder first, then enter your pre-order reference.",
            },
          },
          origin,
        );
      const r = preorderStatus(body.preorderReference, body.email, body.whatsapp);
      if (r.status !== "ok")
        return send(
          res,
          422,
          {
            ok: false,
            error: "Please correct the highlighted fields.",
            fieldErrors: { preorderReference: MESSAGES[r.status] },
          },
          origin,
        );
      used.set(r.ref, (used.get(r.ref) ?? 0) + 1);
    }
    remember(body);
    send(res, 201, { ok: true, reference: `N2-${chunk()}-${chunk()}` }, origin);
  });
}).listen(PORT, () => console.log(`fake central on :${PORT}`));
