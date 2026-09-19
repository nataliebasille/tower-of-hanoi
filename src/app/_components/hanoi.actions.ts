'use client';

import {
  createInitialDiscLocations,
  nextStep,
  previousStep,
} from "@/lib/tower-of-hanoi";
import { useCallback, useEffect } from "react";
import {
  HanoiPlayerState,
  MAX_DISCS,
  MAX_SPEED,
  MIN_DISCS,
  MIN_SPEED,
  useHanoiSelector,
  useHanoiSetState,
} from "./hanoi-player-context";
import { getSpeed } from "./hanoi.selectors";

export function useSetDiscs() {
  return useHanoiSetState(
    (discsOrFn: number | ((current: number) => number)) => (get) => {
      const discs =
        typeof discsOrFn === "function" ? discsOrFn(get().discs) : discsOrFn;
      return reset({
        ...get(),
        discs: discs as HanoiPlayerState["discs"],
      });
    },
  );
}

export function useDecrementDiscs() {
  const setDisc = useSetDiscs();
  return useCallback(() => {
    setDisc((current) => current - 1);
  }, [setDisc]);
}

export function useIncrementDiscs() {
  const setDisc = useSetDiscs();
  return useCallback(() => {
    setDisc((current) => current + 1);
  }, [setDisc]);
}

export function useSetSpeed() {
  return useHanoiSetState((speed: HanoiPlayerState["speed"]) => (get) => {
    if (speed >= MIN_SPEED && speed <= MAX_SPEED) {
      return { ...get(), speed };
    }

    console.warn(
      `Speed must be between ${MIN_SPEED} and ${MAX_SPEED}; attempted to set speed to: ${speed}`,
    );

    return get();
  });
}

export function usePlay() {
  return useHanoiSetState(() => (get) => ({ ...get(), playing: true }));
}

export function usePause() {
  return useHanoiSetState(() => (get) => ({ ...get(), playing: false }));
}

export function useReset() {
  return useHanoiSetState(() => (get) => {
    return reset({ ...get() });
  });
}

export function useNextStep() {
return useHanoiSetState(() => (get) => {
    const current = get();
    const step = nextStep(current.step);
    return step === null ? current : { ...current, step };
  })
}

export function usePreviousStep() {
  return useHanoiSetState(() => (get) => {
    const current = get();
    const step = previousStep(current.step);
    return step === null ? current : { ...current, step };
  })
}

function reset(state: HanoiPlayerState) {
  const discs =
    state.discs < MIN_DISCS ? MIN_DISCS
    : state.discs > MAX_DISCS ? MAX_DISCS
    : state.discs;
  return {
    ...state,
    discs,
    speed:
      state.speed < MIN_SPEED ? MIN_SPEED
      : state.speed > MAX_SPEED ? MAX_SPEED
      : state.speed,
    playing: false,
    step: createInitialDiscLocations(discs),
  };
}
