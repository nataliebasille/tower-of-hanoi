"use client";

import { useEffect } from "react";
import { useHanoiSelector } from "./hanoi-player-context";
import { useNextStep, usePause } from "./hanoi.actions";
import { getSpeed } from "./hanoi.selectors";

export function HanoiPlayback() {
  const next = useNextStep();
  const playing = useHanoiSelector((state) => state.playing);
  const speed = useHanoiSelector(getSpeed);

  const pause = usePause();

  useEffect(() => {
    if (!playing) {
      return;
    }

    update();
    const interval = setInterval(() => {
      update();
    }, speed);

    function update() {
      const step = next().step;
      if (step.complete) {
        pause();
      }
    }

    return () => clearInterval(interval);
  }, [speed, playing, pause, next]);

  return null;
}
