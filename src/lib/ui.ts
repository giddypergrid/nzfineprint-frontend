// Shared UI vocabulary used across components.

/** Which page is showing. */
export type ViewName = "home" | "results" | "detail" | "agent" | "legal";

/** The two search modes on the home deck. */
export type SearchMode = "search" | "ask";

/**
 * The back / new control on the masthead, per sub-view.
 * "back" retraces real browser history, so the label is honest wherever the reader arrived from —
 * a notice opened from an Ask briefing goes back to that briefing, not to a results page that was
 * never on screen. "home" is a forward move to the front page.
 */
export const MASTHEAD_BACK: Record<Exclude<ViewName, "home">, { label: string; action: "back" | "home" }> = {
  results: { label: "＋ New search", action: "home" },
  detail: { label: "← Back", action: "back" },
  agent: { label: "＋ New question", action: "home" },
  legal: { label: "← Back", action: "back" },
};
