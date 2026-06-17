import { AbsoluteFill, Sequence } from 'remotion';
import Intro from './scenes/Intro';
import DashboardOverview from './scenes/DashboardOverview';
import ChartsShowcase from './scenes/ChartsShowcase';
import MapScene from './scenes/MapScene';
import Outro from './scenes/Outro';

export default function DashboardVideo() {
  return (
    <AbsoluteFill style={{ background: '#08080a' }}>
      {/* Scene 1: Intro (0-90 frames, 3s) */}
      <Sequence from={0} durationInFrames={90}>
        <Intro />
      </Sequence>

      {/* Scene 2: Dashboard Overview with zooms (90-540 frames, 15s) */}
      <Sequence from={90} durationInFrames={450}>
        <DashboardOverview />
      </Sequence>

      {/* Scene 3: Charts Showcase (540-840 frames, 10s) */}
      <Sequence from={540} durationInFrames={300}>
        <ChartsShowcase />
      </Sequence>

      {/* Scene 4: Map (840-1020 frames, 6s) */}
      <Sequence from={840} durationInFrames={180}>
        <MapScene />
      </Sequence>

      {/* Scene 5: Outro (1020-1230 frames, 7s) */}
      <Sequence from={1020} durationInFrames={210}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
}
