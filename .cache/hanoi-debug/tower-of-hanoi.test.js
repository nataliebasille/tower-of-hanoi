"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = require("node:assert");
const node_test_1 = require("node:test");
const tower_of_hanoi_1 = require("./tower-of-hanoi");
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
(0, node_test_1.describe)("solve", () => {
    (0, node_test_1.it)("starts at step zero with no moved disc", () => {
        (0, node_assert_1.deepStrictEqual)((0, tower_of_hanoi_1.solve)(3).next(), {
            done: false,
            value: { step: 0, movedDisc: null, locations: [0, 0, 0] },
        });
    });
    for (const { discs, states } of solutions) {
        (0, node_test_1.it)(`yields the optimal ${discs}-disc solution in order and then finishes`, () => {
            const iterator = (0, tower_of_hanoi_1.solve)(discs);
            for (const [step, positions] of states.entries()) {
                const result = iterator.next();
                (0, node_assert_1.strictEqual)(result.done, false);
                if (result.done)
                    throw new Error(`Missing step ${step}`);
                (0, node_assert_1.strictEqual)(result.value.step, step);
                (0, node_assert_1.deepStrictEqual)(result.value.locations, [...positions].map((peg) => "ABC".indexOf(peg)));
                if (step > 0) {
                    (0, node_assert_1.strictEqual)(result.value.movedDisc, [...positions].findIndex((peg, disc) => peg !== states[step - 1][disc]));
                }
            }
            (0, node_assert_1.strictEqual)(iterator.next().done, true);
            (0, node_assert_1.strictEqual)(iterator.next().done, true);
        });
        (0, node_test_1.it)(`preserves earlier states after completing the ${discs}-disc solution`, () => {
            const steps = [...(0, tower_of_hanoi_1.solve)(discs)];
            (0, node_assert_1.deepStrictEqual)(steps.map((step) => step.locations), states.map((positions) => [...positions].map((peg) => "ABC".indexOf(peg))));
        });
    }
});
(0, node_test_1.describe)("locationsAtStep", () => {
    for (const { discs, states } of solutions) {
        (0, node_test_1.describe)(`${discs} discs (${discs % 2 === 0 ? "even" : "odd"})`, () => {
            for (const [step, positions] of states.entries()) {
                (0, node_test_1.it)(`step ${step}: ${positions}`, () => {
                    const expected = {
                        numberOfDiscs: discs,
                        pegs: [
                            [...positions].flatMap((peg, disc) => peg === "A" ? [disc] : []),
                            [...positions].flatMap((peg, disc) => peg === "B" ? [disc] : []),
                            [...positions].flatMap((peg, disc) => peg === "C" ? [disc] : []),
                        ],
                    };
                    const actual = (0, tower_of_hanoi_1.discLocationsToTowerState)((0, tower_of_hanoi_1.locationsAtStep)(discs, step).locations);
                    (0, node_assert_1.deepStrictEqual)(actual, expected);
                });
            }
        });
    }
});
//# sourceMappingURL=tower-of-hanoi.test.js.map