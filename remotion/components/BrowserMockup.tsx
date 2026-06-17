import { ReactNode } from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface BrowserMockupProps {
  children: ReactNode;
  startFrame?: number;
}

export default function BrowserMockup({ children, startFrame = 0 }: BrowserMockupProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - startFrame);

  const scale = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 20,
      stiffness: 100,
      mass: 0.5,
    },
    durationInFrames: 30,
  });

  const opacity = interpolate(adjustedFrame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: 1800,
        background: '#1a1a1f',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #333',
        transform: `scale(${scale})`,
        opacity,
        boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '18px 24px',
          background: '#111114',
          borderBottom: '1px solid #222',
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 7 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#28c840' }} />
        </div>
        {/* URL bar */}
        <div
          style={{
            flex: 1,
            marginLeft: 16,
            background: '#0a0a0c',
            borderRadius: 6,
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: '#6b6b6b', fontSize: 16, fontFamily: "'IBM Plex Mono', monospace" }}>
            🔒
          </span>
          <span style={{ color: '#888', fontSize: 16, fontFamily: "'IBM Plex Mono', monospace" }}>
            localhost:3000
          </span>
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: 0, minHeight: 850 }}>
        {children}
      </div>
    </div>
  );
}
