export type PegId = 0 | 1 | 2;
export type DiscLocations = readonly PegId[];
export type TowerState = {
  readonly numberOfDiscs: number;
  readonly pegs: [number[], number[], number[]]
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export function createInitialDiscLocations(discs: number): DiscLocations {
  return locationsAtStep(discs, 0);
}

export function* solve(numberOfDiscs: number): Generator<DiscLocations> {
  const all: DiscLocations[] = [];
  const discs: Mutable<DiscLocations> = Array.from({ length: numberOfDiscs }, () => 0);
  const currentState: DiscLocations = createInitialDiscLocations(numberOfDiscs);

  // yield initial state
  yield snapshotState(all, currentState);

  const totalSteps = 2 ** numberOfDiscs - 1;
  const evenMovement = numberOfDiscs % 2 === 0
  ? 1 // even -> clockwise when n is even
  : -1 // even -> counterclockwise when n is odd
  const oddMovement = -1 * evenMovement // odd -> opposite direction of even

  for(let i = 1; i <= totalSteps; i++) {
    const discIndex = getDiscToMove(i);
    discs[discIndex] = (discs[discIndex] + (discIndex % 2 === 0 ? evenMovement : oddMovement) + 3) % 3 as PegId;
    yield snapshotState(all, discs);
  }

  return all;
}

export function locationsAtStep(numberOfDiscs: number, step: number) {
  const discLocations: Mutable<DiscLocations> = Array.from({ length: numberOfDiscs }, () => 0);

  let stableIndex: PegId = 0;
  let targetIndex: PegId = 2;

  for (let i = numberOfDiscs - 1; i >= 0; i--) {
    const bit = getBitAtIndex(step, i);
    const nextPegIndex: PegId = (3 - (stableIndex + targetIndex)) % 3 as PegId;
    if (bit === 1) {
      discLocations[i] = targetIndex;
      stableIndex = nextPegIndex;
    } else {
      discLocations[i] = stableIndex;
      targetIndex = nextPegIndex;
    }
  }

  return discLocations as DiscLocations;
}

export function discLocationsToTowerState(discLocations: DiscLocations): TowerState {
  const pegs: [number[], number[], number[]] = [[], [], []];
  for (let i = 0; i < discLocations.length; i++) {
    pegs[discLocations[i]].push(i);
  }

  return {
    numberOfDiscs: discLocations.length,
    pegs,
  };
}

function snapshotState(all: DiscLocations[], state: DiscLocations): DiscLocations {
  const snapshot = [...state] as DiscLocations;
  all.push(snapshot);
  return snapshot;
}

function getMostSignificantBitIndex(n: number) {
  // Math.clz32(n) counts leading zeros.
  // Subtracting that from 32 gives the total bit width needed.
  return 31 - Math.clz32(n);
}

function getDiscToMove(n: number) {
  return getMostSignificantBitIndex((n - 1) ^ n);
}

function getBitAtIndex(n: number, index: number): 0 | 1 {
  return (n & (1 << index)) !== 0 ? 1 : 0;
}
