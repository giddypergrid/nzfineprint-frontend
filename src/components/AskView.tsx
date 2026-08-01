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
 */
export default function AskView({ loading, steps, answer, sources, error, onOpenNotice }: AskViewProps) {
  if (error) return <div className="state err">{error}</div>;
  if (!loading && !answer && steps.length === 0) return null;

  return (
    <>
      <div className="steps">
        {steps.map((step, index) => (
          <div key={index} className={loading && index === steps.length - 1 ? "pending" : undefined}>
            — {step}
          </div>
        ))}
        {loading && steps.length === 0 && <div className="pending">Consulting the record</div>}
      </div>

      {answer && <Briefing answer={answer} sources={sources} onOpenNotice={onOpenNotice} />}
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
