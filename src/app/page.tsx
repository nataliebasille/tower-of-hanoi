import { HanoiDiscsControl } from "./_components/controls/hanoi-discs.control";
import { HanoiNextStepButton } from "./_components/controls/hanoi-next-step.control";
import { HanoiPlayButton } from "./_components/controls/hanoi-play-button.control";
import { HanoiResetButton } from "./_components/controls/hanoi-reset-button.control";
import { HanoiSpeedControl } from "./_components/controls/hanoi-speed.control";
import { PlaybackInfo } from "./_components/hanoi-playback-info";
import { HanoiPlayer } from "./_components/hanoi-player";
import { Status } from "./_components/hanoi-status";
import { HanoiTowerRenderer } from "./_components/hanoi-tower-renderer";

export default function Home() {
  return (
    <main className="hanoi">
      <section className="intro">
        <h1>
          Tower of Hanoi<span>.</span>
        </h1>
        <p>
          Choose the number of discs and playback speed, then press play to
          watch the solution.
        </p>
      </section>
      <HanoiPlayer>
        <div className="layout">
          <aside
            className="player-controls card-soft/surface"
            aria-label="Puzzle controls"
          >
            <div className="player-settings">
              <HanoiDiscsControl />
              <HanoiSpeedControl />
            </div>
            <div className="player-actions">
              <HanoiPlayButton />
              <HanoiResetButton />
              <HanoiNextStepButton />
            </div>
          </aside>
          <section className="visual-panel card-outline/surface">
            <div className="visual-heading">
              <Status />
            </div>
            <HanoiTowerRenderer />
            <PlaybackInfo />
          </section>
        </div>
      </HanoiPlayer>
    </main>
  );
}
