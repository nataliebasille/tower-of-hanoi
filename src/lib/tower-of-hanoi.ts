export type PegId = 0 | 1 | 2;
export type DiscLocations = readonly PegId[];
export type InitialStep = {
  readonly step: 0;
  readonly movedDisc: null;
  readonly locations: DiscLocations;
  readonly complete: false;
};
export type SolutionStep =
  | InitialStep
  | {
      readonly step: number;
      readonly movedDisc: number;
      readonly locations: DiscLocations;
      readonly complete: boolean;
    };

export type TowerState = {
  readonly numberOfDiscs: number;
  readonly pegs: [number[], number[], number[]];
};

type Mutable<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>;
};

export function createInitialDiscLocations(discs: number) {
  return locationsAtStep(discs, 0);
}

export function getNumberOfStepsForSolution(numberOfDiscs: number) {
  return 2 ** numberOfDiscs - 1;
}

export function* solve(numberOfDiscs: number): Generator<SolutionStep> {
  const all: SolutionStep[] = [];
  let currentState: SolutionStep | null =
    createInitialDiscLocations(numberOfDiscs);

  while (currentState !== null) {
    yield recordStep(all, currentState);
    currentState = nextStep(currentState);
  }

  return all;
}

function recordStep(all: SolutionStep[], step: SolutionStep) {
  all.push(step);
  return step;
}

export function nextStep(step: SolutionStep): SolutionStep | null {
  const numberOfDiscs = step.locations.length;
  const totalSteps = getNumberOfStepsForSolution(numberOfDiscs);

  if (step.step >= totalSteps) {
    return null;
  }

  const nextStep = structuredClone(step) as Mutable<SolutionStep>;
  nextStep.step++;

  const evenMovement =
    numberOfDiscs % 2 === 0 ?
      1 // even -> clockwise when n is even
    : -1; // even -> counterclockwise when n is odd
  const oddMovement = -1 * evenMovement; // odd -> opposite direction of even

  const discIndex = getDiscToMove(nextStep.step);
  nextStep.locations[discIndex] = ((nextStep.locations[discIndex] +
    (discIndex % 2 === 0 ? evenMovement : oddMovement) +
    3) %
    3) as PegId;
  nextStep.movedDisc = discIndex;
  nextStep.complete = nextStep.step >= totalSteps;
  return nextStep;
}

export function previousStep(step: SolutionStep): SolutionStep | null {
  const numberOfDiscs = step.locations.length;

  if (step.step <= 0) {
    return null;
  }

  if (step.step === 1) {
    return createInitialDiscLocations(numberOfDiscs);
  }

  const previousStep = structuredClone(step) as Mutable<SolutionStep>;
  previousStep.step--;

  const evenMovement =
    numberOfDiscs % 2 === 0 ?
      1 // even -> clockwise when n is even
    : -1; // even -> counterclockwise when n is odd
  const oddMovement = -1 * evenMovement; // odd -> opposite direction of even

  // undoing disc movement from the current step
  const discIndex = getDiscToMove(step.step);
  previousStep.locations[discIndex] = ((previousStep.locations[discIndex] -
    (discIndex % 2 === 0 ? evenMovement : oddMovement) +
    3) %
    3) as PegId;

  // set the movedDisc to the disc that was moved in the previous step
  previousStep.movedDisc = getDiscToMove(previousStep.step);
  previousStep.complete = false;
  return previousStep;
}

export function locationsAtStep(numberOfDiscs: number, step: 0): InitialStep;
export function locationsAtStep(
  numberOfDiscs: number,
  step: number,
): SolutionStep;
export function locationsAtStep(numberOfDiscs: number, step: number) {
  const discLocations: Mutable<DiscLocations> = Array.from(
    { length: numberOfDiscs },
    () => 0,
  );

  let stableIndex: PegId = 0;
  let targetIndex: PegId = 2;

  for (let i = numberOfDiscs - 1; i >= 0; i--) {
    const bit = getBitAtIndex(step, i);
    const nextPegIndex: PegId = ((3 - (stableIndex + targetIndex)) %
      3) as PegId;
    if (bit === 1) {
      discLocations[i] = targetIndex;
      stableIndex = nextPegIndex;
    } else {
      discLocations[i] = stableIndex;
      targetIndex = nextPegIndex;
    }
  }

  const totalSteps = getNumberOfStepsForSolution(numberOfDiscs);

  return {
    step: step,
    movedDisc: getDiscToMove(step),
    locations: discLocations,
    complete: step >= totalSteps,
  } as SolutionStep;
}

export function discLocationsToTowerState(
  discLocations: DiscLocations,
): TowerState {
  const pegs: [number[], number[], number[]] = [[], [], []];
  for (let i = 0; i < discLocations.length; i++) {
    pegs[discLocations[i]].push(i);
  }

  return {
    numberOfDiscs: discLocations.length,
    pegs,
  };
}

function getMostSignificantBitIndex(n: number) {
  // Math.clz32(n) counts leading zeros.
  // Subtracting that from 32 gives the total bit width needed.
  return 31 - Math.clz32(n);
}

function getDiscToMove(n: 0): null;
function getDiscToMove(n: number): number;
function getDiscToMove(n: number): number | null {
  return n === 0 ? null : getMostSignificantBitIndex((n - 1) ^ n);
}

function getBitAtIndex(n: number, index: number): 0 | 1 {
  return (n & (1 << index)) !== 0 ? 1 : 0;
}
