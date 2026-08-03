import type { CorpusStats, Notice } from "../api/types";
import { formatCategory, noticeTitle, significanceTier, summarySnippet } from "../lib/format";
import { filtersActive } from "../lib/routing";
import Filters from "./Filters";
import NoResults from "./NoResults";

interface ResultsViewProps {
  results: Notice[];
  count: number;
  loading: boolean;
  error: string | null;
  searchedQuery: string;
  stats: CorpusStats | null;
  onOpenNotice: (notice: Notice) => void;
  // filter state + handlers, passed straight through to <Filters>
  category: string | null;
  sinceYear: number;
  minSignificance: number;
  onCategoryChange: (value: string | null) => void;
  onSinceYearChange: (year: number) => void;
  onMinSignificanceChange: (value: number) => void;
  onCommitFilters: () => void;
  onClearFilters: () => void;
}

/** The results page: filters sidebar + the ledger table of notices. */
export default function ResultsView({
  results,
  count,
  loading,
  error,
  searchedQuery,
  stats,
  onOpenNotice,
  category,
  sinceYear,
  minSignificance,
  onCategoryChange,
  onSinceYearChange,
  onMinSignificanceChange,
  onCommitFilters,
  onClearFilters,
}: ResultsViewProps) {
  const anyFilterSet = filtersActive({ category, sinceYear, minSignificance });

  return (
    <section>
      <div className="resbar">
        <h2>Search results</h2>
        <span className="c">{loading ? "searching…" : `${count} ${count === 1 ? "notice" : "notices"}`}</span>
      </div>

      <div className="grid">
        <Filters
          category={category}
          sinceYear={sinceYear}
          minSignificance={minSignificance}
          onCategoryChange={onCategoryChange}
          onSinceYearChange={onSinceYearChange}
          onMinSignificanceChange={onMinSignificanceChange}
          onCommit={onCommitFilters}
        />

        <div>
          <ResultsBody
            results={results}
            loading={loading}
            error={error}
            searchedQuery={searchedQuery}
            stats={stats}
            filtersActive={anyFilterSet}
            onOpenNotice={onOpenNotice}
            onClearFilters={onClearFilters}
          />
        </div>
      </div>
    </section>
  );
}

type ResultsBodyProps = Pick<
  ResultsViewProps,
  "results" | "loading" | "error" | "searchedQuery" | "stats" | "onOpenNotice" | "onClearFilters"
> & { filtersActive: boolean };

function ResultsBody({
  results,
  loading,
  error,
  searchedQuery,
  stats,
  filtersActive,
  onOpenNotice,
  onClearFilters,
}: ResultsBodyProps) {
  if (loading) return <div className="state">Searching the record…</div>;
  if (error) return <div className="state err">{error}</div>;
  if (results.length === 0) {
    return (
      <NoResults
        query={searchedQuery}
        stats={stats}
        filtersActive={filtersActive}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <table className="ledger">
      <thead>
        <tr>
          <th>Notice</th>
          <th>Category</th>
          <th>Published</th>
          <th className="num">Significance</th>
        </tr>
      </thead>
      <tbody>
        {results.map((notice) => (
          <ResultRow key={notice.id} notice={notice} onOpen={() => onOpenNotice(notice)} />
        ))}
      </tbody>
    </table>
  );
}

function ResultRow({ notice, onOpen }: { notice: Notice; onOpen: () => void }) {
  const score = notice.significance_score;
  const tier = significanceTier(score);

  return (
    <tr className="entry" onClick={onOpen}>
      <td className="title">
        {noticeTitle(notice)}
        <div className="tsum">{summarySnippet(notice.plain_english)}</div>
        <small>{notice.id}</small>
      </td>
      <td className="cat">{formatCategory(notice.event_category)}</td>
      <td className="date">{notice.date ?? "—"}</td>
      <td className="sigcell">
        <span className="n">{score ?? "—"}</span>
        <span className={`sigbar ${tier}`}>
          <i style={{ width: `${score ?? 0}%` }} />
        </span>
      </td>
    </tr>
  );
}
