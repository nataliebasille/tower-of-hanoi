"use client";

import { useHanoiSelector } from "../hanoi-player-context";
import { useDecrementDiscs, useIncrementDiscs } from "../hanoi.actions";
import {
  canDecrementDiscCount,
  canIncrementDiscCount,
  getDiscCount,
} from "../hanoi.selectors";

export function HanoiDiscsControl() {
  const canDecrement = useHanoiSelector(canDecrementDiscCount);
  const canIncrement = useHanoiSelector(canIncrementDiscCount);
  const discs = useHanoiSelector(getDiscCount);
  const decrement = useDecrementDiscs();
  const increment = useIncrementDiscs();

  return (
    <div className="disc-setting">
      <label htmlFor="disc-count">Discs</label>
      <div className="disc-stepper">
        <button
          className="btn-icon btn-ghost/surface btn-size-sm"
          aria-label="Fewer discs"
          disabled={!canDecrement}
          onClick={decrement}
        >
          −
        </button>
        <output id="disc-count" aria-live="polite">
          {discs}
        </output>
        <button
          className="btn-icon btn-ghost/surface btn-size-sm"
          aria-label="More discs"
          disabled={!canIncrement}
          onClick={increment}
        >
          +
        </button>
      </div>
    </div>
  );
}
