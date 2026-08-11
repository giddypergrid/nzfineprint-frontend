// These mirror the FastAPI pydantic models exactly (app/search/schemas.py,
// app/agent/schemas.py). If the backend shapes change, change these to match.

/** One notice — the enriched record plus its original source text. */
export interface Notice {
  id: string;
  date: string | null;
  type: string | null;
  headline: string | null;
  plain_english: string | null;
  event_category: string | null;
  action_taken: string | null;
  affected_parties: string[] | null;
  significance_score: number | null;
  significance_reason: string | null;
  title: string | null;
  fulltext: string | null;
  landing_url: string | null;
  score?: number | null; // relevance, semantic route only
}

/** Hard filters the UI sets directly (category chip, year slider, significance slider). */
export interface SearchFilters {
  event_category?: string | null;
  action_taken?: string | null;
  code?: string | null;
  date_from?: string | null; // ISO date, e.g. "2020-01-01"
  date_to?: string | null;
  min_significance?: number | null;
}

export interface SearchResponse {
  route: string; // "keyword" | "semantic" — which path answered
  parsed?: Record<string, unknown> | null;
  count: number;
  results: Notice[];
}

/** How much record there is. Quoted on the zero-result page, so it comes from the DB, never a
 *  constant — `newest` is the real last notice loaded, which is not necessarily today. */
export interface CorpusStats {
  notice_count: number;
  oldest: string | null;
  newest: string | null;
}

/** One lookup the agent made, shown in full so the answer can be audited rather than trusted.
 *  `summary` and `ms` are null until the tool returns. */
export interface AgentStep {
  index: number;
  tool: string;
  args: Record<string, unknown>;
  narration: string | null;
  summary: string | null;
  ms: number | null;
}

/** One streamed step frame: "call" carries the request, "result" the outcome, matched by index. */
export interface AgentStepEvent {
  phase: "call" | "result";
  index: number;
  tool: string;
  args?: Record<string, unknown>;
  narration?: string | null;
  summary?: string | null;
  ms?: number | null;
}

/** The desk's answer: every lookup it made, the report, and the notices it read. */
export interface AskResponse {
  steps: AgentStep[];
  answer: string;
  sources: Notice[];
}
