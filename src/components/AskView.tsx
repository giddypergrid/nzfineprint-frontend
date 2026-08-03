import { useState } from "react";

import type { Notice } from "../api/types";
import { noticeTitle, splitLeadSentence } from "../lib/format";

interface AskViewProps {
  question: string;
  loading: boolean;
  steps: string[];
  answer: string | null;
  sources: Notice[];
  error: string | null;
  onRun: () => void;
  onOpenNotice: (notice: Notice) => void;
}

/**
 * Stage lines stream in as the agent works, then the briefing lands. A run can make twenty-odd
 * lookups, so the narration is windowed live and folded away after — worth watching, not the
 * deliverable.
 */
export default function AskView({
  question,
  loading,
  steps,
  answer,
  sources,
  error,
  onRun,
  onOpenNotice,
}: AskViewProps) {
  const [stepsUnfolded, setStepsUnfolded] = useState(false);

  if (error) return <div className="state err">{error}</div>;
  // Shared link or reload: never auto-run, a run costs an agent loop against the daily budget.
  if (!loading && !answer && steps.length === 0) {
    return <Unstarted question={question} onRun={onRun} />;
  }

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

function Unstarted({ question, onRun }: { question: string; onRun: () => void }) {
  return (
    <div className="unstarted">
      <span className="stamp">Question</span>
      <h2>{question}</h2>
      <button type="button" className="submit" onClick={onRun}>
        Research this →
      </button>
    </div>
  );
}

/** Fixed four lines tall, newest at the bottom, older riding up under a fade. Fixed is the point:
 *  the briefing below must not get shoved down each time a lookup lands. */
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
