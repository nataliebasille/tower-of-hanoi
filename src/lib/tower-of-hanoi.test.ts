import { deepStrictEqual } from "node:assert";
import { describe, it } from "node:test";
import {
  discLocationsToTowerState,
  locationsAtStep,
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
            locationsAtStep(discs, step),
          );

          deepStrictEqual(actual, expected);
        });
      }
    });
  }
});
