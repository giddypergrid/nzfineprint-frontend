// Shared UI vocabulary used across components.

/** Which page is showing. */
export type ViewName = "home" | "results" | "detail" | "agent" | "legal";

/** The two search modes on the home deck. */
export type SearchMode = "search" | "ask";

/** The back / new control on the masthead, per sub-view: its label and where it goes. */
export const MASTHEAD_BACK: Record<Exclude<ViewName, "home">, { label: string; to: ViewName }> = {
  results: { label: "＋ New search", to: "home" },
  detail: { label: "← Back to results", to: "results" },
  agent: { label: "＋ New question", to: "home" },
  legal: { label: "← Back", to: "home" },
};
