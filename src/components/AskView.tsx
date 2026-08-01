import { useState } from "react";

import type { Notice } from "../api/types";
import { noticeTitle, splitLeadSentence } from "../lib/format";

interface AskViewProps {
  loading: boolean;
  steps: string[];
  answer: string | null;
  sources: Notice[];
  error: string | null;
  onOpenNotice: (notice: Notice) => void;
}

/**
 * The "Ask the desk" page. Stage lines stream in one at a time as the agent performs each lookup;
 * the briefing appears once the report arrives.
 *
 * A run can make twenty-odd lookups, so the narration is windowed while it runs and folded away
 * once it's done — the working is worth watching live, but it isn't the deliverable.
 */
export default function AskView({ loading, steps, answer, sources, error, onOpenNotice }: AskViewProps) {
  const [stepsUnfolded, setStepsUnfolded] = useState(false);

  if (error) return <div className="state err">{error}</div>;
  if (!loading && !answer && steps.length === 0) return null;

  return (
    <>
      {loading ? (
        <RollingSteps steps={steps} />
      ) : (
        steps.length > 0 && (
          <FoldedSteps
            steps={steps}
            unfolded={stepsUnfolded}
            onToggle={() => setStepsUnfolded((open) => !open)}
          />
        )
      )}

      {answer && <Briefing answer={answer} sources={sources} onOpenNotice={onOpenNotice} />}
    </>
  );
}

/**
 * The live window. Every step stays in the DOM, but the box is a fixed four lines tall: the newest
 * sits at the bottom and older ones ride up under a fade. Fixed height is the point — the briefing
 * below must not get shoved down the page each time a lookup lands.
 */
function RollingSteps({ steps }: { steps: string[] }) {
  if (steps.length === 0) {
    return (
      <div className="steps rolling">
        <div className="pending">Consulting the record</div>
      </div>
    );
  }

  return (
    <div className="steps rolling">
      {steps.map((step, index) => (
        <div key={index} className={index === steps.length - 1 ? "pending" : undefined}>
          — {step}
        </div>
      ))}
    </div>
  );
}

/** Once the report has landed, the working collapses to one line with an unfold control. */
function FoldedSteps({
  steps,
  unfolded,
  onToggle,
}: {
  steps: string[];
  unfolded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <div className="steps-fold">
        <span>
          {steps.length} {steps.length === 1 ? "lookup" : "lookups"} made
        </span>
        <button type="button" onClick={onToggle} aria-expanded={unfolded}>
          {unfolded ? "Fold" : "Unfold"}
        </button>
      </div>

      {unfolded && (
        <div className="steps">
          {steps.map((step, index) => (
            <div key={index}>— {step}</div>
          ))}
        </div>
      )}
    </>
  );
}

function Briefing({
  answer,
  sources,
  onOpenNotice,
}: {
  answer: string;
  sources: Notice[];
  onOpenNotice: (notice: Notice) => void;
}) {
  const { headline, body } = splitLeadSentence(answer);

  return (
    <div className="brief">
      <span className="stamp">Briefing</span>
      {headline && <h2>{headline}</h2>}

      {body.length > 0 && (
        <div className="cols">
          {body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      {sources.length > 0 && (
        <div className="foots">
          <h4>
            Sources · {sources.length} {sources.length === 1 ? "notice" : "notices"} consulted
          </h4>
          {sources.map((source, index) => (
            <div className="fsrc" key={source.id} onClick={() => onOpenNotice(source)}>
              <span className="n">[{index + 1}]</span>
              <span>{noticeTitle(source)}</span>
              <span className="d">{source.date ?? ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
