import type { AgentStep, AgentStepEvent } from "../api/types";

/**
 * Fold one streamed frame into the call log. A "call" frame appends the lookup as it is made; the
 * "result" frame that follows fills in what came back. Returns a new array, so React re-renders.
 */
export function mergeStepEvent(steps: AgentStep[], event: AgentStepEvent): AgentStep[] {
  const position = steps.findIndex((step) => step.index === event.index);

  if (position === -1) {
    return [
      ...steps,
      {
        index: event.index,
        tool: event.tool,
        args: event.args ?? {},
        narration: event.narration ?? null,
        summary: event.summary ?? null,
        ms: event.ms ?? null,
      },
    ];
  }

  const merged = [...steps];
  merged[position] = {
    ...merged[position],
    summary: event.summary ?? merged[position].summary,
    ms: event.ms ?? merged[position].ms,
  };
  return merged;
}
