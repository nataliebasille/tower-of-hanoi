import { deepStrictEqual } from "node:assert";
import { describe, it } from "node:test";
import { act } from "react";
import { useNextStep, usePreviousStep } from "./hanoi.actions";
import {
  initialState,
  firstStep,
  secondStep,
  finalStep,
  penultimateStep,
  renderPlayer,
} from "../../lib/hooks/hanoi-test-helpers";

describe("useNextStep", () => {
  it("does not advance during mounting or rerendering", () => {
    const hook = renderPlayer(useNextStep);
    hook.rerender(undefined);
    deepStrictEqual(hook.current.state, initialState);
  });

  it("advances one move and returns the updated player state", () => {
    const hook = renderPlayer(useNextStep);
    const expected = { ...initialState, step: firstStep };
    act(() => {
      deepStrictEqual(hook.current.controls(), expected);
    });
    deepStrictEqual(hook.current.state, expected);
  });

  it("uses the latest state for multiple moves in one render batch", () => {
    const hook = renderPlayer(useNextStep);
    const next = hook.current.controls;
    act(() => {
      next();
      next();
    });
    deepStrictEqual(hook.current.state, { ...initialState, step: secondStep });
  });

  it("marks the final move complete and does not advance beyond it", () => {
    const hook = renderPlayer(useNextStep, {
      ...initialState,
      step: penultimateStep,
    });
    act(() => {
      hook.current.controls();
    });
    deepStrictEqual(hook.current.state, { ...initialState, step: finalStep });
    act(() => {
      hook.current.controls();
    });
    deepStrictEqual(hook.current.state, { ...initialState, step: finalStep });
  });

  it("saved controls operate on a replacement puzzle state", () => {
    const hook = renderPlayer(useNextStep);
    const next = hook.current.controls;
    act(() => {
      hook.current.update({
        discs: 1,
        step: { step: 0, movedDisc: null, locations: [0], complete: false },
      });
    });
    act(() => {
      next();
    });
    deepStrictEqual(hook.current.state, {
      ...initialState,
      discs: 1,
      step: { step: 1, movedDisc: 0, locations: [2], complete: true },
    });
  });
});

describe("usePreviousStep", () => {
  it("does not rewind during mounting or rerendering", () => {
    const state = { ...initialState, step: secondStep };
    const hook = renderPlayer(usePreviousStep, state);
    hook.rerender(undefined);
    deepStrictEqual(hook.current.state, state);
  });

  it("rewinds the first move to step zero, then preserves it at the lower bound", () => {
    const hook = renderPlayer(usePreviousStep, {
      ...initialState,
      step: firstStep,
    });
    act(() => {
      deepStrictEqual(hook.current.controls(), initialState);
    });
    deepStrictEqual(hook.current.state, initialState);
    act(() => {
      deepStrictEqual(hook.current.controls(), initialState);
    });
    deepStrictEqual(hook.current.state, initialState);
  });

  it("rewinds one move while preserving speed and playback state", () => {
    const state = {
      ...initialState,
      speed: 500,
      playing: true,
      step: secondStep,
    };
    const hook = renderPlayer(usePreviousStep, state);
    const expected = { ...state, step: firstStep };
    act(() => {
      deepStrictEqual(hook.current.controls(), expected);
    });
    deepStrictEqual(hook.current.state, expected);
  });

  it("stays at the initial state when rewound repeatedly", () => {
    const hook = renderPlayer(usePreviousStep);
    act(() => {
      hook.current.controls();
      hook.current.controls();
    });
    deepStrictEqual(hook.current.state, initialState);
  });

  it("clears completion when rewinding from the final state", () => {
    const hook = renderPlayer(usePreviousStep, {
      ...initialState,
      step: finalStep,
    });
    act(() => {
      hook.current.controls();
    });
    deepStrictEqual(hook.current.state, {
      ...initialState,
      step: penultimateStep,
    });
  });
});
