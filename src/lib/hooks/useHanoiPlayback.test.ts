import { deepStrictEqual } from "node:assert";
import { describe, it } from "node:test";
import { act } from "react";
import { useHanoiPlayback } from "../../app/_components/hanoi.actions";
import {
  initialState,
  firstStep,
  secondStep,
  finalStep,
  penultimateStep,
  renderPlayer,
} from "./hanoi-test-helpers";

describe("useHanoiPlayback", () => {
  it("pauses without losing the final state when advancing at the upper bound", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const hook = renderPlayer(useHanoiPlayback, {
      ...initialState,
      playing: true,
      step: finalStep,
    });
    act(() => context.mock.timers.tick(1000));
    deepStrictEqual(hook.current.state, { ...initialState, step: finalStep });
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(hook.current.state, { ...initialState, step: finalStep });
  });

  it("does not advance while paused", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const hook = renderPlayer(useHanoiPlayback);
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(hook.current.state, initialState);
  });

  it("waits a full interval and advances once per interval", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const state = { ...initialState, playing: true };
    const hook = renderPlayer(useHanoiPlayback, state);
    act(() => context.mock.timers.tick(999));
    deepStrictEqual(hook.current.state, state);
    act(() => context.mock.timers.tick(1));
    deepStrictEqual(hook.current.state, { ...state, step: firstStep });
    act(() => context.mock.timers.tick(1000));
    deepStrictEqual(hook.current.state, { ...state, step: secondStep });
  });

  it("cancels the pending tick on pause and resumes from the current step", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const hook = renderPlayer(useHanoiPlayback, {
      ...initialState,
      playing: true,
    });
    act(() => context.mock.timers.tick(1000));
    act(() => hook.current.update({ playing: false }));
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(hook.current.state, { ...initialState, step: firstStep });
    act(() => hook.current.update({ playing: true }));
    act(() => context.mock.timers.tick(999));
    deepStrictEqual(hook.current.state, {
      ...initialState,
      playing: true,
      step: firstStep,
    });
    act(() => context.mock.timers.tick(1));
    deepStrictEqual(hook.current.state, {
      ...initialState,
      playing: true,
      step: secondStep,
    });
  });

  it("replaces the old interval when speed changes", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const hook = renderPlayer(useHanoiPlayback, {
      ...initialState,
      playing: true,
    });
    act(() => context.mock.timers.tick(600));
    act(() => hook.current.update({ speed: 500 }));
    act(() => context.mock.timers.tick(400));
    deepStrictEqual(hook.current.state, {
      ...initialState,
      playing: true,
      speed: 500,
    });
    act(() => context.mock.timers.tick(100));
    deepStrictEqual(hook.current.state, {
      ...initialState,
      playing: true,
      speed: 500,
      step: firstStep,
    });
    act(() => context.mock.timers.tick(500));
    deepStrictEqual(hook.current.state, {
      ...initialState,
      playing: true,
      speed: 500,
      step: secondStep,
    });
  });

  it("does not restart the interval on an unrelated rerender", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const state = { ...initialState, playing: true };
    const hook = renderPlayer(useHanoiPlayback, state);
    act(() => context.mock.timers.tick(600));
    hook.rerender(undefined);
    act(() => context.mock.timers.tick(400));
    deepStrictEqual(hook.current.state, { ...state, step: firstStep });
  });

  it("clears the playback interval on unmount", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const clearIntervalMock = context.mock.method(globalThis, "clearInterval");
    const hook = renderPlayer(useHanoiPlayback, {
      ...initialState,
      playing: true,
    });
    hook.unmount();
    deepStrictEqual(clearIntervalMock.mock.callCount(), 1);
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(hook.current.state, { ...initialState, playing: true });
  });

  it("pauses automatically when the final move completes", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const hook = renderPlayer(useHanoiPlayback, {
      ...initialState,
      playing: true,
      step: penultimateStep,
    });
    act(() => context.mock.timers.tick(1000));
    deepStrictEqual(hook.current.state, {
      ...initialState,
      playing: false,
      step: finalStep,
    });
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(hook.current.state, {
      ...initialState,
      playing: false,
      step: finalStep,
    });
  });
});
