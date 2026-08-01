import type { FormEvent } from "react";
import { useTypewriter } from "../hooks/useTypewriter";
import type { SearchMode } from "../lib/ui";

// Examples teach the product, so these lead with ordinary trading names — the shape someone
// checking a supplier or their own company would type — not famous collapses.
//
// Every name here was re-verified against the live DB (2026-08-01) AFTER search moved to
// phraseto_tsquery. That change matters: a query of 4 words or fewer takes the keyword route and
// now needs the words ADJACENT, so the previous term+place/term+year examples ("liquidation
// Auckland 2024", "CBL Insurance liquidation", "wine company liquidation") returned nothing at all.
// Anything short added here must be a real contiguous name and must be re-checked.
const SEARCH_EXAMPLES = [
  "Resolve Electrical",
  "Beachlands Cafe",
  "Central Plumbing Services",
  "Lyford Transport",
  "Concept Builders Queenstown",
  "Energize Electrical",
  "Pacey Log Transport",
  "Du Val Group",
  "Smiths City",
  "Sacred Hill",
  "builders that went into liquidation in Christchurch",
  "a cafe put into liquidation this year",
  "companies wound up by Inland Revenue",
  "trucking firms placed in receivership",
  "companies struck off for not filing returns",
  "land taken by the council for a road",
];
const ASK_EXAMPLES = [
  "Is it safe to do business with Resolve Electrical?",
  "Has anything been filed against Beachlands Cafe?",
  "My builder is Concept Builders Queenstown — should I be worried?",
  "A supplier of mine just had receivers appointed — how worried should I be?",
  "Is Sacred Hill still trading?",
  "Which construction companies in Christchurch went under recently?",
  "Are there directors who show up across lots of failed companies?",
  "Which banks appoint the most receivers?",
  "Any liquidations in the wine industry lately?",
  "Who is behind the Du Val collapse?",
  "What happened to Smiths City?",
];
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
  const examples = mode === "search" ? SEARCH_EXAMPLES : ASK_EXAMPLES;
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
