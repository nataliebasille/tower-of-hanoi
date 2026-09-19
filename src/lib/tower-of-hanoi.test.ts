import { deepStrictEqual, ok } from "node:assert";
import { describe, it } from "node:test";
import {
  discLocationsToTowerState,
  locationsAtStep,
  solve,
  nextStep,
  previousStep,
  type SolutionStep,
  type TowerState,
} from "./tower-of-hanoi";

// Solve from A to C using B as the spare peg. Each character identifies the
// peg holding a disc, ordered from smallest to largest (array index 0 upward).
// Each solution includes step 0 and all 2 ** discs - 1 moves.
const oneDiscSolutions = [{ discs: 1, states: ["A", "C"] }];
const twoDiscSolutions = [{ discs: 2, states: ["AA", "BA", "BC", "CC"] }];
const threeDiscSolutions = [
  {
    discs: 3,
    states: ["AAA", "CAA", "CBA", "BBA", "BBC", "ABC", "ACC", "CCC"],
  },
];
const fourDiscSolutions = [
  {
    discs: 4,
    states: [
      "AAAA",
      "BAAA",
      "BCAA",
      "CCAA",
      "CCBA",
      "ACBA",
      "ABBA",
      "BBBA",
      "BBBC",
      "CBBC",
      "CABC",
      "AABC",
      "AACC",
      "BACC",
      "BCCC",
      "CCCC",
    ],
  },
];

const solutions = [
  ...oneDiscSolutions,
  ...twoDiscSolutions,
  ...threeDiscSolutions,
  ...fourDiscSolutions,
];

describe("solve", () => {
  it("starts at step zero with no moved disc and is incomplete", () => {
    deepStrictEqual(solve(3).next(), {
      done: false,
      value: {
        step: 0,
        movedDisc: null,
        locations: [0, 0, 0],
        complete: false,
      },
    });
  });

  for (const { discs, states } of solutions) {
    const expectedSteps = states.map((positions, step) => ({
      step,
      movedDisc:
        step === 0 ? null : (
          [...positions].findIndex(
            (peg, disc) => peg !== states[step - 1][disc],
          )
        ),
      locations: [...positions].map((peg) => "ABC".indexOf(peg)),
      complete: step === states.length - 1,
    }));

    it(`yields the optimal ${discs}-disc solution with only the final step complete`, () => {
      const iterator = solve(discs);

      for (const expected of expectedSteps) {
        deepStrictEqual(iterator.next(), { done: false, value: expected });
      }

      deepStrictEqual(iterator.next(), { done: true, value: expectedSteps });
      deepStrictEqual(iterator.next(), { done: true, value: undefined });
    });

    it(`preserves earlier states after completing the ${discs}-disc solution`, () => {
      deepStrictEqual([...solve(discs)], expectedSteps);
    });
  }
});

describe("nextStep", () => {
  for (const { discs, states } of solutions) {
    it(`advances through the ${discs}-disc solution and completes only on the final move`, () => {
      let current: SolutionStep = {
        step: 0,
        movedDisc: null,
        locations: Array.from({ length: discs }, () => 0),
        complete: false,
      };

      for (let step = 1; step < states.length; step++) {
        const positions = states[step];
        const previous: SolutionStep = structuredClone(current);
        const actual: SolutionStep | null = nextStep(current);

        deepStrictEqual(actual, {
          step,
          movedDisc: [...positions].findIndex(
            (peg, disc) => peg !== states[step - 1][disc],
          ),
          locations: [...positions].map((peg) => "ABC".indexOf(peg)),
          complete: step === states.length - 1,
        });
        deepStrictEqual(current, previous);
        ok(actual !== null);
        current = actual;
      }
    });

    it(`returns null beyond the completed ${discs}-disc solution without changing it`, () => {
      const completed: SolutionStep = {
        step: states.length - 1,
        movedDisc: 0,
        locations: Array.from({ length: discs }, () => 2),
        complete: true,
      };
      const expected = structuredClone(completed);

      deepStrictEqual(nextStep(completed), null);
      deepStrictEqual(nextStep(completed), null);
      deepStrictEqual(completed, expected);
    });
  }
});

describe("previousStep", () => {
  for (const { discs, states } of solutions) {
    for (let step = 1; step < states.length; step++) {
      it(`rewinds ${discs} discs from step ${step} to ${step - 1} without changing the input`, () => {
        const current: SolutionStep = {
          step,
          movedDisc: [...states[step]].findIndex(
            (peg, disc) => peg !== states[step - 1][disc],
          ),
          locations: [...states[step]].map((peg) =>
            peg === "A" ? 0
            : peg === "B" ? 1
            : 2,
          ),
          complete: step === states.length - 1,
        };
        const original = structuredClone(current);

        const actual = previousStep(current);

        deepStrictEqual(current, original);
        deepStrictEqual(actual, {
          step: step - 1,
          movedDisc:
            step === 1 ? null : (
              [...states[step - 1]].findIndex(
                (peg, disc) => peg !== states[step - 2][disc],
              )
            ),
          locations: [...states[step - 1]].map((peg) => "ABC".indexOf(peg)),
          complete: false,
        });
      });
    }

    it(`returns null before the initial ${discs}-disc state without changing it`, () => {
      const initial: SolutionStep = {
        step: 0,
        movedDisc: null,
        locations: Array.from({ length: discs }, () => 0),
        complete: false,
      };
      const expected = structuredClone(initial);

      deepStrictEqual(previousStep(initial), null);
      deepStrictEqual(previousStep(initial), null);
      deepStrictEqual(initial, expected);
    });
  }
});
describe("locationsAtStep", () => {
  for (const { discs, states } of solutions) {
    describe(`${discs} discs (${discs % 2 === 0 ? "even" : "odd"})`, () => {
      for (const [step, positions] of states.entries()) {
        it(`step ${step}: ${positions}`, () => {
          const expected: TowerState = {
            numberOfDiscs: discs,
            pegs: [
              [...positions].flatMap((peg, disc) =>
                peg === "A" ? [disc] : [],
              ),
              [...positions].flatMap((peg, disc) =>
                peg === "B" ? [disc] : [],
              ),
              [...positions].flatMap((peg, disc) =>
                peg === "C" ? [disc] : [],
              ),
            ],
          };
          const actual = discLocationsToTowerState(
            locationsAtStep(discs, step).locations,
          );

          deepStrictEqual(actual, expected);
        });
      }
    });
  }
});
