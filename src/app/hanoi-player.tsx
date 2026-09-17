"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { locationsAtStep } from "@/lib/tower-of-hanoi";

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

export default function HanoiPlayer() {
  const [discs, setDiscs] = useState(5);
  const [speed, setSpeed] = useState(1);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = 2 ** discs - 1;
  const complete = step === total;
  const duration = 1100 / speed;
  const locations = locationsAtStep(discs, step);
  const previous = locationsAtStep(discs, Math.max(0, step - 1));
  const moved = locations.findIndex((peg, i) => peg !== previous[i]);
  useEffect(() => {
    if (!playing || step >= total) return;
    const timer = setTimeout(() => {
      setStep(step + 1);
      if (step + 1 === total) setPlaying(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [playing, step, total, duration]);
  function reset() {
    setPlaying(false);
    setStep(0);
  }
  function position(i: number, state: readonly number[]) {
    return {
      x: 150 + state[i] * 250,
      y: 280 - state.slice(i + 1).filter((p) => p === state[i]).length * 25,
    };
  }
  return (
    <main className="hanoi">
      <section className="intro">
        <h1>
          Tower of Hanoi<span>.</span>
        </h1>
        <p>
          Choose the number of discs and playback speed, then press play to
          watch the solution.
        </p>
      </section>
      <div className="layout">
        <aside
          className="player-controls card-soft/surface"
          aria-label="Puzzle controls"
        >
          <div className="player-settings">
            <div className="disc-setting">
              <label htmlFor="disc-count">Discs</label>
              <div className="disc-stepper">
                <button
                  className="btn-icon btn-ghost/surface btn-size-sm"
                  aria-label="Fewer discs"
                  disabled={discs === 1}
                  onClick={() => {
                    setDiscs(discs - 1);
                    reset();
                  }}
                >
                  −
                </button>
                <output id="disc-count" aria-live="polite">
                  {discs}
                </output>
                <button
                  className="btn-icon btn-ghost/surface btn-size-sm"
                  aria-label="More discs"
                  disabled={discs === 8}
                  onClick={() => {
                    setDiscs(discs + 1);
                    reset();
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <fieldset className="speed-setting">
              <legend>Speed</legend>
              <div className="speed-options">
                {[0.5, 1, 2, 4].map((value) => (
                  <button
                    key={value}
                    className={
                      speed === value ?
                        "btn-soft/primary btn-size-sm"
                      : "btn-ghost/surface btn-size-sm"
                    }
                    aria-pressed={speed === value}
                    onClick={() => setSpeed(value)}
                  >
                    {value}×
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="player-actions">
            <button
              className="player-play btn-solid/primary btn-size-md"
              onClick={() => {
                if (complete) setStep(0);
                setPlaying(!playing);
              }}
            >
              {playing ?
                "Ⅱ Pause"
              : complete ?
                "↻ Replay"
              : step ?
                "▶ Resume"
              : "▶ Play"}
            </button>
            <button
              className="btn-outline/surface btn-size-md"
              disabled={!step && !playing}
              onClick={reset}
            >
              ↺ Reset
            </button>
            <button
              className="btn-outline/secondary btn-size-md"
              disabled={playing || complete}
              onClick={() => setStep(step + 1)}
            >
              Step →
            </button>
          </div>
        </aside>
        <section className="visual-panel card-outline/surface">
          <div className="visual-heading">
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
          </div>
          <svg
            className="tower"
            viewBox="0 0 800 380"
            role="img"
            aria-label={`Move ${step} of ${total}. Disc locations, smallest first: ${locations.map((p) => "ABC"[p]).join(", ")}`}
          >
            <defs>
              <pattern
                id="dots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="2"
                  cy="2"
                  r=".7"
                  fill="currentColor"
                  opacity=".13"
                />
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
            {locations.map((_, i) => {
              const p = position(i, locations);
              const old = position(i, previous);
              const width = 48 + (i + 1) * 17;
              return (
                <g
                  key={`${i}-${i === moved ? step : "rest"}`}
                  className={i === moved ? "disc moving" : "disc"}
                  style={
                    {
                      transform: `translate(${p.x}px, ${p.y}px)`,
                      "--from-x": `${old.x}px`,
                      "--from-y": `${old.y}px`,
                      "--to-x": `${p.x}px`,
                      "--to-y": `${p.y}px`,
                      animationDuration: `${duration * 0.85}ms`,
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
          <div className="playback-info">
            <div>
              <span className="muted">
                {complete ?
                  null
                : moved < 0 ?
                  null
                : `Disc ${moved + 1}: Peg ${"ABC"[previous[moved]]} → Peg ${"ABC"[locations[moved]]}`
                }
              </span>
              <strong>
                {step} <span>/ {total} moves</span>
              </strong>
            </div>
            <progress value={step} max={total} aria-label="Solution progress" />
          </div>
        </section>
      </div>
    </main>
  );
}
