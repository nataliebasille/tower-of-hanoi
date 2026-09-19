import { deepStrictEqual } from "node:assert";
import { describe, it } from "node:test";
import { act } from "react";
import { useHanoiStepController } from "../../app/_components/hanoi.actions";
import {
  initialState,
  firstStep,
  secondStep,
  finalStep,
  penultimateStep,
  renderPlayer,
} from "./hanoi-test-helpers";

describe("useHanoiStepController", () => {
  it("rewinds the first move to step zero, then preserves it at the lower bound", () => {
    const hook = renderPlayer(useHanoiStepController, {
      ...initialState,
      step: firstStep,
    });
    act(() => {
      deepStrictEqual(hook.current.controls.previous(), initialState);
    });
    deepStrictEqual(hook.current.state, initialState);
    act(() => {
      deepStrictEqual(hook.current.controls.previous(), initialState);
    });
    deepStrictEqual(hook.current.state, initialState);
  });

  it("does not advance during mounting or rerendering", () => {
    const hook = renderPlayer(useHanoiStepController);
    hook.rerender(undefined);
    deepStrictEqual(hook.current.state, initialState);
  });

  it("advances one move and returns the updated player state", () => {
    const hook = renderPlayer(useHanoiStepController);
    const expected = { ...initialState, step: firstStep };
    act(() => {
      deepStrictEqual(hook.current.controls.next(), expected);
    });
    deepStrictEqual(hook.current.state, expected);
  });

  it("uses the latest state for multiple moves in one render batch", () => {
    const hook = renderPlayer(useHanoiStepController);
    const { next } = hook.current.controls;
    act(() => {
      next();
      next();
    });
    deepStrictEqual(hook.current.state, { ...initialState, step: secondStep });
  });

  it("rewinds one move while preserving speed and playback state", () => {
    const state = {
      ...initialState,
      speed: 500,
      playing: true,
      step: secondStep,
    };
    const hook = renderPlayer(useHanoiStepController, state);
    const expected = { ...state, step: firstStep };
    act(() => {
      deepStrictEqual(hook.current.controls.previous(), expected);
    });
    deepStrictEqual(hook.current.state, expected);
  });

  it("stays at the initial state when rewound repeatedly", () => {
    const hook = renderPlayer(useHanoiStepController);
    act(() => {
      hook.current.controls.previous();
      hook.current.controls.previous();
    });
    deepStrictEqual(hook.current.state, initialState);
  });

  it("marks the final move complete and does not advance beyond it", () => {
    const hook = renderPlayer(useHanoiStepController, {
      ...initialState,
      step: penultimateStep,
    });
    act(() => {
      hook.current.controls.next();
    });
    deepStrictEqual(hook.current.state, { ...initialState, step: finalStep });
    act(() => {
      hook.current.controls.next();
    });
    deepStrictEqual(hook.current.state, { ...initialState, step: finalStep });
  });

  it("clears completion when rewinding from the final state", () => {
    const hook = renderPlayer(useHanoiStepController, {
      ...initialState,
      step: finalStep,
    });
    act(() => {
      hook.current.controls.previous();
    });
    deepStrictEqual(hook.current.state, {
      ...initialState,
      step: penultimateStep,
    });
  });

  it("saved controls operate on a replacement puzzle state", () => {
    const hook = renderPlayer(useHanoiStepController);
    const { next } = hook.current.controls;
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
