import { useMemo, type FormEvent } from "react";
import { ASK_EXAMPLES, SEARCH_EXAMPLES, shuffled } from "../data/examples";
import { useTypewriter } from "../hooks/useTypewriter";
import type { SearchMode } from "../lib/ui";

const TAG_HINT = "Add context — or just press Search to research the tag";

interface SearchDeckProps {
  mode: SearchMode;
  query: string;
  contextTags: string[];
  submitting: boolean;
  onSetMode: (mode: SearchMode) => void;
  onQueryChange: (value: string) => void;
  onRemoveTag: (index: number) => void;
  onSubmit: () => void;
}

/** The mode tabs + search bar that lives on the home page. */
export default function SearchDeck({
  mode,
  query,
  contextTags,
  submitting,
  onSetMode,
  onQueryChange,
  onRemoveTag,
  onSubmit,
}: SearchDeckProps) {
  // Re-shuffled per mount and per tab switch, so a visit never opens on the same example twice.
  const examples = useMemo(
    () => shuffled(mode === "search" ? SEARCH_EXAMPLES : ASK_EXAMPLES),
    [mode],
  );
  const placeholder = useTypewriter(examples, contextTags.length ? TAG_HINT : undefined);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <>
      <div className="deck">
        <div className="modes" role="tablist">
          <button
            className="modetab"
            role="tab"
            aria-selected={mode === "search"}
            onClick={() => onSetMode("search")}
          >
            Search
          </button>
          <button
            className="modetab"
            role="tab"
            aria-selected={mode === "ask"}
            onClick={() => onSetMode("ask")}
          >
            Ask a question
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <span className="mag">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
              <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>

          <div className="qfield">
            <span className="chips">
              {contextTags.map((tag, index) => (
                <span className="chip" key={tag}>
                  <b>{tag}</b>
                  <button type="button" title="remove" onClick={() => onRemoveTag(index)}>
                    ×
                  </button>
                </span>
              ))}
            </span>
            <input
              autoComplete="off"
              aria-label="Search the record"
              placeholder={placeholder}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>

          <button type="submit" className="submit" disabled={submitting}>
            {mode === "search" ? "Search →" : "Ask →"}
          </button>
        </form>
      </div>

      <div className="note">{mode === "search" ? <SearchNote /> : <AskNote />}</div>
    </>
  );
}

function SearchNote() {
  return (
    <>
      Type a name the way it is registered — the spelling has to match. Or describe the situation in
      a sentence, like <b>builders that went into liquidation in Christchurch</b>.
    </>
  );
}

function AskNote() {
  return (
    <>
      Ask in plain English. The desk searches, reads the notices and answers with its sources —
      slower than Search, because it reads before it answers.
    </>
  );
}
