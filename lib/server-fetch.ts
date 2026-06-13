// Server-side fetch wrapper that logs every outgoing call to the backend.
// Logs appear in Vercel → Project → Logs (Runtime Logs), and in the terminal
// during local development. Use this instead of `fetch` in API route handlers
// so each request to the external API is traceable.

export async function loggedFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  const method = init?.method ?? "GET";
  const start = Date.now();

  // Surface the most common deploy misconfiguration early: an unset base URL
  // turns the request into `undefined/api/v1/...` and fails.
  if (!process.env.API_BASE_URL) {
    console.error(`[API] ${method} ${input} — MISSING API_BASE_URL env var`);
  }

  try {
    const res = await fetch(input, init);
    const ms = Date.now() - start;
    console.log(`[API] ${method} ${input} → ${res.status} (${ms}ms)`);
    return res;
  } catch (err) {
    const ms = Date.now() - start;
    console.error(`[API] ${method} ${input} → FAILED (${ms}ms):`, err);
    throw err;
  }
}
