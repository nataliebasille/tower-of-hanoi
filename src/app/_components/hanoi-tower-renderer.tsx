"use client";

import { CSSProperties } from "react";
import { useHanoiSelector } from "./hanoi-player-context";
import {
  getInitialStep,
  getPreviousStep,
  getSpeed,
  getStep,
  getTotalSteps,
} from "./hanoi.selectors";

const colors = [
  "#e7a55c",
  "#dd8065",
  "#ba7490",
  "#9181b5",
  "#729ca8",
  "#80aa8d",
  "#b2ad72",
  "#c99370",
];

export function HanoiTowerRenderer() {
  const currentStep = useHanoiSelector(getStep);
  const total = useHanoiSelector(getTotalSteps);
  const previousStep = useHanoiSelector(getPreviousStep);
  const initialStep = useHanoiSelector(getInitialStep);
  const speed = useHanoiSelector(getSpeed);

  return (
    <svg
      className="tower"
      viewBox="0 0 800 380"
      role="img"
      aria-label={`Move ${currentStep} of ${total}. Disc locations, smallest first: ${currentStep.locations.map((p) => "ABC"[p]).join(", ")}`}
    >
      <defs>
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r=".7" fill="currentColor" opacity=".13" />
        </pattern>
      </defs>
      <rect width="800" height="330" fill="url(#dots)" />
      {[0, 1, 2].map((p) => (
        <g key={p}>
          <rect
            x={146 + p * 250}
            y="74"
            width="8"
            height="230"
            rx="4"
            fill="#c8c5bb"
          />
          <rect
            x={45 + p * 250}
            y="305"
            width="210"
            height="8"
            rx="4"
            fill="#b3b4a7"
          />
          <text
            x={150 + p * 250}
            y="349"
            textAnchor="middle"
            className="peg-label"
          >
            {"ABC"[p]}
          </text>
          <text
            x={150 + p * 250}
            y="373"
            textAnchor="middle"
            className="peg-caption"
          >
            {["SOURCE", "AUXILIARY", "DESTINATION"][p]}
          </text>
        </g>
      ))}
      {currentStep.locations.map((_, i) => {
        const p = position(i, currentStep.locations);
        const old = position(i, (previousStep ?? initialStep).locations);
        const width = 48 + (i + 1) * 17;
        return (
          <g
            key={`${i}-${i === currentStep.movedDisc ? currentStep : "rest"}`}
            className={i === currentStep.movedDisc ? "disc moving" : "disc"}
            style={
              {
                transform: `translate(${p.x}px, ${p.y}px)`,
                "--from-x": `${old.x}px`,
                "--from-y": `${old.y}px`,
                "--to-x": `${p.x}px`,
                "--to-y": `${p.y}px`,
                animationDuration: `${speed * 0.85}ms`,
              } as CSSProperties
            }
          >
            <rect
              x={-width / 2}
              width={width}
              height="23"
              rx="6"
              fill={colors[i]}
            />
            <rect
              x={-width / 2 + 5}
              y="2"
              width={width - 10}
              height="2"
              rx="1"
              fill="white"
              opacity=".2"
            />
            <text y="16" textAnchor="middle" fill="white" fontSize="11">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function position(i: number, state: readonly number[]) {
  return {
    x: 150 + state[i] * 250,
    y: 280 - state.slice(i + 1).filter((p) => p === state[i]).length * 25,
  };
}
