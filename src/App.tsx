import { useCallback, useEffect, useRef, useState } from "react";

import { askTheDeskStreaming, fetchCorpusStats, fetchNotice, searchNotices } from "./api/client";
import type { CorpusStats, Notice } from "./api/types";
import AskView from "./components/AskView";
import Colophon from "./components/Colophon";
import DetailView from "./components/DetailView";
import HomeView from "./components/HomeView";
import LegalView from "./components/LegalView";
import Masthead from "./components/Masthead";
import ResultsView from "./components/ResultsView";
import {
  HOME,
  NO_FILTERS,
  parseRoute,
  routeToPath,
  toApiFilters,
  type ResultFilters,
  type Route,
} from "./lib/routing";
import type { SearchMode } from "./lib/ui";

const RESULT_LIMIT = 20;

interface SearchSnapshot {
  results: Notice[];
  count: number;
}

interface AskSnapshot {
  steps: string[];
  sources: Notice[];
  answer: string | null;
}

const EMPTY_SEARCH: SearchSnapshot = { results: [], count: 0 };
const EMPTY_ASK: AskSnapshot = { steps: [], sources: [], answer: null };

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location));

  // Home deck state — deliberately NOT in the URL. It is what the reader is composing, not a page.
  // Ask leads: it answers the question people actually arrive with, and shows the research working.
  const [mode, setMode] = useState<SearchMode>("ask");
  const [query, setQuery] = useState("");
  const [contextTags, setContextTags] = useState<string[]>([]);

  const [stats, setStats] = useState<CorpusStats | null>(null);
  useEffect(() => {
    fetchCorpusStats()
      .then(setStats)
      .catch(() => setStats(null));   // the page omits the line rather than quote a number it can't stand behind
  }, []);

  // Keyed by the address that produced it, so Back is instant and never re-runs a paid agent.
  const searchCache = useRef(new Map<string, SearchSnapshot>());
  const askCache = useRef(new Map<string, AskSnapshot>());
  const noticeCache = useRef(new Map<string, Notice>());

  const navigate = useCallback((next: Route, replace = false) => {
    const path = routeToPath(next);
    if (replace) window.history.replaceState(null, "", path);
    else window.history.pushState(null, "", path);
    setRoute(next);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location));
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goHome = useCallback(() => navigate(HOME), [navigate]);
  const goBack = useCallback(() => window.history.back(), []);

  const routeKey = routeToPath(route);

  // --- results -------------------------------------------------------------------------------
  const [search, setSearch] = useState<SearchSnapshot>(EMPTY_SEARCH);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] = useState<ResultFilters>(NO_FILTERS);

  useEffect(() => {
    if (route.view !== "results") return;
    setDraftFilters(route.filters);
    setSearchError(null);

    const cached = searchCache.current.get(routeKey);
    if (cached) {
      setSearch(cached);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    searchNotices(route.query, toApiFilters(route.filters), RESULT_LIMIT)
      .then((response) => {
        if (cancelled) return;
        const snapshot = { results: response.results, count: response.count };
        searchCache.current.set(routeKey, snapshot);
        response.results.forEach((notice) => noticeCache.current.set(notice.id, notice));
        setSearch(snapshot);
      })
      .catch((error) => {
        if (cancelled) return;
        setSearch(EMPTY_SEARCH);
        setSearchError(messageOf(error));
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [routeKey]);   // routeKey encodes the query and every filter, so it is the whole input

  // --- one notice ----------------------------------------------------------------------------
  const [notice, setNotice] = useState<Notice | null>(null);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  useEffect(() => {
    if (route.view !== "detail") return;
    setNoticeError(null);

    const cached = noticeCache.current.get(route.noticeId);
    if (cached) {
      setNotice(cached);
      return;
    }

    let cancelled = false;
    setNotice(null);   // arrived by link or reload — fetch it before the article can render
    fetchNotice(route.noticeId)
      .then((fetched) => {
        if (cancelled) return;
        noticeCache.current.set(fetched.id, fetched);
        setNotice(fetched);
      })
      .catch((error) => {
        if (!cancelled) setNoticeError(messageOf(error));
      });

    return () => {
      cancelled = true;
    };
  }, [routeKey]);

  // --- ask -----------------------------------------------------------------------------------
  const [ask, setAsk] = useState<AskSnapshot>(EMPTY_ASK);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const runningAskKey = useRef<string | null>(null);

  const runAsk = useCallback(
    async (question: string) => {
      const snapshot: AskSnapshot = { steps: [], sources: [], answer: null };
      const seenSourceIds = new Set<string>();
      setAsk(snapshot);
      setAskError(null);
      setAskLoading(true);
      try {
        await askTheDeskStreaming(question, {
          onStep: (text) => {
            snapshot.steps = [...snapshot.steps, text];
            setAsk({ ...snapshot });
          },
          onSource: (source) => {
            if (seenSourceIds.has(source.id)) return;
            seenSourceIds.add(source.id);
            noticeCache.current.set(source.id, source);
            snapshot.sources = [...snapshot.sources, source];
            setAsk({ ...snapshot });
          },
          onAnswer: (text) => {
            snapshot.answer = text;
            setAsk({ ...snapshot });
          },
        });
        askCache.current.set(routeToPath({ view: "agent", question }), snapshot);
      } catch (error) {
        setAskError(messageOf(error));
      } finally {
        runningAskKey.current = null;
        setAskLoading(false);
      }
    },
    [],
  );

  // A question is asked once and answered once: a cached answer is restored, anything else runs on
  // arrival. The ref stops a second run of a question already streaming (remount, Back, StrictMode).
  useEffect(() => {
    if (route.view !== "agent") return;
    setAskError(null);

    const cached = askCache.current.get(routeKey);
    if (cached) {
      setAsk(cached);
      setAskLoading(false);
      return;
    }

    if (runningAskKey.current === routeKey) return;
    runningAskKey.current = routeKey;
    runAsk(route.question);
  }, [routeKey]);

  // --- navigation from the UI ----------------------------------------------------------------
  const changeMode = (next: SearchMode) => {
    setMode(next);
    setQuery("");
    if (next === "search") setContextTags([]);   // tags are an Ask-mode context
  };

  const removeTag = (index: number) => setContextTags((tags) => tags.filter((_, i) => i !== index));

  const openNotice = (opened: Notice) => {
    noticeCache.current.set(opened.id, opened);
    navigate({ view: "detail", noticeId: opened.id });
  };

  /** From a notice, jump to Ask with that entity as a context chip. */
  const researchEntity = (entityName: string) => {
    setMode("ask");
    setQuery("");
    setContextTags((tags) => (tags.includes(entityName) ? tags : [...tags, entityName]));
    navigate(HOME);
  };

  const submit = () => {
    const typed = query.trim();
    if (mode === "search") {
      if (typed) navigate({ view: "results", query: typed, filters: NO_FILTERS });
      return;
    }
    const question = [...contextTags, typed].filter(Boolean).join(" ").trim();
    if (!question) return;
    navigate({ view: "agent", question });   // the agent route runs it on arrival
  };

  // The query comes from the address, never from half-typed text still sitting in the box.
  const searchWithFilters = (filters: ResultFilters) => {
    if (route.view !== "results") return;
    navigate({ view: "results", query: route.query, filters });
  };

  return (
    <div className="wrap">
      <Masthead view={route.view} stats={stats} onGoHome={goHome} onGoBack={goBack} />

      {/* grows to fill the viewport so the colophon sits at the bottom on short pages */}
      <main className="main">
        {route.view === "home" && (
          <HomeView
            mode={mode}
            query={query}
            contextTags={contextTags}
            submitting={searchLoading || askLoading}
            stats={stats}
            onSetMode={changeMode}
            onQueryChange={setQuery}
            onRemoveTag={removeTag}
            onSubmit={submit}
          />
        )}

        {route.view === "results" && (
          <ResultsView
            results={search.results}
            count={search.count}
            loading={searchLoading}
            error={searchError}
            searchedQuery={route.query}
            stats={stats}
            onOpenNotice={openNotice}
            category={draftFilters.category}
            sinceYear={draftFilters.sinceYear}
            minSignificance={draftFilters.minSignificance}
            onCategoryChange={(category) => searchWithFilters({ ...draftFilters, category })}
            onSinceYearChange={(sinceYear) => setDraftFilters((f) => ({ ...f, sinceYear }))}
            onMinSignificanceChange={(minSignificance) =>
              setDraftFilters((f) => ({ ...f, minSignificance }))
            }
            onCommitFilters={() => searchWithFilters(draftFilters)}
            onClearFilters={() => searchWithFilters(NO_FILTERS)}
          />
        )}

        {route.view === "detail" &&
          (noticeError ? (
            <div className="state err">{noticeError}</div>
          ) : notice ? (
            <DetailView notice={notice} onResearch={researchEntity} />
          ) : (
            <div className="state">Fetching the notice…</div>
          ))}

        {route.view === "agent" && (
          <AskView
            question={route.question}
            loading={askLoading}
            steps={ask.steps}
            answer={ask.answer}
            sources={ask.sources}
            error={askError}
            onOpenNotice={openNotice}
          />
        )}

        {route.view === "legal" && <LegalView />}
      </main>

      <Colophon onOpenLegal={() => navigate({ view: "legal" })} />
    </div>
  );
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
