"use client";

import { useHanoiSelector } from "./hanoi-player-context";
import {
  getPreviousStep,
  getStep,
  getTotalSteps,
  isComplete,
} from "./hanoi.selectors";

export function PlaybackInfo() {
  const complete = useHanoiSelector(isComplete);
  const previous = useHanoiSelector(getPreviousStep)?.locations ?? [];
  const locations = useHanoiSelector(getStep).locations;
  const step = useHanoiSelector(getStep);
  const total = useHanoiSelector(getTotalSteps);

  return (
    <div className="playback-info">
      <div>
        <span className="muted">
          {complete ?
            null
          : step.movedDisc == null ?
            null
          : `Disc ${step.movedDisc + 1}: Peg ${"ABC"[previous[step.movedDisc]]} → Peg ${"ABC"[locations[step.movedDisc]]}`
          }
        </span>
        <strong>
          {step.step} <span>/ {total} moves</span>
        </strong>
      </div>
      <progress value={step.step} max={total} aria-label="Solution progress" />
    </div>
  );
}
