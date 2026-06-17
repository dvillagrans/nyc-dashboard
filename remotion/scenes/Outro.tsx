import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';

export default function Outro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main text animation
  const textOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textY = interpolate(frame, [10, 30], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // URL animation
  const urlOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const urlY = interpolate(frame, [30, 50], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Accent line
  const lineWidth = interpolate(frame, [20, 60], [0, 500], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Cursor blink on URL
  const cursorOpacity = Math.sin(frame * 0.2) > 0 ? 1 : 0;

  // Fade to black
  const fadeOut = interpolate(frame, [170, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: '#08080a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut,
      }}
    >
      {/* Main CTA text */}
      <h2
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 80,
          fontWeight: 800,
          color: '#e8e6e3',
          letterSpacing: '-0.02em',
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          marginBottom: 36,
        }}
      >
        Explore the{' '}
        <span style={{ color: '#e8b923' }}>Dashboard</span>
      </h2>

      {/* Gold line */}
      <div
        style={{
          width: lineWidth,
          height: 5,
          background: 'linear-gradient(90deg, transparent, #e8b923, transparent)',
          marginBottom: 48,
        }}
      />

      {/* URL */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
          background: '#111114',
          border: '1px solid #222225',
          padding: '24px 48px',
          borderRadius: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 22,
            color: '#6b6b6b',
          }}
        >
          🔒
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 26,
            color: '#e8b923',
            letterSpacing: '0.02em',
          }}
        >
          github.com/dvillagrans/nyc-dashboard
        </span>
        <span
          style={{
            display: 'inline-block',
            width: 3,
            height: 28,
            background: '#e8b923',
            marginLeft: 2,
            opacity: cursorOpacity,
          }}
        />
      </div>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 18,
          color: '#6b6b6b',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginTop: 36,
          opacity: interpolate(frame, [60, 80], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Built with Next.js · ECharts · MapLibre · DuckDB
      </p>
    </AbsoluteFill>
  );
}
