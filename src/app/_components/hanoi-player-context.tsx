"use client";

import { createStoreContext } from "@/lib/store/store-context";
import { createInitialDiscLocations, SolutionStep } from "@/lib/tower-of-hanoi";

export type HanoiPlayerState = {
  discs: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  speed: number;
  playing: boolean;
  step: SolutionStep;
};

export const MIN_DISCS = 1;
export const MAX_DISCS = 8;
export const DEFAULT_DISCS = 3;
export const MIN_SPEED = 100;
export const MAX_SPEED = 5000;
export const DEFAULT_SPEED = 1000;

const {
  Provider: HanoiPlayerProvider,
  useSelector: useHanoiSelector,
  useSetState: useHanoiSetState,
} = createStoreContext((): HanoiPlayerState => ({
  discs: DEFAULT_DISCS,
  speed: DEFAULT_SPEED,
  step: createInitialDiscLocations(DEFAULT_DISCS),
  playing: false,
}));

export { HanoiPlayerProvider, useHanoiSelector, useHanoiSetState };
