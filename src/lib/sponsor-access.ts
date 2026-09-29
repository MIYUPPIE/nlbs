import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Access to the private partner form. The link is /sponsor/<SPONSOR_FORM_TOKEN>;
 * only people given the link can open or submit it. Rotate the token to
 * revoke every link already shared.
 *
 * Fails closed: with no token configured, or one shorter than
 * MIN_TOKEN_LENGTH, nobody gets in.
 */
export const MIN_TOKEN_LENGTH = 24;

const digest = (s: string) => createHash("sha256").update(s).digest();

export function sponsorAccessAllowed(
  candidate: unknown,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const expected = env.SPONSOR_FORM_TOKEN?.trim();
  if (!expected || expected.length < MIN_TOKEN_LENGTH) return false;
  if (typeof candidate !== "string" || candidate.length === 0 || candidate.length > 200) return false;
  // Equal-length digests keep the comparison constant-time.
  return timingSafeEqual(digest(candidate), digest(expected));
}
