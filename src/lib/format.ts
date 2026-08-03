// Small display helpers — turn raw record fields into what the page shows.
import type { Notice } from "../api/types";

/** "company_removal" -> "Company removal". Enum values are snake_case in the DB. */
export function formatCategory(category: string | null | undefined): string {
  if (!category) return "";
  const spaced = category.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** The human title for a notice — prefer the enriched headline, fall back to the raw title. */
export function noticeTitle(notice: Notice): string {
  return notice.headline || notice.title || notice.id;
}

/** Which significance colour the little bar uses — matches the prototype thresholds. */
export function significanceTier(score: number | null | undefined): "" | "mid" | "lo" {
  const value = score ?? 0;
  if (value >= 60) return "";
  if (value >= 40) return "mid";
  return "lo";
}

/** A one-line summary for the results row — trimmed on a word boundary. */
export function summarySnippet(text: string | null | undefined, max = 150): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

/** "2026-07-23" -> "23 July 2026". Parsed as parts, not `new Date(iso)`, which shifts the day
 *  backwards for anyone west of UTC. */
export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** 205501 -> "205,501". */
export function formatCount(value: number): string {
  return value.toLocaleString("en-NZ");
}

/** Split a block of prose into paragraphs (blank-line separated). */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Opening sentence becomes the headline, the rest the body. Works because the agent is prompted
 *  to lead with its conclusion. */
export function splitLeadSentence(answer: string): { headline: string; body: string[] } {
  const paragraphs = toParagraphs(answer);
  if (paragraphs.length === 0) return { headline: "", body: [] };

  const first = paragraphs[0];
  const match = first.match(/^(.+?[.!?])(\s+)(.+)$/s); // first sentence, then the remainder
  if (match) {
    const remainderOfFirst = match[3].trim();
    const body = remainderOfFirst ? [remainderOfFirst, ...paragraphs.slice(1)] : paragraphs.slice(1);
    return { headline: match[1].trim(), body };
  }
  return { headline: first, body: paragraphs.slice(1) };
}
