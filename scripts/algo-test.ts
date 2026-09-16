import { runStateAtStepTests, type TestSuite } from "../src/lib/tower-of-hanoi.test";
import { prettyPrintTowerState } from "./pretty-print-tower-state";
export { prettyPrintTowerState } from "./pretty-print-tower-state";

// Choose "one-disc", "two-discs", "three-discs", or "four-discs".
// Use "original" to run all 30 cases for 1–4 discs.
const testSuite: TestSuite = "four-discs";
const results = runStateAtStepTests(testSuite);
const passed = results.filter((result) => result.passed).length;
const passStyle = "\u001b[1;30;102m";
const failStyle = "\u001b[1;97;41m";
const resetStyle = "\u001b[0m";

console.log("TOWER OF HANOI — locationsAtStep\n");
console.log(`Suite: ${testSuite} (${results.length} cases)\n`);
console.log("Disc size increases with width. Pegs: A (start), B (spare), C (target).");

for (const result of results) {
  const expectedLines = prettyPrintTowerState(result.expected).split("\n");
  const actualLines = result.actual
    ? prettyPrintTowerState(result.actual).split("\n")
    : ["No state returned (function threw)."];
  const columnWidth = Math.max("EXPECTED".length, ...expectedLines.map((line) => line.length));

  console.log(`\n${"-".repeat(76)}`);
  const badge = result.passed
    ? `${passStyle}  ✓ PASS  ${resetStyle}`
    : `${failStyle}  ✗ FAIL  ${resetStyle}`;
  console.log(`${badge} ${result.name}\n`);
  console.log(`${"EXPECTED".padEnd(columnWidth)}    ACTUAL`);
  for (let row = 0; row < Math.max(expectedLines.length, actualLines.length); row++) {
    console.log(`${(expectedLines[row] ?? "").padEnd(columnWidth)}    ${actualLines[row] ?? ""}`);
  }
  if (result.error) console.log(`\nReason: ${result.error}`);
}

console.log(`\n${"=".repeat(76)}`);
console.log(
  `TOTAL: ${results.length} | ${passStyle} PASSED: ${passed} ${resetStyle} | ${failStyle} FAILED: ${results.length - passed} ${resetStyle}`,
);


