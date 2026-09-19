"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialDiscLocations = createInitialDiscLocations;
exports.getNumberOfStepsForSolution = getNumberOfStepsForSolution;
exports.solve = solve;
exports.nextStep = nextStep;
exports.locationsAtStep = locationsAtStep;
exports.discLocationsToTowerState = discLocationsToTowerState;
function createInitialDiscLocations(discs) {
    return locationsAtStep(discs, 0);
}
function getNumberOfStepsForSolution(numberOfDiscs) {
    return 2 ** numberOfDiscs - 1;
}
function* solve(numberOfDiscs) {
    const all = [];
    const discs = Array.from({ length: numberOfDiscs }, () => 0);
    const currentState = createInitialDiscLocations(numberOfDiscs);
    yield recordStep(all, currentState);
    const totalSteps = getNumberOfStepsForSolution(numberOfDiscs);
    const evenMovement = numberOfDiscs % 2 === 0
        ? 1 // even -> clockwise when n is even
        : -1; // even -> counterclockwise when n is odd
    const oddMovement = -1 * evenMovement; // odd -> opposite direction of even
    for (let i = 1; i <= totalSteps; i++) {
        const discIndex = getDiscToMove(i);
        discs[discIndex] = (discs[discIndex] + (discIndex % 2 === 0 ? evenMovement : oddMovement) + 3) % 3;
        yield recordStep(all, {
            step: i,
            movedDisc: discIndex,
            locations: discs
        });
    }
    return all;
}
function recordStep(all, step) {
    all.push(step.locations);
    return step;
}
function nextStep(step) {
    const numberOfDiscs = step.locations.length;
    const totalSteps = getNumberOfStepsForSolution(numberOfDiscs);
    if (step.step >= totalSteps) {
        return step;
    }
    const nextStep = structuredClone(step);
    nextStep.step++;
    const evenMovement = numberOfDiscs % 2 === 0
        ? 1 // even -> clockwise when n is even
        : -1; // even -> counterclockwise when n is odd
    const oddMovement = -1 * evenMovement; // odd -> opposite direction of even
    const discIndex = getDiscToMove(nextStep.step);
    nextStep.locations[discIndex] = (nextStep.locations[discIndex] + (discIndex % 2 === 0 ? evenMovement : oddMovement) + 3) % 3;
    return nextStep;
}
function locationsAtStep(numberOfDiscs, step) {
    const discLocations = Array.from({ length: numberOfDiscs }, () => 0);
    let stableIndex = 0;
    let targetIndex = 2;
    for (let i = numberOfDiscs - 1; i >= 0; i--) {
        const bit = getBitAtIndex(step, i);
        const nextPegIndex = (3 - (stableIndex + targetIndex)) % 3;
        if (bit === 1) {
            discLocations[i] = targetIndex;
            stableIndex = nextPegIndex;
        }
        else {
            discLocations[i] = stableIndex;
            targetIndex = nextPegIndex;
        }
    }
    return {
        step: step,
        movedDisc: getDiscToMove(step),
        locations: discLocations
    };
}
function discLocationsToTowerState(discLocations) {
    const pegs = [[], [], []];
    for (let i = 0; i < discLocations.length; i++) {
        pegs[discLocations[i]].push(i);
    }
    return {
        numberOfDiscs: discLocations.length,
        pegs,
    };
}
function getMostSignificantBitIndex(n) {
    // Math.clz32(n) counts leading zeros.
    // Subtracting that from 32 gives the total bit width needed.
    return 31 - Math.clz32(n);
}
function getDiscToMove(n) {
    return n === 0 ? null : getMostSignificantBitIndex((n - 1) ^ n);
}
function getBitAtIndex(n, index) {
    return (n & (1 << index)) !== 0 ? 1 : 0;
}
//# sourceMappingURL=tower-of-hanoi.js.map