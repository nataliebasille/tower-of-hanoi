import { createInitialDiscLocations, getNumberOfStepsForSolution, previousStep } from "@/lib/tower-of-hanoi";
import { MIN_DISCS, MAX_DISCS, HanoiPlayerState } from "./hanoi-player-context";

export function canDecrementDiscCount(state: HanoiPlayerState) {
  return state.discs > MIN_DISCS;
}

export function canIncrementDiscCount(state: HanoiPlayerState) {
  return state.discs < MAX_DISCS;
}

export function getDiscCount(state: HanoiPlayerState) {
  return state.discs;
}

export function getSpeed(state: HanoiPlayerState) {
  return state.speed;
}

export function isPlaying(state: HanoiPlayerState) {
  return state.playing;
}

export function getStep(state: HanoiPlayerState) {
  return state.step;
}

export function getPreviousStep(state: HanoiPlayerState) {
  return previousStep(state.step)
}

export function getInitialStep(state: HanoiPlayerState) {
  return createInitialDiscLocations(state.discs);
}

export function isComplete(state: HanoiPlayerState) {
  return state.step.complete;
}

export function getTotalSteps(state: HanoiPlayerState) {
  return getNumberOfStepsForSolution(state.discs);
}
