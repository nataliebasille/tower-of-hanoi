"use client";

import { useHanoiSelector } from "../hanoi-player-context";
import { useReset } from "../hanoi.actions";
import { getStep, isPlaying } from "../hanoi.selectors";

export function HanoiResetButton() {
  const step = useHanoiSelector(getStep);
  const playing = useHanoiSelector(isPlaying);
  const reset = useReset();
  return (
    <button
      className="btn-outline/surface btn-size-md"
      disabled={!step.step && !playing}
      onClick={reset}
    >
      ↺ Reset
    </button>
  );
}
