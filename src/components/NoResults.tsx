import type { CorpusStats } from "../api/types";
import { formatCount, formatLongDate } from "../lib/format";

interface NoResultsProps {
  query: string;
  stats: CorpusStats | null;
  filtersActive: boolean;
  onClearFilters: () => void;
}

/**
 * Zero results is the answer, not a failure. Since search requires the words to be adjacent, a
 * company that isn't here returns nothing — and for someone looking up their own name that IS the
 * finding. So this states the result, shows what it was measured against, and says what the
 * Gazette does not hold, rather than suggesting the user try harder.
 *
 * With filters on, the record is not what came back empty — the filtered slice is. Say so instead.
 */
export default function NoResults({ query, stats, filtersActive, onClearFilters }: NoResultsProps) {
  if (filtersActive) {
    return (
      <div className="nores">
        <h3>Nothing within these filters</h3>
        <p className="nores-lead">
          No notice mentioning <q>{query}</q> falls inside the filters you have set. The rest of the
          record has not been searched.
        </p>
        <button type="button" className="nores-clear" onClick={onClearFilters}>
          Search the whole record
        </button>
      </div>
    );
  }

  return (
    <div className="nores">
      <h3>Nothing on the record</h3>
      <p className="nores-lead">
        No notice in the New Zealand Gazette mentions <q>{query}</q>.
      </p>
      {stats && (
        <p className="nores-scope">
          Searched {formatCount(stats.notice_count)} notices, {formatLongDate(stats.oldest)} to{" "}
          {formatLongDate(stats.newest)}.
        </p>
      )}
      <p className="nores-scope">
        Fine Print covers liquidations, receiverships, company removals, bankruptcies, land and legal
        notices. Company registration details and director records are held by the Companies Office.
        Land titles are held by LINZ.
      </p>
    </div>
  );
}
