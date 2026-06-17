import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';

export default function Intro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = 'NYC Ride-Hailing Analytics';
  const subtitle = '8,000 trips · Feb 2024 · Uber & Lyft';

  // Typewriter effect
  const charsToShow = Math.floor(interpolate(frame, [15, 65], [0, title.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));

  // Cursor blink
  const cursorOpacity = frame < 65
    ? Math.sin(frame * 0.3) > 0 ? 1 : 0
    : interpolate(frame, [65, 70], [1, 0], { extrapolateRight: 'clamp' });

  // Subtitle fade in
  const subtitleOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleY = interpolate(frame, [55, 75], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Gold accent line
  const lineWidth = interpolate(frame, [40, 80], [0, 500], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out
  const fadeOut = interpolate(frame, [80, 90], [1, 0], {
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
      {/* Title with typewriter */}
      <div style={{ marginBottom: 36, minHeight: 70, padding: '0 60px', textAlign: 'center' }}>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 76,
            fontWeight: 800,
            color: '#e8e6e3',
            letterSpacing: '-0.02em',
          }}
        >
          {title.slice(0, charsToShow)}
        </span>
        <span
          style={{
            display: 'inline-block',
            width: 5,
            height: 72,
            background: '#e8b923',
            marginLeft: 4,
            opacity: cursorOpacity,
            verticalAlign: 'middle',
          }}
        />
      </div>

      {/* Gold accent line */}
      <div
        style={{
          width: lineWidth,
          height: 5,
          background: 'linear-gradient(90deg, #e8b923, #e8b923 70%, transparent)',
          marginBottom: 36,
        }}
      />

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 28,
          color: '#6b6b6b',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        {subtitle}
      </p>
    </AbsoluteFill>
  );
}
