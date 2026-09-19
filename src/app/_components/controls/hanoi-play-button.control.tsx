"use client";

import { useCallback } from "react";
import { useHanoiSelector } from "../hanoi-player-context";
import { usePause, usePlay, useReset } from "../hanoi.actions";
import { getStep, isComplete, isPlaying } from "../hanoi.selectors";

export function HanoiPlayButton() {
  const complete = useHanoiSelector(isComplete);
  const step = useHanoiSelector(getStep);
  const playing = useHanoiSelector(isPlaying);

  const play = usePlay();
  const pause = usePause();
  const reset = useReset();

  const handlePlayAction = useCallback(() => {
    if (complete) {
      reset();
      play();
    } else if (playing) pause();
    else play();
  }, [complete, playing, reset, pause, play]);

  return (
    <button
      className="player-play btn-solid/primary btn-size-md"
      onClick={handlePlayAction}
    >
      {playing ?
        "Ⅱ Pause"
      : complete ?
        "↻ Replay"
      : step.step > 0 ?
        "▶ Resume"
      : "▶ Play"}
    </button>
  );
}
