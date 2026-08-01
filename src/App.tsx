import { useEffect, useState } from "react";

import { askTheDeskStreaming, fetchCorpusStats, searchNotices } from "./api/client";
import type { CorpusStats, Notice, SearchFilters } from "./api/types";
import AskView from "./components/AskView";
import Colophon from "./components/Colophon";
import DetailView from "./components/DetailView";
import HomeView from "./components/HomeView";
import LegalView from "./components/LegalView";
import Masthead from "./components/Masthead";
import ResultsView from "./components/ResultsView";
import type { SearchMode, ViewName } from "./lib/ui";

const RESULT_LIMIT = 20;

export default function App() {
  const [view, setView] = useState<ViewName>("home");
  const [mode, setMode] = useState<SearchMode>("search");
  const [query, setQuery] = useState("");
  const [contextTags, setContextTags] = useState<string[]>([]);

  // search state — searchedQuery is the text the results on screen belong to, which is not `query`
  // once the box is edited; the zero-result page names it, so it has to be the one actually run.
  const [results, setResults] = useState<Notice[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Size of the record, quoted when a search finds nothing. Null until it arrives (or if it fails),
  // and the page simply omits the line rather than printing a number it can't stand behind.
  const [stats, setStats] = useState<CorpusStats | null>(null);
  useEffect(() => {
    fetchCorpusStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  // filter state (results sidebar)
  const [category, setCategory] = useState<string | null>(null);
  const [sinceYear, setSinceYear] = useState(2000);
  const [minSignificance, setMinSignificance] = useState(0);

  // detail + ask state — the ask pieces fill in as they stream, not all at once
  const [selected, setSelected] = useState<Notice | null>(null);
  const [askSteps, setAskSteps] = useState<string[]>([]);
  const [askSources, setAskSources] = useState<Notice[]>([]);
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const goTo = (next: ViewName) => {
    setView(next);
    window.scrollTo(0, 0);
  };

  const changeMode = (next: SearchMode) => {
    setMode(next);
    setQuery("");
    if (next === "search") setContextTags([]); // tags are an Ask-mode context
  };

  const removeTag = (index: number) => setContextTags((tags) => tags.filter((_, i) => i !== index));

  // From a notice, jump to Ask with that entity as a context chip.
  const researchEntity = (entityName: string) => {
    setMode("ask");
    setQuery("");
    setContextTags((tags) => (tags.includes(entityName) ? tags : [...tags, entityName]));
    goTo("home");
  };

  const openNotice = (notice: Notice) => {
    setSelected(notice);
    goTo("detail");
  };

  async function executeSearch(rawQuery: string, filters: SearchFilters) {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;

    goTo("results");
    setSearchedQuery(trimmed);
    setSearchLoading(true);
    setSearchError(null);
    try {
      const response = await searchNotices(trimmed, filters, RESULT_LIMIT);
      setResults(response.results);
      setResultCount(response.count);
    } catch (error) {
      setResults([]);
      setResultCount(0);
      setSearchError(messageOf(error));
    } finally {
      setSearchLoading(false);
    }
  }

  async function runAsk() {
    const askQuery = [...contextTags, query.trim()].filter(Boolean).join(" ").trim();
    if (!askQuery) return;

    goTo("agent");
    setAskSteps([]);
    setAskSources([]);
    setAskAnswer(null);
    setAskError(null);
    setAskLoading(true);
    try {
      await askTheDeskStreaming(askQuery, {
        onStep: (text) => setAskSteps((steps) => [...steps, text]),
        onSource: (notice) => setAskSources((sources) => [...sources, notice]),
        onAnswer: setAskAnswer,
      });
    } catch (error) {
      setAskError(messageOf(error));
    } finally {
      setAskLoading(false);
    }
  }

  const submit = () => {
    if (mode === "search") executeSearch(query, buildFilters(category, sinceYear, minSignificance));
    else runAsk();
  };

  // Front-page examples run immediately — passing the text straight through, because setQuery
  // wouldn't have landed by the time submit() read it.
  const runExample = (example: string) => {
    setQuery(example);
    executeSearch(example, buildFilters(category, sinceYear, minSignificance));
  };

  // Category commits immediately; sliders update live and re-search on release.
  const changeCategory = (value: string | null) => {
    setCategory(value);
    executeSearch(query, buildFilters(value, sinceYear, minSignificance));
  };
  const commitFilters = () => executeSearch(query, buildFilters(category, sinceYear, minSignificance));

  // Offered when filters are what emptied the page — reset them and re-run over the whole record.
  const clearFilters = () => {
    setCategory(null);
    setSinceYear(2000);
    setMinSignificance(0);
    executeSearch(searchedQuery, {});
  };

  return (
    <div className="wrap">
      <Masthead view={view} stats={stats} onGoHome={() => goTo("home")} onGoTo={goTo} />

      {/* grows to fill the viewport so the colophon sits at the bottom on short pages */}
      <main className="main">
        {view === "home" && (
          <HomeView
            mode={mode}
            query={query}
            contextTags={contextTags}
            submitting={searchLoading || askLoading}
            onSetMode={changeMode}
            onQueryChange={setQuery}
            onRemoveTag={removeTag}
            onSubmit={submit}
            onRunExample={runExample}
          />
        )}

        {view === "results" && (
          <ResultsView
            results={results}
            count={resultCount}
            loading={searchLoading}
            error={searchError}
            searchedQuery={searchedQuery}
            stats={stats}
            onOpenNotice={openNotice}
            category={category}
            sinceYear={sinceYear}
            minSignificance={minSignificance}
            onCategoryChange={changeCategory}
            onSinceYearChange={setSinceYear}
            onMinSignificanceChange={setMinSignificance}
            onCommitFilters={commitFilters}
            onClearFilters={clearFilters}
          />
        )}

        {view === "detail" && selected && <DetailView notice={selected} onResearch={researchEntity} />}

        {view === "agent" && (
          <AskView
            loading={askLoading}
            steps={askSteps}
            answer={askAnswer}
            sources={askSources}
            error={askError}
            onOpenNotice={openNotice}
          />
        )}

        {view === "legal" && <LegalView />}
      </main>

      <Colophon onOpenLegal={() => goTo("legal")} />
    </div>
  );
}

/** Turn the sidebar filter state into the API's filter object (omit "no filter" values). */
function buildFilters(category: string | null, sinceYear: number, minSignificance: number): SearchFilters {
  const filters: SearchFilters = {};
  if (category) filters.event_category = category;
  if (sinceYear > 2000) filters.date_from = `${sinceYear}-01-01`;
  if (minSignificance > 0) filters.min_significance = minSignificance;
  return filters;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
