// Stand-in for the central backend during e2e (contract:
// central-backend/contracts/submissions.v1.md). Enforces what matters to the
// browser: CORS preflight, the X-Site-Key public key and the Origin allowlist.
// Stores the last body per form so tests can assert exactly what was sent:
//   GET /__last/<form>  -> last JSON body for that form (404 if none)
//   GET /__last/<form>?email=<e> -> last body for that form from that email,
//     so parallel tests posting the same form never read each other's body
//   POST /__reset       -> forget everything
//   GET /__health       -> 200 (Playwright readiness)
import { createServer } from "node:http";

const PORT = Number(process.env.FAKE_CENTRAL_PORT ?? 3299);
const KEY = process.env.FAKE_CENTRAL_KEY ?? "pk_e2e_nlbs";
const ORIGINS = (process.env.FAKE_CENTRAL_ORIGINS ?? "http://localhost:3200").split(",");
const last = new Map();
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
  if (req.method === "POST" && url.pathname === "/__reset") {
    last.clear();
    return send(res, 200, { ok: true });
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
    if (!["registration", "enquiry", "talent", "sponsor", "privacy"].includes(body.form))
      return send(res, 404, { ok: false, error: "Unknown form." }, origin);
    remember(body);
    send(res, 201, { ok: true, reference: `N2-${chunk()}-${chunk()}` }, origin);
  });
}).listen(PORT, () => console.log(`fake central on :${PORT}`));
