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
 * While the desk works, the call log leads and grows. Once the briefing lands it takes the top and
 * the log moves under it — the report first, then every lookup that produced it, in full.
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
  const [workingOpen, setWorkingOpen] = useState(true);

  if (error) return <div className="state err">{error}</div>;
  // Shared link or reload: never auto-run, a run costs an agent loop against the daily budget.
  if (!loading && !answer && steps.length === 0) {
    return <Unstarted question={question} onRun={onRun} />;
  }

  return (
    <>
      {loading && <CallLog steps={steps} live />}

      {answer && <Briefing answer={answer} sources={sources} onOpenNotice={onOpenNotice} />}

      {!loading && steps.length > 0 && (
        <section className="working">
          <div className="working-head">
            <h4>
              How this was researched · {steps.length} {steps.length === 1 ? "lookup" : "lookups"}
            </h4>
            <button type="button" onClick={() => setWorkingOpen((open) => !open)} aria-expanded={workingOpen}>
              {workingOpen ? "Hide" : "Show"}
            </button>
          </div>
          {workingOpen && <CallLog steps={steps} />}
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

/** Every lookup the agent made: the tool, the arguments it passed, what came back, how long it
 *  took, and the model's own line about why. `live` marks the run still in progress. */
function CallLog({ steps, live = false }: { steps: AgentStep[]; live?: boolean }) {
  if (steps.length === 0) {
    return (
      <div className="calls live">
        <div className="waiting">Consulting the record</div>
      </div>
    );
  }

  return (
    <div className={live ? "calls live" : "calls"}>
      {steps.map((step) => (
        <Call key={step.index} step={step} inFlight={live && step.summary === null} />
      ))}
    </div>
  );
}

function Call({ step, inFlight }: { step: AgentStep; inFlight: boolean }) {
  const args = JSON.stringify(step.args ?? {});

  return (
    <div className={inFlight ? "call inflight" : "call"}>
      <div className="call-head">
        <span className="tool">{step.tool}</span>
        {step.ms !== null && <span className="ms">{step.ms} ms</span>}
      </div>
      {args !== "{}" && <div className="call-args">{args}</div>}
      {step.summary && <div className="call-out">→ {step.summary}</div>}
      {step.narration && <div className="call-say">{step.narration}</div>}
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
