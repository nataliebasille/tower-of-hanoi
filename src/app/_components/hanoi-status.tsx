"use client";

import { useHanoiSelector } from "./hanoi-player-context";
import { getStep, isComplete, isPlaying } from "./hanoi.selectors";

export function Status() {
  const complete = useHanoiSelector(isComplete);
  const playing = useHanoiSelector(isPlaying);
  const step = useHanoiSelector(getStep);

  return (
    <span className="status">
      ● &nbsp;
      {complete ?
        "Solved"
      : playing ?
        "In motion"
      : step ?
        "Paused"
      : "Ready when you are"}
    </span>
  );
}
