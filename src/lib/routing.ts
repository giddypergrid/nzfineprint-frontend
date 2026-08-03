// URL <-> app state, so every view survives a reload, a paste and the Back button.
// Anything parsed out of a URL is attacker-supplied, so it is clamped here, never trusted onward.
import { FIRST_YEAR } from "../data/yearly";
import type { SearchFilters } from "../api/types";
import type { ViewName } from "./ui";

export interface ResultFilters {
  category: string | null;
  sinceYear: number;
  minSignificance: number;
}

export const NO_FILTERS: ResultFilters = {
  category: null,
  sinceYear: FIRST_YEAR,
  minSignificance: 0,
};

export type Route =
  | { view: "home" }
  | { view: "results"; query: string; filters: ResultFilters }
  | { view: "detail"; noticeId: string }
  | { view: "agent"; question: string }
  | { view: "legal" };

export const HOME: Route = { view: "home" };

/** The current address as a Route. Anything unrecognised — or missing its required value — is home. */
export function parseRoute(location: { pathname: string; search: string }): Route {
  const params = new URLSearchParams(location.search);
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const q = (params.get("q") ?? "").trim();

  if (path === "/search") {
    return q ? { view: "results", query: q, filters: readFilters(params) } : HOME;
  }
  if (path === "/ask") {
    return q ? { view: "agent", question: q } : HOME;
  }
  if (path.startsWith("/notice/")) {
    const noticeId = decodeURIComponent(path.slice("/notice/".length));
    return noticeId ? { view: "detail", noticeId } : HOME;
  }
  if (path === "/legal") return { view: "legal" };
  return HOME;
}

/** The address for a Route. Doubles as the cache key, since it captures every input to the page. */
export function routeToPath(route: Route): string {
  switch (route.view) {
    case "results": {
      const params = new URLSearchParams({ q: route.query });
      if (route.filters.category) params.set("category", route.filters.category);
      if (route.filters.sinceYear > FIRST_YEAR) params.set("since", String(route.filters.sinceYear));
      if (route.filters.minSignificance > 0) params.set("min", String(route.filters.minSignificance));
      return `/search?${params}`;
    }
    case "detail":
      return `/notice/${encodeURIComponent(route.noticeId)}`;
    case "agent":
      return `/ask?${new URLSearchParams({ q: route.question })}`;
    case "legal":
      return "/legal";
    default:
      return "/";
  }
}

export function viewOf(route: Route): ViewName {
  return route.view;
}

/** Sidebar filter state -> the API's filter object (omit the "no filter" values). */
export function toApiFilters(filters: ResultFilters): SearchFilters {
  const payload: SearchFilters = {};
  if (filters.category) payload.event_category = filters.category;
  if (filters.sinceYear > FIRST_YEAR) payload.date_from = `${filters.sinceYear}-01-01`;
  if (filters.minSignificance > 0) payload.min_significance = filters.minSignificance;
  return payload;
}

export function filtersActive(filters: ResultFilters): boolean {
  return filters.category !== null || filters.sinceYear > FIRST_YEAR || filters.minSignificance > 0;
}

function readFilters(params: URLSearchParams): ResultFilters {
  return {
    category: params.get("category"),
    sinceYear: clamp(Number(params.get("since")), FIRST_YEAR, new Date().getFullYear(), FIRST_YEAR),
    minSignificance: clamp(Number(params.get("min")), 0, 100, 0),
  };
}

function clamp(value: number, low: number, high: number, fallback: number): number {
  if (!Number.isFinite(value) || value === 0) return fallback;
  return Math.min(Math.max(value, low), high);
}
