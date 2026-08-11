import { useState } from "react";

import type { AgentStep, Notice } from "../api/types";
import { noticeTitle, splitLeadSentence } from "../lib/format";

interface AskViewProps {
  question: string;
  loading: boolean;
  steps: AgentStep[];
  answer: string | null;
  sources: Notice[];
  error: string | null;
  onRun: () => void;
  onOpenNotice: (notice: Notice) => void;
}

/**
 * Stage lines stream in as the agent works. They stay readable in full at every width — a phone used
 * to clip each one to a single truncated line — and stay on the page after the briefing lands.
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
  const [stepsOpen, setStepsOpen] = useState(true);

  if (error) return <div className="state err">{error}</div>;
  // Shared link or reload: never auto-run, a run costs an agent loop against the daily budget.
  if (!loading && !answer && steps.length === 0) {
    return <Unstarted question={question} onRun={onRun} />;
  }

  return (
    <>
      {loading && <Steps steps={steps} live />}

      {answer && <Briefing answer={answer} sources={sources} onOpenNotice={onOpenNotice} />}

      {!loading && steps.length > 0 && (
        <section className="working">
          <div className="working-head">
            <h4>
              How this was researched · {steps.length} {steps.length === 1 ? "lookup" : "lookups"}
            </h4>
            <button type="button" onClick={() => setStepsOpen((open) => !open)} aria-expanded={stepsOpen}>
              {stepsOpen ? "Hide" : "Show"}
            </button>
          </div>
          {stepsOpen && <Steps steps={steps} />}
        </section>
      )}
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

/** The agent's own account of each lookup, one line per step. `live` blinks a cursor on the newest. */
function Steps({ steps, live = false }: { steps: string[]; live?: boolean }) {
  if (steps.length === 0) {
    return (
      <div className="steps live">
        <div className="step pending">Consulting the record</div>
      </div>
    );
  }

  return (
    <div className={live ? "steps live" : "steps"}>
      {steps.map((step, index) => (
        <div key={index} className={live && index === steps.length - 1 ? "step pending" : "step"}>
          {step}
        </div>
      ))}
    </div>
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
