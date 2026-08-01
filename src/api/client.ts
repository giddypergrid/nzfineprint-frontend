// The one place that talks to the Fine Print API. Everything else calls these functions.
import type { AskResponse, CorpusStats, Notice, SearchFilters, SearchResponse } from "./types";

// Empty in dev (Vite proxies /search and /ask to the backend). Set VITE_API_BASE in production.
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/** POST JSON and return the parsed body, throwing a readable error on a non-2xx. */
async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await readErrorDetail(response);
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

/** FastAPI puts the message in `detail`; fall back to the status text. For a rate-limit/busy
 *  response (429/503) we append the exact wait from Retry-After when it's a short one. */
async function readErrorDetail(response: Response): Promise<string> {
  let detail = `Request failed (${response.status} ${response.statusText})`;
  try {
    const data = await response.json();
    if (data && typeof data.detail === "string") detail = data.detail;
  } catch {
    // body was not JSON — keep the fallback
  }
  const retryAfter = Number(response.headers.get("Retry-After"));
  if (retryAfter > 0 && retryAfter <= 120) detail += ` (try again in ${retryAfter}s)`;
  return detail;
}

/** How many notices are loaded and how far they run. Fetched once on load; the zero-result page
 *  quotes it to show what "nothing found" was measured against. */
export async function fetchCorpusStats(): Promise<CorpusStats> {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) throw new Error(await readErrorDetail(response));
  return response.json() as Promise<CorpusStats>;
}

/** Search notices. Keyword-shaped queries hit full-text; sentences go the semantic route. */
export function searchNotices(
  query: string,
  filters: SearchFilters,
  limit = 20,
): Promise<SearchResponse> {
  return postJson<SearchResponse>("/search", { q: query, filters, limit });
}

/** Ask the desk a question in one shot — the whole report arrives at the end. Kept for scripts. */
export function askTheDesk(query: string): Promise<AskResponse> {
  return postJson<AskResponse>("/ask", { q: query });
}

export interface AskStreamHandlers {
  onStep: (text: string) => void;
  onSource: (notice: Notice) => void;
  onAnswer: (text: string) => void;
}

/**
 * Ask the desk and receive each stage line the moment the agent performs that lookup.
 * Uses fetch + a streamed body rather than EventSource, because EventSource cannot POST.
 * Resolves once the report has arrived; rejects if the server reports an error.
 */
export async function askTheDeskStreaming(query: string, handlers: AskStreamHandlers): Promise<void> {
  const response = await fetch(`${API_BASE}/ask/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query }),
  });
  if (!response.ok) throw new Error(await readErrorDetail(response));
  if (!response.body) throw new Error("This browser cannot read a streamed response.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line; hold any partial frame back for the next chunk.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) handleFrame(frame, handlers);
  }
}

/** Turn one `data: {...}` frame into the matching callback. */
function handleFrame(frame: string, handlers: AskStreamHandlers): void {
  const dataLine = frame.split("\n").find((line) => line.startsWith("data:"));
  if (!dataLine) return;

  const event = JSON.parse(dataLine.slice("data:".length).trim());
  if (event.type === "step") handlers.onStep(event.text);
  else if (event.type === "source") handlers.onSource(event.notice);
  else if (event.type === "answer") handlers.onAnswer(event.text);
  else if (event.type === "error") throw new Error(event.message);
}
