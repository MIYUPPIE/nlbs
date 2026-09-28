/** Wire format returned by every form endpoint (client and server share it). */
export type SubmissionResponse =
  { ok: true; reference: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * POSTs JSON and normalises every outcome, including network failures and
 * non-JSON error pages, into a SubmissionResponse.
 */
export async function postForm(
  url: string,
  body: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmissionResponse> {
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as SubmissionResponse | null;
    if (data && typeof data.ok === "boolean") return data;
    return { ok: false, error: "Something went wrong. Please try again." };
  } catch {
    return {
      ok: false,
      error: "We could not reach the server. Check your connection and try again.",
    };
  }
}
