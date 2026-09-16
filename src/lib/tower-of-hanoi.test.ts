import {
  discLocationsToTowerState,
  locationsAtStep,
  type TowerState,
} from "./tower-of-hanoi";

export type TestResult = {
  name: string;
  passed: boolean;
  expected: TowerState;
  actual: TowerState | undefined;
  error?: string;
};

export type TestSuite =
  | "one-disc"
  | "two-discs"
  | "three-discs"
  | "four-discs"
  | "original";

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

const testSuites = {
  "one-disc": oneDiscSolutions,
  "two-discs": twoDiscSolutions,
  "three-discs": threeDiscSolutions,
  "four-discs": fourDiscSolutions,
  original: solutions,
};

// Call explicitly from application code or a script; importing runs no tests.
export function runStateAtStepTests(suite: TestSuite = "original"): TestResult[] {
  const results: TestResult[] = [];

  for (const { discs, states } of testSuites[suite]) {
    for (const [step, positions] of states.entries()) {
      const name = `${discs} discs (${discs % 2 === 0 ? "even" : "odd"}), step ${step}: ${positions}`;
      const expected: TowerState = {
        numberOfDiscs: discs,
        pegs: [
          [...positions].flatMap((peg, disc) => peg === "A" ? [disc] : []),
          [...positions].flatMap((peg, disc) => peg === "B" ? [disc] : []),
          [...positions].flatMap((peg, disc) => peg === "C" ? [disc] : []),
        ],
      };
      let actual: TowerState | undefined;

      try {
        actual = discLocationsToTowerState(locationsAtStep(discs, step));
        assertTowerState(actual, expected);
        results.push({ name, passed: true, expected, actual });
      } catch (error) {
        results.push({
          name,
          passed: false,
          expected,
          actual,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return results;
}

function assertTowerState(
  actual: TowerState,
  expected: TowerState,
): void {
  const discs = expected.numberOfDiscs;
  if (actual.numberOfDiscs !== discs) {
    throw new Error(`Expected ${discs} discs, got ${actual.numberOfDiscs}`);
  }

  if (
    actual.pegs.length !== 3 ||
    expected.pegs.some(
      (expectedPeg, peg) =>
        actual.pegs[peg].length !== expectedPeg.length ||
        expectedPeg.some((disc, index) => actual.pegs[peg][index] !== disc),
    )
  ) {
    throw new Error(
      "Disc positions do not match the expected state.",
    );
  }
}
