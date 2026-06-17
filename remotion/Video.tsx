import { AbsoluteFill, Sequence } from 'remotion';
import Intro from './scenes/Intro';
import DashboardOverview from './scenes/DashboardOverview';
import KeyStats from './scenes/KeyStats';
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

      {/* Scene 2: Dashboard Overview (90-330 frames, 8s) */}
      <Sequence from={90} durationInFrames={240}>
        <DashboardOverview />
      </Sequence>

      {/* Scene 3: Key Stats (330-510 frames, 6s) */}
      <Sequence from={330} durationInFrames={180}>
        <KeyStats />
      </Sequence>

      {/* Scene 4: Charts Showcase (510-810 frames, 10s) */}
      <Sequence from={510} durationInFrames={300}>
        <ChartsShowcase />
      </Sequence>

      {/* Scene 5: Map (810-990 frames, 6s) */}
      <Sequence from={810} durationInFrames={180}>
        <MapScene />
      </Sequence>

      {/* Scene 6: Outro (990-1200 frames, 7s) */}
      <Sequence from={990} durationInFrames={210}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
}
