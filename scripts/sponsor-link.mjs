// Prints a new private partner-form token and link.
//   npm run sponsor-link            new random token
// Put the token in SPONSOR_FORM_TOKEN on the server and restart the app.
import { randomBytes } from "node:crypto";

const token = randomBytes(24).toString("base64url"); // 32 chars, 192 bits
const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nlbs.com.ng").replace(/\/$/, "");
console.log(`SPONSOR_FORM_TOKEN=${token}`);
console.log(`Link: ${origin}/sponsor/${token}`);
