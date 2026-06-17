import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';
import AnimatedCounter from '../components/AnimatedCounter';

const STATS = [
  { value: 8000, label: 'Total Trips', prefix: '', suffix: '', decimals: 0 },
  { value: 153548, label: 'Driver Income', prefix: '$', suffix: '', decimals: 0 },
  { value: 2, label: 'Operators', prefix: '', suffix: '', decimals: 0 },
  { value: 29, label: 'Unique Days', prefix: '', suffix: '', decimals: 0 },
];

export default function KeyStats() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(frame, [0, 15], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out at end
  const fadeOut = interpolate(frame, [165, 180], [1, 0], {
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
      {/* Title */}
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 14,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: '#e8b923',
          marginBottom: 48,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        February 2024 — Key Metrics
      </p>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 60,
          maxWidth: 1400,
        }}
      >
        {STATS.map((stat, index) => {
          const delay = 15 + index * 15;
          const cardOpacity = interpolate(frame, [delay, delay + 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const cardY = interpolate(frame, [delay, delay + 20], [50, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={stat.label}
              style={{
                textAlign: 'center',
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
              }}
            >
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals}
                startFrame={delay + 10}
                duration={50}
                fontSize={80}
              />
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: '#6b6b6b',
                  marginTop: 12,
                }}
              >
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          width: interpolate(frame, [60, 100], [0, 600], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 2,
          background: 'linear-gradient(90deg, transparent, #e8b923, transparent)',
          marginTop: 56,
        }}
      />
    </AbsoluteFill>
  );
}
