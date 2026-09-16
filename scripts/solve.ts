import { discLocationsToTowerState, solve } from "../src/lib/tower-of-hanoi";
import { prettyPrintTowerState } from "./pretty-print-tower-state";

const numberOfDiscs = Number(process.argv[2] ?? 4);
const delayMs = Number(process.argv[3] ?? 500);

playSolution(numberOfDiscs, delayMs).catch((error: unknown) => {
  console.error(`Playback stopped: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});

async function playSolution(discs: number, delay: number): Promise<void> {
  if (!Number.isInteger(discs) || discs < 1 || discs > 30) {
    throw new Error("Provide an integer disc count from 1 to 30.");
  }
  if (!Number.isFinite(delay) || delay < 0 || delay > 2_147_483_647) {
    throw new Error("Provide a delay between 0 and 2147483647 milliseconds.");
  }

  const totalMoves = 2 ** discs - 1;
  let step = 0;
  console.log(`TOWER OF HANOI — ${discs} discs, ${totalMoves} moves`);
  console.log("A: start | B: spare | C: target. Press Ctrl+C to stop.\n");

  for (const locations of solve(discs)) {
    if (step > 0 && delay > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
    console.log(`Step ${step} / ${totalMoves}${step === 0 ? " (initial state)" : ""}`);
    console.log(`Disc locations: [${locations.join(", ")}]`);
    console.log(prettyPrintTowerState(discLocationsToTowerState(locations)));
    console.log();
    step++;
  }

  console.log(`Generator finished after ${step} states.`);
}
