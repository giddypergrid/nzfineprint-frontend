import type { CorpusStats } from "../api/types";
import { MASTHEAD_BACK, type ViewName } from "../lib/ui";

const TODAY = new Date().toLocaleDateString("en-NZ", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const STRAP = "Liquidations · Receiverships · Removals · Land · Legal · Appointments · Bankruptcies";

/** "2000 — July 2026", from the newest notice actually loaded. It used to read "2000 — Current",
 *  which is a claim the data has to earn — the loader can be days behind. */
function recordSpan(stats: CorpusStats | null): string {
  if (!stats?.oldest || !stats.newest) return "Since 2000";
  const to = new Date(stats.newest).toLocaleDateString("en-NZ", { month: "long", year: "numeric" });
  return `${stats.oldest.slice(0, 4)} — ${to}`;
}

interface MastheadProps {
  view: ViewName;
  stats: CorpusStats | null;
  onGoHome: () => void;
  onGoTo: (view: ViewName) => void;
}

/**
 * The paper's masthead. The "Fine Print" logotype is always the home link. On sub-views a
 * back / new control sits on the masthead line (right); the home page shows the record's span.
 */
export default function Masthead({ view, stats, onGoHome, onGoTo }: MastheadProps) {
  const back = view === "home" ? null : MASTHEAD_BACK[view];

  return (
    <>
      <div className="top">
        <span>{TODAY}</span>
      </div>
      <div className="masthead">
        <div className="mast-id">
          <div className="eyebrow">The New Zealand Gazette</div>
          <h1 onClick={onGoHome} title="Back to the front page">
            Fine Print
          </h1>
          <div className="strap">{STRAP}</div>
        </div>

        {back ? (
          <button className="mast-back" onClick={() => onGoTo(back.to)}>
            {back.label}
          </button>
        ) : (
          <div className="mast-since">{recordSpan(stats)}</div>
        )}
      </div>
    </>
  );
}
