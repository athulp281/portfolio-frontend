import { api, unwrap } from "./axios";

/**
 * POST /api/chat/ask
 * Body: { query }
 * Response data: string (the AI answer)
 *
 * NOTE: backend currently returns the full reply once (not streamed on the wire).
 * The chat store simulates a typed-out reveal for a streaming feel.
 * If/when the backend exposes SSE, swap askStream() to read from EventSource.
 */
export async function askQuestion(query, { signal } = {}) {
  const res = await api.post("/chat/ask", { query }, { signal });
  return unwrap(res);
}
