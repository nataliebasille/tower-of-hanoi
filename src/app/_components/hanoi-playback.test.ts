import { deepStrictEqual } from "node:assert";
import { describe, it } from "node:test";
import { act, createElement, type PropsWithChildren } from "react";
import { HanoiPlayback } from "./hanoi-playback";
import {
  HanoiPlayerProvider,
  useHanoiSelector,
  useHanoiSetState,
  type HanoiPlayerState,
} from "./hanoi-player-context";
import { renderHook } from "../../lib/hooks/test-helpers";
import {
  initialState,
  firstStep,
  secondStep,
  finalStep,
  penultimateStep,
} from "../../lib/hooks/hanoi-test-helpers";

const thirdStep: HanoiPlayerState["step"] = {
  step: 3,
  movedDisc: 0,
  locations: [1, 1, 0],
  complete: false,
};

describe("HanoiPlayback", () => {
  it("pauses without losing the final state when advancing at the upper bound", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const player = renderPlayback({
      ...initialState,
      playing: true,
      step: finalStep,
    });
    act(() => context.mock.timers.tick(1000));
    deepStrictEqual(player.current.state, { ...initialState, step: finalStep });
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(player.current.state, { ...initialState, step: finalStep });
  });

  it("does not advance while paused", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const player = renderPlayback();
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(player.current.state, initialState);
  });

  it("advances immediately on play, then once per interval", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const state = { ...initialState, playing: true, step: firstStep };
    const player = renderPlayback({ ...initialState, playing: true });
    deepStrictEqual(player.current.state, state);
    act(() => context.mock.timers.tick(999));
    deepStrictEqual(player.current.state, state);
    act(() => context.mock.timers.tick(1));
    deepStrictEqual(player.current.state, { ...state, step: secondStep });
    act(() => context.mock.timers.tick(1000));
    deepStrictEqual(player.current.state, { ...state, step: thirdStep });
  });

  it("cancels the pending tick on pause and resumes from the current step", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const player = renderPlayback({
      ...initialState,
      playing: true,
    });
    act(() => context.mock.timers.tick(600));
    act(() => player.current.update({ playing: false }));
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(player.current.state, { ...initialState, step: firstStep });
    act(() => player.current.update({ playing: true }));
    act(() => context.mock.timers.tick(999));
    deepStrictEqual(player.current.state, {
      ...initialState,
      playing: true,
      step: secondStep,
    });
    act(() => context.mock.timers.tick(1));
    deepStrictEqual(player.current.state, {
      ...initialState,
      playing: true,
      step: thirdStep,
    });
  });

  it("replaces the old interval when speed changes", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const player = renderPlayback({
      ...initialState,
      playing: true,
    });
    act(() => context.mock.timers.tick(600));
    act(() => player.current.update({ speed: 500 }));
    act(() => context.mock.timers.tick(400));
    deepStrictEqual(player.current.state, {
      ...initialState,
      playing: true,
      speed: 500,
      step: secondStep,
    });
    act(() => context.mock.timers.tick(100));
    deepStrictEqual(player.current.state, {
      ...initialState,
      playing: true,
      speed: 500,
      step: thirdStep,
    });
  });

  it("does not restart the interval on an unrelated rerender", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const state = { ...initialState, playing: true };
    const player = renderPlayback({ ...initialState, playing: true });
    act(() => context.mock.timers.tick(600));
    player.rerender(undefined);
    act(() => context.mock.timers.tick(400));
    deepStrictEqual(player.current.state, { ...state, step: secondStep });
  });

  it("clears the playback interval on unmount", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const clearIntervalMock = context.mock.method(globalThis, "clearInterval");
    const player = renderPlayback({
      ...initialState,
      playing: true,
    });
    player.unmount();
    deepStrictEqual(clearIntervalMock.mock.callCount(), 1);
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(player.current.state, {
      ...initialState,
      playing: true,
      step: firstStep,
    });
  });

  it("pauses automatically when the final move completes", (context) => {
    context.mock.timers.enable({ apis: ["setInterval"] });
    const player = renderPlayback({
      ...initialState,
      playing: true,
      step: penultimateStep,
    });
    act(() => context.mock.timers.tick(1000));
    deepStrictEqual(player.current.state, {
      ...initialState,
      playing: false,
      step: finalStep,
    });
    act(() => context.mock.timers.tick(5000));
    deepStrictEqual(player.current.state, {
      ...initialState,
      playing: false,
      step: finalStep,
    });
  });
});

function renderPlayback(state = initialState) {
  function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      HanoiPlayerProvider,
      { initialState: structuredClone(state) },
      createElement(HanoiPlayback),
      children,
    );
  }
  return renderHook(
    () => ({
      state: useHanoiSelector((current) => current),
      update: useHanoiSetState((patch: Partial<HanoiPlayerState>) => (get) => ({
        ...get(),
        ...patch,
      })),
    }),
    undefined,
    Wrapper,
  );
}
