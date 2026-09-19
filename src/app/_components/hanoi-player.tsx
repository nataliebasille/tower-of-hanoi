import { HanoiPlayback } from "./hanoi-playback";
import { HanoiPlayerProvider } from "./hanoi-player-context";

export function HanoiPlayer({ children }: { children: React.ReactNode }) {
  return (
    <HanoiPlayerProvider>
      <HanoiPlayback />
      {children}
    </HanoiPlayerProvider>
  );
}
