import { NAME_EXAMPLES, SENTENCE_EXAMPLES } from "../data/examples";

/**
 * Runnable examples under the leader. They were only ever visible as placeholder text that flashes
 * past, so the two query shapes the search actually supports — an exact registered name, or a
 * described situation — were never reachable. Splitting them makes the difference legible, since
 * names must match exactly and sentences don't.
 */
export default function TryRow({ onRun }: { onRun: (query: string) => void }) {
  return (
    <div className="tryrow">
      <TrySet
        label="Look up a name"
        note="Matched exactly, as registered"
        examples={NAME_EXAMPLES}
        onRun={onRun}
      />
      <TrySet
        label="Or describe a situation"
        note="Read and matched on meaning"
        examples={SENTENCE_EXAMPLES}
        onRun={onRun}
      />
    </div>
  );
}

function TrySet({
  label,
  note,
  examples,
  onRun,
}: {
  label: string;
  note: string;
  examples: string[];
  onRun: (query: string) => void;
}) {
  return (
    <div className="tryset">
      <h3>
        {label} <span>{note}</span>
      </h3>
      <div className="trychips">
        {examples.map((example) => (
          <button type="button" key={example} onClick={() => onRun(example)}>
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
