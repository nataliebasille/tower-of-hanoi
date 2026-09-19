"use client";

import { useHanoiSelector } from "../hanoi-player-context";
import { isComplete, isPlaying } from "../hanoi.selectors";
import { useNextStep } from "../hanoi.actions";

export function HanoiNextStepButton() {
  const playing = useHanoiSelector(isPlaying);
  const complete = useHanoiSelector(isComplete);
  const next = useNextStep();

  return (
    <button
      className="btn-outline/secondary btn-size-md"
      disabled={playing || complete}
      onClick={next}
    >
      Step →
    </button>
  );
}
