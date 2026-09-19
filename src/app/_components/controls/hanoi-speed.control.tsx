"use client";

import { DEFAULT_SPEED, useHanoiSelector } from "../hanoi-player-context";
import { useSetSpeed } from "../hanoi.actions";
import { useCallback } from "react";

const BUILTIN_SPEEDS = [
  {
    name: ".5x",
    value: 2 * DEFAULT_SPEED,
  },
  {
    name: "1x",
    value: 1 * DEFAULT_SPEED,
  },
  {
    name: "2x",
    value: 0.5 * DEFAULT_SPEED,
  },
  {
    name: "4x",
    value: 0.25 * DEFAULT_SPEED,
  },
] as const;

export function HanoiSpeedControl() {
  return (
    <fieldset className="speed-setting">
      <legend>Speed</legend>
      <div className="speed-options">
        {BUILTIN_SPEEDS.map(({ name, value }) => (
          <SpeedButton key={name} name={name} value={value} />
        ))}
      </div>
    </fieldset>
  );
}

function SpeedButton({ name, value }: { name: string; value: number }) {
  const setSpeed = useSetSpeed();
  const pressed = useHanoiSelector((state) => state.speed === value);
  const handleClick = useCallback(() => setSpeed(value), [setSpeed, value]);
  return (
    <button
      key={name}
      className={
        pressed ?
          "btn-soft/primary btn-size-sm"
        : "btn-ghost/surface btn-size-sm"
      }
      aria-pressed={pressed}
      onClick={handleClick}
    >
      {name}
    </button>
  );
}
