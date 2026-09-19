import { createElement, type PropsWithChildren } from "react";
import {
  HanoiPlayerProvider,
  useHanoiSelector,
  useHanoiSetState,
  type HanoiPlayerState,
} from "../../app/_components/hanoi-player-context";
import { renderHook } from "./test-helpers";

export const initialState: HanoiPlayerState = {
  discs: 3,
  speed: 1000,
  playing: false,
  step: { step: 0, movedDisc: null, locations: [0, 0, 0], complete: false },
};
export const firstStep: HanoiPlayerState["step"] = {
  step: 1,
  movedDisc: 0,
  locations: [2, 0, 0],
  complete: false,
};
export const secondStep: HanoiPlayerState["step"] = {
  step: 2,
  movedDisc: 1,
  locations: [2, 1, 0],
  complete: false,
};
export const finalStep: HanoiPlayerState["step"] = {
  step: 7,
  movedDisc: 0,
  locations: [2, 2, 2],
  complete: true,
};
export const penultimateStep: HanoiPlayerState["step"] = {
  step: 6,
  movedDisc: 1,
  locations: [0, 2, 2],
  complete: false,
};

export function renderPlayer<T>(useHook: () => T, state = initialState) {
  function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      HanoiPlayerProvider,
      { initialState: structuredClone(state) },
      children,
    );
  }

  return renderHook(
    () => ({
      controls: useHook(),
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
