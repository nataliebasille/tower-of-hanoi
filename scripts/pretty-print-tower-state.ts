import type { TowerState } from "../src/lib/tower-of-hanoi";

export function prettyPrintTowerState(state: TowerState): string {
  const width = state.numberOfDiscs * 2 + 1;
  const center = (text: string) =>
    text.padStart(Math.floor((width + text.length) / 2)).padEnd(width);
  // Pegs list zero-based disc IDs from smallest to largest; disc 0 has size 1.
  const stacks = state.pegs.map((peg) => peg.map((disc) => disc + 1));
  const rows = Array.from({ length: state.numberOfDiscs }, (_, row) =>
    stacks
      .map((stack) => {
        const disc = stack[row - (state.numberOfDiscs - stack.length)];
        return center(disc === undefined ? "|" : "=".repeat(disc * 2 - 1));
      })
      .join("   "),
  );

  return [
    ...rows,
    state.pegs.map(() => "-".repeat(width)).join("   "),
    ["A", "B", "C"].map(center).join("   "),
  ].join("\n");
}

